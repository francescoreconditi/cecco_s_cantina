"use client";

import { useState } from "react";
import { useTastings } from "@/lib/hooks/use-tastings";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Calendar, Users, UtensilsCrossed, PartyPopper, Search } from "lucide-react";

export default function DegustazioniPage() {
  const { data: tastings, isLoading } = useTastings();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnno, setFilterAnno] = useState<string>("");
  const [filterPunteggioMin, setFilterPunteggioMin] = useState<string>("");

  // Filtra degustazioni localmente
  const filteredTastings = tastings?.filter((tasting) => {
    const matchSearch =
      !searchQuery ||
      tasting.wine.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tasting.wine.produttore?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tasting.occasione?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tasting.abbinamento_cibo?.toLowerCase().includes(searchQuery.toLowerCase());

    const tastingYear = new Date(tasting.data).getFullYear().toString();
    const matchAnno = !filterAnno || tastingYear === filterAnno;

    const matchPunteggio =
      !filterPunteggioMin ||
      (tasting.punteggio !== null &&
        tasting.punteggio >= parseInt(filterPunteggioMin));

    return matchSearch && matchAnno && matchPunteggio;
  });

  // Estrai anni unici per i filtri
  const anni = Array.from(
    new Set(
      tastings?.map((t) => new Date(t.data).getFullYear().toString())
    )
  ).sort((a, b) => b.localeCompare(a)); // Ordine decrescente

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-wine-200 dark:border-wine-800 border-t-wine-600 dark:border-t-wine-500"></div>
          <p className="text-gray-600 dark:text-slate-400">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Le Mie Degustazioni
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {filteredTastings?.length || 0} degustazion
                {filteredTastings?.length === 1 ? "e" : "i"} registrate
              </p>
            </div>
            <Link
              href="/degustazioni/nuova"
              className="rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white hover:bg-wine-500"
            >
              + Nuova Degustazione
            </Link>
          </div>
        </div>
      </div>

      {/* Filtri e ricerca */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-4 shadow dark:shadow-slate-900/50">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  placeholder="Cerca per vino, produttore, occasione, cibo..."
                />
              </div>
            </div>

            {/* Filtro Anno */}
            <div>
              <label htmlFor="anno-filter" className="sr-only">
                Anno
              </label>
              <select
                id="anno-filter"
                value={filterAnno}
                onChange={(e) => setFilterAnno(e.target.value)}
                className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 py-2 pl-3 pr-10 text-sm focus:border-wine-500 focus:outline-none focus:ring-wine-500"
              >
                <option value="">Tutti gli anni</option>
                {anni.map((anno) => (
                  <option key={anno} value={anno}>
                    {anno}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Punteggio Minimo */}
            <div>
              <label htmlFor="punteggio-filter" className="sr-only">
                Punteggio minimo
              </label>
              <select
                id="punteggio-filter"
                value={filterPunteggioMin}
                onChange={(e) => setFilterPunteggioMin(e.target.value)}
                className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 py-2 pl-3 pr-10 text-sm focus:border-wine-500 focus:outline-none focus:ring-wine-500"
              >
                <option value="">Tutti i punteggi</option>
                <option value="90">90+ punti</option>
                <option value="85">85+ punti</option>
                <option value="80">80+ punti</option>
                <option value="75">75+ punti</option>
                <option value="70">70+ punti</option>
              </select>
            </div>
          </div>

          {/* Badge filtri attivi */}
          {(searchQuery || filterAnno || filterPunteggioMin) && (
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
              {filterAnno && (
                <span className="inline-flex items-center gap-1 rounded-full bg-wine-100 dark:bg-wine-900/50 px-3 py-1 text-sm text-wine-800 dark:text-wine-200">
                  Anno: {filterAnno}
                  <button
                    onClick={() => setFilterAnno("")}
                    className="hover:text-wine-900 dark:hover:text-wine-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterPunteggioMin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-wine-100 dark:bg-wine-900/50 px-3 py-1 text-sm text-wine-800 dark:text-wine-200">
                  Punteggio: {filterPunteggioMin}+
                  <button
                    onClick={() => setFilterPunteggioMin("")}
                    className="hover:text-wine-900 dark:hover:text-wine-100"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterAnno("");
                  setFilterPunteggioMin("");
                }}
                className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
              >
                Cancella tutti
              </button>
            </div>
          )}
        </div>

        {/* Lista degustazioni */}
        {filteredTastings && filteredTastings.length > 0 ? (
          <div className="space-y-4">
            {filteredTastings.map((tasting) => (
              <Link
                key={tasting.id}
                href={`/degustazioni/${tasting.id}`}
                className="block"
              >
                <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50 hover:shadow-md dark:hover:shadow-slate-900/70 transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 hover:text-wine-600 dark:hover:text-wine-400">
                          {tasting.wine.nome}
                        </h3>
                        {tasting.punteggio && (
                          <span className="inline-flex items-center rounded-full bg-wine-100 dark:bg-wine-900/50 px-3 py-1 text-sm font-medium text-wine-800 dark:text-wine-200">
                            {tasting.punteggio}/100
                          </span>
                        )}
                      </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {tasting.wine.produttore}
                      {tasting.wine.annata && ` - ${tasting.wine.annata}`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(tasting.data).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      {tasting.occasione && (
                        <span className="flex items-center gap-1.5">
                          <PartyPopper className="h-4 w-4" />
                          {tasting.occasione}
                        </span>
                      )}
                      {tasting.abbinamento_cibo && (
                        <span className="flex items-center gap-1.5">
                          <UtensilsCrossed className="h-4 w-4" />
                          {tasting.abbinamento_cibo}
                        </span>
                      )}
                      {tasting.partecipanti &&
                        tasting.partecipanti.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            {tasting.partecipanti.length}{" "}
                            partecipant{tasting.partecipanti.length === 1 ? "e" : "i"}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
                {tasting.note_generali && (
                  <div className="mt-4 border-t border-gray-200 dark:border-slate-700 pt-4">
                    <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-3">
                      {tasting.note_generali}
                    </p>
                  </div>
                )}
              </div>
            </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">
              Nessuna degustazione trovata
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {searchQuery || filterAnno || filterPunteggioMin
                ? "Prova a modificare i filtri di ricerca"
                : "Inizia a registrare le tue degustazioni"}
            </p>
            {!tastings?.length && (
              <Link
                href="/degustazioni/nuova"
                className="mt-6 inline-flex rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white hover:bg-wine-500"
              >
                Prima degustazione
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
