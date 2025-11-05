"use client";

import { useState } from "react";
import { useWines } from "@/lib/hooks/use-wines";
import Link from "next/link";
import { WineCard } from "@/components/vini/wine-card";
import { WineFilters } from "@/components/vini/wine-filters";
import { Header } from "@/components/layout/header";
import { ExportMenu, ExportIcons } from "@/components/export/export-menu";
import { exportWineCatalogPDF } from "@/lib/export/pdf-catalog";

export default function ViniPage() {
  const { data: wines, isLoading, error } = useWines();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegione, setFilterRegione] = useState<string>("");
  const [filterTipologia, setFilterTipologia] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Filtra vini localmente
  const filteredWines = wines?.filter((wine) => {
    const matchSearch =
      !searchQuery ||
      wine.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wine.produttore?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wine.denominazione?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRegione = !filterRegione || wine.regione === filterRegione;
    const matchTipologia =
      !filterTipologia || wine.tipologia === filterTipologia;

    return matchSearch && matchRegione && matchTipologia;
  });

  // Estrai regioni e tipologie uniche per i filtri
  const regioni = Array.from(
    new Set(wines?.map((w) => w.regione).filter(Boolean) as string[])
  ).sort();

  const tipologie = Array.from(
    new Set(wines?.map((w) => w.tipologia).filter(Boolean) as string[])
  ).sort();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-wine-200 dark:border-wine-800 border-t-wine-600 dark:border-t-wine-500"></div>
          <p className="text-gray-600 dark:text-slate-400">Caricamento vini...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-800 dark:text-red-300">
            Errore nel caricamento dei vini:{" "}
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
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">I Miei Vini</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {filteredWines?.length || 0} vin
                {filteredWines?.length === 1 ? "o" : "i"} nel catalogo
              </p>
            </div>
            <div className="flex gap-3">
              <ExportMenu
                options={[
                  {
                    id: "pdf-catalog",
                    label: "Catalogo PDF",
                    icon: ExportIcons.PDF,
                    description: "Export catalogo completo con dettagli",
                    action: async () => {
                      if (filteredWines && filteredWines.length > 0) {
                        await exportWineCatalogPDF(filteredWines, {
                          includeStats: true,
                          includePhotos: true,
                        });
                      }
                    },
                  },
                ]}
                variant="secondary"
              />
              <Link
                href="/vini/nuovo"
                className="rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500"
              >
                + Aggiungi Vino
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri e ricerca */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WineFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterRegione={filterRegione}
          onRegioneChange={setFilterRegione}
          filterTipologia={filterTipologia}
          onTipologiaChange={setFilterTipologia}
          regioni={regioni}
          tipologie={tipologie}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Lista vini */}
        {filteredWines && filteredWines.length > 0 ? (
          viewMode === "card" ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWines.map((wine) => (
                <WineCard key={wine.id} wine={wine} />
              ))}
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 shadow dark:shadow-slate-900/50">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400"
                    >
                      Vino
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400"
                    >
                      Anno
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400"
                    >
                      Regione
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400"
                    >
                      Tipologia
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400"
                    >
                      Denominazione
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {filteredWines.map((wine) => (
                    <tr
                      key={wine.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/vini/${wine.id}`}
                          className="group flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-slate-100 group-hover:text-wine-600 dark:group-hover:text-wine-400 transition-colors truncate">
                              {wine.nome}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-slate-400 truncate">
                              {wine.produttore}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                        {wine.annata || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                        {wine.regione || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                        {wine.tipologia || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                        <div className="max-w-xs truncate">
                          {wine.denominazione || "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="mt-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-200">
              Nessun vino trovato
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {searchQuery || filterRegione || filterTipologia
                ? "Prova a modificare i filtri di ricerca"
                : "Inizia aggiungendo il tuo primo vino al catalogo"}
            </p>
            {!wines?.length && (
              <div className="mt-6">
                <Link
                  href="/vini/nuovo"
                  className="inline-flex items-center rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500"
                >
                  Aggiungi il primo vino
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
