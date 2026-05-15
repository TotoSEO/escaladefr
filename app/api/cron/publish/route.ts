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
 * Protégé par le header Authorization: Bearer <CRON_SECRET>.
 * Vercel injecte automatiquement ce header pour les routes /api/cron/*.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
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

  // Invalide les caches ISR des pages concernées
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
  }
  for (const cocon of cocons) {
    revalidatePath(`/blog/categorie/${cocon}`);
  }

  return NextResponse.json({
    published: slugs.length,
    slugs,
    at: nowIso,
  });
}
