import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

/**
 * Cron de publication automatique des articles planifiés.
 *
 * Appelé quotidiennement par Vercel Cron (cf. vercel.json).
 * Pour chaque article en status='scheduled' dont scheduled_at <= now,
 * passe le status à 'published' et fixe published_at = scheduled_at.
 *
 * Authentification :
 *  - En prod Vercel : l'user-agent 'vercel-cron/*' authentifie automatiquement
 *    (zéro config requise côté utilisateur).
 *  - En manuel : Authorization: Bearer <CRON_SECRET> si CRON_SECRET est défini.
 *  - Si rien des deux, 401.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  const isVercelCron = ua.startsWith("vercel-cron");
  const authHeader = request.headers.get("authorization");
  const hasValidAuth =
    process.env.CRON_SECRET !== undefined &&
    process.env.CRON_SECRET !== "" &&
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isVercelCron && !hasValidAuth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

  const nowIso = new Date().toISOString();

  const { data: toPublish, error: selectError } = await supabase
    .from("blog_articles")
    .select("slug,scheduled_at,cocon")
    .eq("status", "scheduled")
    .lte("scheduled_at", nowIso);

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (!toPublish || toPublish.length === 0) {
    return NextResponse.json({ published: 0, slugs: [] });
  }

  const slugs = toPublish.map((a) => a.slug);
  const cocons = Array.from(new Set(toPublish.map((a) => a.cocon)));

  const { error: updateError } = await supabase
    .from("blog_articles")
    .update({ status: "published", published_at: nowIso })
    .in("slug", slugs);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Récupère TOUS les articles publiés pour invalider leurs caches.
  // Nécessaire car resolveInternalLinks() peut désormais activer des liens
  // vers les nouveaux articles publiés depuis n'importe quel autre article.
  const { data: allPublished } = await supabase
    .from("blog_articles")
    .select("slug,cocon")
    .eq("status", "published")
    .lte("published_at", nowIso);

  // Invalidation ISR
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/a-propos");

  // Toutes les pages article (les anciennes peuvent contenir des liens vers
  // les nouvelles, qui passent de texte plain à <a> cliquable).
  if (allPublished) {
    for (const a of allPublished as { slug: string; cocon: string }[]) {
      revalidatePath(`/blog/${a.slug}`);
    }
  }

  // Toutes les pages cocon (compteurs, listing) — pas seulement celles du
  // nouvel article, car le bloc nav "9 catégories" sur /blog peut dépendre
  // d'un compteur global.
  const allCocons = new Set([
    ...cocons,
    ...(allPublished ?? []).map((a: { cocon: string }) => a.cocon),
  ]);
  for (const c of allCocons) {
    revalidatePath(`/blog/categorie/${c}`);
  }

  return NextResponse.json({
    published: slugs.length,
    slugs,
    revalidated: {
      articles: allPublished?.length ?? 0,
      cocons: allCocons.size,
    },
    at: nowIso,
  });
}
