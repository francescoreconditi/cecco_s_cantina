"use client";

import { useState } from "react";
import { useLocationsTree } from "@/lib/hooks/use-locations";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { MapPin, ChevronRight, ChevronDown, Plus } from "lucide-react";
import type { Database } from "@/lib/types/database";
import { WineGlassLoader } from "@/components/ui/wine-glass-loader";

type Location = Database["public"]["Tables"]["locations"]["Row"];
type LocationWithChildren = Location & { children: LocationWithChildren[] };

// Componente ricorsivo per mostrare l'albero delle ubicazioni
function LocationTreeNode({ location }: { location: LocationWithChildren }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = location.children && location.children.length > 0;

  return (
    <div className="ml-4">
      <div className="group flex items-start gap-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-slate-900/50 transition-shadow hover:shadow-md dark:hover:shadow-slate-900/70">
        {/* Icona espandi/comprimi */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 flex-shrink-0 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        )}
        {!hasChildren && <div className="h-5 w-5 flex-shrink-0" />}

        {/* Icona ubicazione */}
        <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-wine-600 dark:text-wine-500" />

        {/* Contenuto */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/ubicazioni/${location.id}`}
            className="block group-hover:text-wine-600 dark:group-hover:text-wine-400"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {location.nome}
            </h3>
            {location.descrizione && (
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {location.descrizione}
              </p>
            )}
          </Link>

          {/* Metadati */}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-slate-400">
            {location.temperatura !== null && (
              <span>Temp: {location.temperatura}°C</span>
            )}
            {location.umidita !== null && (
              <span>Umidità: {location.umidita}%</span>
            )}
            {location.capacita_massima !== null && (
              <span>Capacità: {location.capacita_massima} bottiglie</span>
            )}
          </div>
        </div>
      </div>

      {/* Figli (ricorsivo) */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2 border-l-2 border-wine-200 dark:border-wine-800 pl-4">
          {location.children.map((child) => (
            <LocationTreeNode key={child.id} location={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function UbicazioniPage() {
  const { data: locationsTree, isLoading, error } = useLocationsTree();
  const [searchQuery, setSearchQuery] = useState("");

  // Funzione ricorsiva per filtrare l'albero
  const filterTree = (
    nodes: LocationWithChildren[],
    query: string
  ): LocationWithChildren[] => {
    if (!query) return nodes;

    return nodes
      .map((node) => {
        const matchesName = node.nome
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesDescription =
          node.descrizione?.toLowerCase().includes(query.toLowerCase()) ||
          false;

        const filteredChildren = filterTree(node.children || [], query);

        if (matchesName || matchesDescription || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          } as LocationWithChildren;
        }
        return null;
      })
      .filter((node): node is LocationWithChildren => node !== null);
  };

  const filteredTree = filterTree((locationsTree || []) as LocationWithChildren[], searchQuery);

  if (isLoading) {
    return <WineGlassLoader message="Caricamento ubicazioni..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-800 dark:text-red-300">
            Errore nel caricamento delle ubicazioni:{" "}
            {error instanceof Error ? error.message : "Errore sconosciuto"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      {/* Header Pagina */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Le Mie Ubicazioni
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Gestisci i luoghi di conservazione della tua cantina
              </p>
            </div>
            <Link
              href="/ubicazioni/nuova"
              className="inline-flex items-center gap-2 rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500"
            >
              <Plus className="h-4 w-4" />
              Nuova Ubicazione
            </Link>
          </div>
        </div>
      </div>

      {/* Barra di ricerca */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Cerca ubicazioni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-4 py-2 focus:border-wine-500 focus:outline-none focus:ring-2 focus:ring-wine-500"
          />
        </div>

        {/* Albero ubicazioni */}
        {filteredTree && filteredTree.length > 0 ? (
          <div className="space-y-3">
            {filteredTree.map((location) => (
              <LocationTreeNode key={location.id} location={location} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">
              Nessuna ubicazione trovata
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {searchQuery
                ? "Prova a modificare il termine di ricerca"
                : "Inizia creando la tua prima ubicazione"}
            </p>
            {!locationsTree?.length && (
              <div className="mt-6">
                <Link
                  href="/ubicazioni/nuova"
                  className="inline-flex items-center gap-2 rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500"
                >
                  <Plus className="h-4 w-4" />
                  Crea la prima ubicazione
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
