"use client";

import { useState } from "react";
import { useBottles } from "@/lib/hooks/use-bottles";
import { useLocations } from "@/lib/hooks/use-locations";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Barcode, Search, LayoutGrid, List } from "lucide-react";
import { ExportMenu, ExportIcons } from "@/components/export/export-menu";
import { exportInventoryExcel, exportInventoryCSV } from "@/lib/export/excel-inventory";
import { generateBottleLabels } from "@/lib/export/qr-labels";
import { WineGlassLoader } from "@/components/ui/wine-glass-loader";

export default function BottigliePage() {
  const { data: bottles, isLoading } = useBottles();
  const { data: locations } = useLocations();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [filterStato, setFilterStato] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Filtra bottiglie localmente
  const filteredBottles = bottles?.filter((bottle) => {
    const matchSearch =
      !searchQuery ||
      bottle.wine.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bottle.wine.produttore?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bottle.fornitore?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bottle.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchLocation = !filterLocation || bottle.location_id === filterLocation;
    const matchStato = !filterStato || bottle.stato_maturita === filterStato;

    return matchSearch && matchLocation && matchStato;
  });

  // Estrai stati e ubicazioni uniche per i filtri
  const statiMaturita = Array.from(
    new Set(bottles?.map((b) => b.stato_maturita).filter(Boolean) as string[])
  ).sort();

  if (isLoading) {
    return <WineGlassLoader message="Caricamento bottiglie..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Le Mie Bottiglie
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {filteredBottles?.length || 0} bottigli
                {filteredBottles?.length === 1 ? "a" : "e"} in inventario
              </p>
            </div>
            <div className="flex gap-3">
              <ExportMenu
                options={[
                  {
                    id: "excel-inventory",
                    label: "Inventario Excel",
                    icon: ExportIcons.Excel,
                    description: "Export completo con statistiche",
                    action: async () => {
                      if (filteredBottles && filteredBottles.length > 0) {
                        await exportInventoryExcel(filteredBottles, {
                          format: "xlsx",
                          includeValuation: true,
                        });
                      }
                    },
                  },
                  {
                    id: "csv-inventory",
                    label: "Inventario CSV",
                    icon: ExportIcons.CSV,
                    description: "Export semplice formato CSV",
                    action: async () => {
                      if (filteredBottles && filteredBottles.length > 0) {
                        await exportInventoryCSV(filteredBottles);
                      }
                    },
                  },
                  {
                    id: "qr-labels",
                    label: "Etichette QR",
                    icon: ExportIcons.QR,
                    description: "Stampa etichette con QR code",
                    action: async () => {
                      if (filteredBottles && filteredBottles.length > 0) {
                        await generateBottleLabels(filteredBottles, {
                          labelSize: "medium",
                          includeBarcode: true,
                          includePrice: false,
                        });
                      }
                    },
                  },
                ]}
                variant="secondary"
              />
              <Link
                href="/bottiglie/nuova"
                className="rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white hover:bg-wine-500"
              >
                + Aggiungi Bottiglia
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri e ricerca */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-4 shadow dark:shadow-slate-900/50">
          <div className="flex items-end gap-4">
            <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Ricerca testuale */}
              <div className="lg:col-span-2">
                <label htmlFor="search" className="sr-only">
                  Cerca
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 py-2 pl-10 pr-3 text-sm focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                    placeholder="Cerca per nome, produttore, fornitore, barcode..."
                  />
                </div>
              </div>

              {/* Filtro Ubicazione */}
              <div>
                <label htmlFor="location-filter" className="sr-only">
                  Ubicazione
                </label>
                <select
                  id="location-filter"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 py-2 pl-3 pr-10 text-sm focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                >
                  <option value="">Tutte le ubicazioni</option>
                  {locations?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Stato Maturità */}
              <div>
                <label htmlFor="stato-filter" className="sr-only">
                  Stato Maturità
                </label>
                <select
                  id="stato-filter"
                  value={filterStato}
                  onChange={(e) => setFilterStato(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 py-2 pl-3 pr-10 text-sm focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                >
                  <option value="">Tutti gli stati</option>
                  {statiMaturita.map((stato) => (
                    <option key={stato} value={stato}>
                      {stato}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggle visualizzazione */}
            <div className="flex rounded-md border border-gray-300 dark:border-slate-600 overflow-hidden">
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "card"
                    ? "bg-wine-600 text-white"
                    : "bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                }`}
                title="Vista a schede"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-wine-600 text-white"
                    : "bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                }`}
                title="Vista a righe"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Badge filtri attivi */}
          {(searchQuery || filterLocation || filterStato) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-wine-100 dark:bg-wine-900/50 px-3 py-1 text-sm text-wine-800 dark:text-wine-200">
                  Ricerca: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-wine-900 dark:hover:text-wine-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterLocation && (
                <span className="inline-flex items-center gap-1 rounded-full bg-wine-100 dark:bg-wine-900/50 px-3 py-1 text-sm text-wine-800 dark:text-wine-200">
                  Ubicazione: {locations?.find((l) => l.id === filterLocation)?.nome}
                  <button
                    onClick={() => setFilterLocation("")}
                    className="hover:text-wine-900 dark:hover:text-wine-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterStato && (
                <span className="inline-flex items-center gap-1 rounded-full bg-wine-100 dark:bg-wine-900/50 px-3 py-1 text-sm text-wine-800 dark:text-wine-200">
                  Stato: {filterStato}
                  <button
                    onClick={() => setFilterStato("")}
                    className="hover:text-wine-900 dark:hover:text-wine-100"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterLocation("");
                  setFilterStato("");
                }}
                className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
              >
                Cancella tutti
              </button>
            </div>
          )}
        </div>

        {/* Lista bottiglie */}
        {filteredBottles && filteredBottles.length > 0 ? (
          viewMode === "card" ? (
            // Vista a schede
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBottles.map((bottle) => (
                <Link key={bottle.id} href={`/bottiglie/${bottle.id}`}>
                  <div className="group overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50 transition-all hover:shadow-lg dark:hover:shadow-slate-900/70">
                    {bottle.foto_etichetta_url && (
                      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-slate-700">
                        <Image
                          src={bottle.foto_etichetta_url}
                          alt={bottle.wine.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      {bottle.wine.nome}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {bottle.wine.produttore}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                      {bottle.wine.annata && (
                        <span>{bottle.wine.annata}</span>
                      )}
                      {bottle.wine.annata && bottle.prezzo_acquisto && (
                        <span>•</span>
                      )}
                      {bottle.prezzo_acquisto && (
                        <span className="font-semibold text-wine-600 dark:text-wine-400">
                          {new Intl.NumberFormat("it-IT", {
                            style: "currency",
                            currency: "EUR",
                          }).format(bottle.prezzo_acquisto)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        Quantità: {bottle.quantita}
                      </span>
                      {bottle.barcode && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                          <Barcode className="h-3 w-3" />
                          {bottle.barcode}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Vista a righe
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 shadow dark:shadow-slate-900/50 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Vino
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Anno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Prezzo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Quantità
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Stato
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredBottles.map((bottle) => (
                    <tr
                      key={bottle.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/bottiglie/${bottle.id}`} className="block">
                          <div className="flex items-center gap-3">
                            {bottle.foto_etichetta_url && (
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-slate-700">
                                <Image
                                  src={bottle.foto_etichetta_url}
                                  alt={bottle.wine.nome}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-slate-100">
                                {bottle.wine.nome}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                {bottle.wine.produttore}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {bottle.wine.annata || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-wine-600 dark:text-wine-400">
                        {bottle.prezzo_acquisto
                          ? new Intl.NumberFormat("it-IT", {
                              style: "currency",
                              currency: "EUR",
                            }).format(bottle.prezzo_acquisto)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {bottle.quantita}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {bottle.stato_maturita || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="mt-12 text-center">
            <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">
              Nessuna bottiglia trovata
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {searchQuery || filterLocation || filterStato
                ? "Prova a modificare i filtri di ricerca"
                : "Inizia aggiungendo la tua prima bottiglia"}
            </p>
            {!bottles?.length && (
              <Link
                href="/bottiglie/nuova"
                className="mt-6 inline-flex rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white hover:bg-wine-500"
              >
                Aggiungi la prima bottiglia
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
