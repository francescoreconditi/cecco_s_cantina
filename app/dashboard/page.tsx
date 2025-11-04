"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWineStats, useWines } from "@/lib/hooks/use-wines";
import { useBottleStats, useBottles } from "@/lib/hooks/use-bottles";
import { useTastings } from "@/lib/hooks/use-tastings";
import { useLocations } from "@/lib/hooks/use-locations";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import { WineRegionChart } from "@/components/dashboard/wine-region-chart";
import { WineTypeChart } from "@/components/dashboard/wine-type-chart";
import { MaturityTimeline } from "@/components/dashboard/maturity-timeline";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: stats, isLoading } = useWineStats();
  const { data: wines } = useWines();
  const { data: bottleStats, isLoading: bottleStatsLoading } = useBottleStats();
  const { data: bottles } = useBottles();
  const { data: tastings, isLoading: tastingsLoading } = useTastings();
  const { data: locations, isLoading: locationsLoading } = useLocations();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/accedi");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkUser();
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Benvenuto nella tua cantina!
          </h2>
          <p className="mt-2 text-gray-600">
            Gestisci i tuoi vini, bottiglie e degustazioni
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/vini">
            <div className="group rounded-lg bg-white p-6 shadow transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-wine-600">
                Vini
              </h3>
              <p className="mt-2 text-3xl font-bold text-wine-600">
                {isLoading ? "..." : stats?.total || 0}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {stats?.total
                  ? `${stats.total} vin${stats.total === 1 ? "o" : "i"} nel catalogo`
                  : "Nessun vino ancora catalogato"}
              </p>
            </div>
          </Link>

          <Link href="/bottiglie">
            <div className="group rounded-lg bg-white p-6 shadow transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-wine-600">
                Bottiglie
              </h3>
              <p className="mt-2 text-3xl font-bold text-wine-600">
                {bottleStatsLoading ? "..." : bottleStats?.total || 0}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {bottleStats?.total
                  ? `${bottleStats.total} bottigli${bottleStats.total === 1 ? "a" : "e"} in inventario`
                  : "Inventario vuoto"}
              </p>
            </div>
          </Link>

          <Link href="/degustazioni">
            <div className="group rounded-lg bg-white p-6 shadow transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-wine-600">
                Degustazioni
              </h3>
              <p className="mt-2 text-3xl font-bold text-wine-600">
                {tastingsLoading ? "..." : tastings?.length || 0}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {tastings?.length
                  ? `${tastings.length} degustazion${tastings.length === 1 ? "e" : "i"} registrat${tastings.length === 1 ? "a" : "e"}`
                  : "Nessuna degustazione registrata"}
              </p>
            </div>
          </Link>

          <Link href="/ubicazioni">
            <div className="group rounded-lg bg-white p-6 shadow transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-wine-600">
                Ubicazioni
              </h3>
              <p className="mt-2 text-3xl font-bold text-wine-600">
                {locationsLoading ? "..." : locations?.length || 0}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {locations?.length
                  ? `${locations.length} ubicazion${locations.length === 1 ? "e" : "i"} definit${locations.length === 1 ? "a" : "e"}`
                  : "Nessuna ubicazione definita"}
              </p>
            </div>
          </Link>
        </div>

        {/* Sezione Grafici */}
        {wines && wines.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Statistiche e Analisi
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Grafico Vini per Regione */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Vini per Regione
                </h3>
                <WineRegionChart wines={wines} />
              </div>

              {/* Grafico Vini per Tipologia */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Vini per Tipologia
                </h3>
                <WineTypeChart wines={wines} />
              </div>
            </div>

            {/* Grafico Maturità Bottiglie */}
            {bottles && bottles.length > 0 && (
              <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Stato Maturità Bottiglie
                </h3>
                <MaturityTimeline bottles={bottles} />
              </div>
            )}
          </div>
        )}

        {(!stats || stats.total === 0) && (
          <div className="mt-8 rounded-lg bg-wine-50 p-6">
            <h3 className="text-lg font-semibold text-wine-900">
              Inizia ora!
            </h3>
            <p className="mt-2 text-sm text-wine-800">
              La tua cantina è vuota. Inizia aggiungendo i tuoi primi vini al
              catalogo.
            </p>
            <Link
              href="/vini/nuovo"
              className="mt-4 inline-flex rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500"
            >
              Aggiungi il primo vino
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
