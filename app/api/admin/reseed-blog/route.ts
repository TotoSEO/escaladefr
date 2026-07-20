import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Re-seed du CONTENU des articles de blog depuis data/articles/<slug>.json
 * vers Supabase, sans terminal ni Python.
 *
 * Ce que ça fait :
 *  - Met à jour, pour chaque article DÉJÀ présent en base, les champs de
 *    contenu (h1, title, description, chapo, takeaways, body, faq, liens,
 *    cover_alt, word_count). C'est ce qui pousse les H1 réécrits en prod.
 *  - Ne touche JAMAIS au statut ni au calendrier (status, scheduled_at,
 *    published_at) : aucun article programmé n'est publié en avance.
 *  - Ne bumpe updated_at (donc le lastmod du sitemap) QUE pour les articles
 *    dont le contenu a réellement changé.
 *  - Invalide le cache ISR des pages modifiées.
 *
 * Auth (même principe que /api/cron/publish, zéro secret à configurer) :
 *  - User-Agent commençant par 'vercel-cron' (c'est ce qu'envoie le
 *    workflow GitHub "Re-seed des articles du blog").
 *  - Ou Authorization: Bearer <CRON_SECRET> / ?token=<CRON_SECRET> si défini.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ArticleJson = {
  slug: string;
  cocon: string;
  type_article: string;
  numero?: number;
  title: string;
  h1: string;
  description: string;
  chapo: string;
  takeaways: string[];
  body_blocks: unknown[];
  faq?: unknown;
  cover_alt: string;
  internal_links?: unknown;
};

const CONTENT_COLS =
  "slug,cocon,type_article,title,h1,description,chapo,takeaways,body_blocks,faq,internal_links,cover_alt,updated_at";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

/** Compte les mots du corps, comme seed_blog.py. */
function countWords(blocks: unknown[]): number {
  let total = 0;
  const add = (s: unknown) => {
    if (typeof s !== "string") return;
    const m = stripHtml(s).match(/\b[\wàâäéèêëîïôöùûüçœ'-]+\b/giu);
    total += m ? m.length : 0;
  };
  for (const b of blocks as Record<string, unknown>[]) {
    add(b.text);
    add(b.html);
    add(b.caption);
    add(b.title);
    if (Array.isArray(b.items)) {
      for (const it of b.items as Record<string, unknown>[]) {
        add(it.title);
        add(it.body);
      }
    }
  }
  return total;
}

/** Signature de contenu (mêmes champs que seed_blog.py) pour détecter un
 *  vrai changement et ne bumper updated_at que dans ce cas. */
function signature(a: {
  h1?: unknown;
  title?: unknown;
  description?: unknown;
  chapo?: unknown;
  takeaways?: unknown;
  body_blocks?: unknown;
  faq?: unknown;
  internal_links?: unknown;
}): string {
  return JSON.stringify([
    a.h1 ?? null,
    a.title ?? null,
    a.description ?? null,
    a.chapo ?? null,
    a.takeaways ?? null,
    a.body_blocks ?? null,
    a.faq ?? null,
    a.internal_links ?? null,
  ]);
}

export async function GET(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  const isVercelCron = ua.startsWith("vercel-cron");
  const authHeader = request.headers.get("authorization");
  const token = new URL(request.url).searchParams.get("token");
  const secret = process.env.CRON_SECRET;
  const hasValidAuth =
    !!secret &&
    (authHeader === `Bearer ${secret}` || token === secret);

  if (!isVercelCron && !hasValidAuth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 500 },
    );
  }

  // 1. Lire tous les fichiers articles.
  const dir = path.join(process.cwd(), "data", "articles");
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch (e) {
    return NextResponse.json(
      { error: `data/articles introuvable: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  // 2. État actuel en base (pour comparer et ne bumper que si changé).
  const { data: existingRows, error: fetchErr } = await supabase
    .from("blog_articles")
    .select(CONTENT_COLS);
  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  const existing = new Map(
    (existingRows ?? []).map((r) => [r.slug as string, r]),
  );

  const nowIso = new Date().toISOString();
  const updated: string[] = [];
  const unchanged: string[] = [];
  const missing: string[] = [];
  const errors: { slug: string; error: string }[] = [];

  for (const file of files) {
    const slug = file.replace(/\.json$/, "");
    const row = existing.get(slug);
    if (!row) {
      // Article pas encore en base (jamais publié/planifié) : on ne crée
      // rien ici pour ne pas court-circuiter le calendrier de publication.
      missing.push(slug);
      continue;
    }

    let art: ArticleJson;
    try {
      art = JSON.parse(await fs.readFile(path.join(dir, file), "utf-8"));
    } catch (e) {
      errors.push({ slug, error: `JSON invalide: ${(e as Error).message}` });
      continue;
    }

    const changed = signature(art) !== signature(row);
    if (!changed) {
      unchanged.push(slug);
      continue;
    }

    const payload: Record<string, unknown> = {
      cocon: art.cocon,
      type_article: art.type_article,
      numero: art.numero ?? null,
      title: art.title,
      h1: art.h1,
      description: art.description,
      chapo: art.chapo,
      takeaways: art.takeaways,
      body_blocks: art.body_blocks,
      faq: art.faq ?? null,
      internal_links: art.internal_links ?? null,
      cover_alt: art.cover_alt,
      cover_image: `/blog/${slug}.webp`,
      word_count: countWords(art.body_blocks),
      updated_at: nowIso,
      // On ne touche PAS : status, scheduled_at, published_at, author_*.
    };

    const { error: updErr } = await supabase
      .from("blog_articles")
      .update(payload)
      .eq("slug", slug);

    if (updErr) {
      errors.push({ slug, error: updErr.message });
    } else {
      updated.push(slug);
    }
  }

  // 3. Invalidation ISR des pages touchées.
  if (updated.length > 0) {
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    revalidatePath("/sitemap-blog.xml");
    for (const slug of updated) revalidatePath(`/blog/${slug}`);
  }

  return NextResponse.json({
    ok: errors.length === 0,
    updated: updated.length,
    unchanged: unchanged.length,
    missing: missing.length,
    errors,
    updatedSlugs: updated,
    at: nowIso,
  });
}
