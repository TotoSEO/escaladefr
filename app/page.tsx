import { getSupabase } from "@/lib/supabase";

export const revalidate = 3600; // ISR : régénération max 1× / heure

type DepartementRow = { departement: string | null };

type Stats = {
  total: number | null;
  avecGps: number | null;
  topDepartements: { departement: string; count: number }[];
  error: string | null;
};

async function getStats(): Promise<Stats> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      total: null,
      avecGps: null,
      topDepartements: [],
      error: "Supabase non configuré.",
    };
  }

  try {
    const [totalRes, gpsRes, depRes] = await Promise.all([
      supabase
        .from("sites_naturels")
        .select("*", { count: "exact", head: true }),
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

    const departements = (depRes.data as DepartementRow[] | null) ?? [];
    const counts = new Map<string, number>();
    for (const row of departements) {
      if (!row.departement) continue;
      counts.set(row.departement, (counts.get(row.departement) ?? 0) + 1);
    }
    const topDepartements = [...counts.entries()]
      .map(([departement, count]) => ({ departement, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: totalRes.count,
      avecGps: gpsRes.count,
      topDepartements,
      error: totalRes.error?.message ?? null,
    };
  } catch (e) {
    return {
      total: null,
      avecGps: null,
      topDepartements: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export default async function Home() {
  const stats = await getStats();

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          escalade-france.fr
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Annuaire des sites naturels d&apos;escalade et des salles d&apos;escalade
          en France — en construction.
        </p>

        <section className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat
            label="Sites recensés"
            value={stats.total !== null ? stats.total.toLocaleString("fr-FR") : "—"}
          />
          <Stat
            label="Avec GPS"
            value={stats.avecGps !== null ? stats.avecGps.toLocaleString("fr-FR") : "—"}
          />
          <Stat
            label="Départements couverts"
            value={stats.topDepartements.length > 0 ? `${stats.topDepartements.length}+` : "—"}
          />
        </section>

        {stats.topDepartements.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Top départements</h2>
            <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
              {stats.topDepartements.map((d) => (
                <li
                  key={d.departement}
                  className="flex items-center justify-between py-2"
                >
                  <span>{d.departement}</span>
                  <span className="font-mono text-sm text-gray-500">
                    {d.count}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {stats.error && (
          <p className="mt-12 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            ⚠ {stats.error}
          </p>
        )}

        <footer className="mt-16 text-sm text-gray-500">
          Données issues du recensement FFME (Fédération Française de Montagne
          et d&apos;Escalade).
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
    </div>
  );
}
