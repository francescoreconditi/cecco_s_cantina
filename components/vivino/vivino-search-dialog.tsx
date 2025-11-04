"use client";

import { useState } from "react";
import { X, Search, Loader2, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/lib/types/database";

type Wine = Database["public"]["Tables"]["wines"]["Row"];

interface VivinoSearchDialogProps {
  wine: Wine;
  onSuccess?: (updatedWine: Wine) => void;
}

interface VivinoPreview {
  id: number;
  name: string;
  winery: string | null;
  year: number | null;
  rating: number | null;
  rating_count: number | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  url: string;
}

export function VivinoSearchDialog({
  wine,
  onSuccess,
}: VivinoSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<VivinoPreview[]>([]);
  const [selectedWine, setSelectedWine] = useState<VivinoPreview | null>(null);

  const handleSearch = async () => {
    setIsSearching(true);
    setResults([]);
    setSelectedWine(null);

    try {
      // Chiama API proxy per cercare su Vivino
      const response = await fetch(`/api/vivino/search?wineId=${wine.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la ricerca");
      }

      if (data.success && data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        toast.error("Nessun risultato trovato su Vivino");
      }
    } catch (error) {
      console.error("Errore ricerca Vivino:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante la ricerca su Vivino"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    if (!selectedWine) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/vivino/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wineId: wine.id,
          vivinoData: {
            id: selectedWine.id,
            rating: selectedWine.rating,
            rating_count: selectedWine.rating_count,
            price: selectedWine.price,
            currency: selectedWine.currency,
            url: selectedWine.url,
            image_url: selectedWine.image_url,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante il salvataggio");
      }

      if (data.success && data.wine) {
        toast.success("Dati Vivino salvati con successo!");
        onSuccess?.(data.wine);
        setIsOpen(false);
        setResults([]);
        setSelectedWine(null);
      }
    } catch (error) {
      console.error("Errore salvataggio Vivino:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante il salvataggio dei dati Vivino"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Auto-ricerca all'apertura
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
        Cerca su Vivino
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Ricerca Vivino
                  </h2>
                  <p className="text-sm text-gray-500">{wine.nome}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Loading State */}
              {isSearching && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600" />
                  <p className="mt-4 text-sm text-gray-600">
                    Cercando su Vivino...
                  </p>
                </div>
              )}

              {/* Results List */}
              {!isSearching && results.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Seleziona il vino corretto dai risultati:
                  </p>
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => setSelectedWine(result)}
                        className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                          selectedWine?.id === result.id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Image */}
                          {result.image_url && (
                            <div className="flex-shrink-0">
                              <img
                                src={result.image_url}
                                alt={result.name}
                                className="h-24 w-16 rounded object-contain"
                              />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {result.name}
                              </h3>
                              {result.winery && (
                                <p className="text-sm text-gray-600">
                                  {result.winery}
                                </p>
                              )}
                              {result.year && (
                                <p className="text-xs text-gray-500">
                                  Annata: {result.year}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              {/* Rating */}
                              {result.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-semibold">
                                    {result.rating.toFixed(1)}
                                  </span>
                                  {result.rating_count && (
                                    <span className="text-xs text-gray-500">
                                      ({result.rating_count.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Price */}
                              {result.price && (
                                <div className="text-sm font-semibold text-green-600">
                                  {result.currency === "EUR" ? "€" : result.currency}
                                  {result.price.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedWine && (
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        Conferma per salvare questi dati nel tuo vino.
                        I dati vengono aggiornati automaticamente ogni 7 giorni.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* No Results State */}
              {!isSearching && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm text-gray-600">
                    Nessun risultato trovato
                  </p>
                  <button
                    onClick={handleSearch}
                    className="mt-4 text-sm text-red-600 hover:text-red-700"
                  >
                    Riprova
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-200 p-6">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedWine || isSaving}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvataggio...
                  </span>
                ) : (
                  "Salva Dati Vivino"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
