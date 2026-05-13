import { getSupabase } from "@/lib/supabase";
import { Hero } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { TopDepartements } from "@/components/home/top-departements";
import { Missions } from "@/components/home/missions";

export const revalidate = 3600;

type DepartementRow = { departement: string | null };

type Stats = {
  total: number | null;
  avecGps: number | null;
  topDepartements: { departement: string; count: number }[];
};

async function getStats(): Promise<Stats> {
  const supabase = getSupabase();
  if (!supabase) {
    return { total: null, avecGps: null, topDepartements: [] };
  }

  try {
    const [totalRes, gpsRes, depRes] = await Promise.all([
      supabase.from("sites_naturels").select("*", { count: "exact", head: true }),
      supabase
        .from("sites_naturels")
        .select("*", { count: "exact", head: true })
        .not("latitude", "is", null),
      supabase
        .from("sites_naturels")
        .select("departement")
        .not("departement", "is", null)
        .limit(5000),
    ]);

    const rows = (depRes.data as DepartementRow[] | null) ?? [];
    const counts = new Map<string, number>();
    for (const row of rows) {
      if (!row.departement) continue;
      counts.set(row.departement, (counts.get(row.departement) ?? 0) + 1);
    }
    const topDepartements = [...counts.entries()]
      .map(([departement, count]) => ({ departement, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      total: totalRes.count,
      avecGps: gpsRes.count,
      topDepartements,
    };
  } catch {
    return { total: null, avecGps: null, topDepartements: [] };
  }
}

export default async function Home() {
  const stats = await getStats();

  return (
    <>
      <Hero totalSites={stats.total} />
      <StatsStrip
        total={stats.total}
        avecGps={stats.avecGps}
        departements={stats.topDepartements.length || null}
      />
      <TopDepartements items={stats.topDepartements} />
      <Missions />
    </>
  );
}
