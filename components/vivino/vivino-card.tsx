"use client";

import { Star, ExternalLink, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import type { Database } from "@/lib/types/database";

type Wine = Database["public"]["Tables"]["wines"]["Row"];

interface VivinoCardProps {
  wine: Wine;
  compact?: boolean;
}

export function VivinoCard({ wine, compact = false }: VivinoCardProps) {
  // Se non ci sono dati Vivino, non mostrare nulla
  if (!wine.vivino_id && !wine.vivino_rating) {
    return null;
  }

  const hasData = wine.vivino_rating || wine.vivino_price || wine.vivino_url;
  if (!hasData) return null;

  const formatPrice = () => {
    if (!wine.vivino_price) return null;

    // Gestisci currency come stringa o oggetto
    let currencySymbol = "€";
    if (wine.vivino_currency) {
      if (typeof wine.vivino_currency === 'string') {
        currencySymbol = wine.vivino_currency === "EUR" ? "€" : wine.vivino_currency;
      } else if (typeof wine.vivino_currency === 'object') {
        // Se è un oggetto, usa il prefix o il code
        currencySymbol = (wine.vivino_currency as any).prefix || (wine.vivino_currency as any).code || "€";
      }
    }

    return `${currencySymbol}${wine.vivino_price.toFixed(2)}`;
  };

  const formatRating = () => {
    if (!wine.vivino_rating) return null;
    return wine.vivino_rating.toFixed(1);
  };

  const lastUpdated = wine.vivino_last_updated
    ? new Date(wine.vivino_last_updated).toLocaleDateString("it-IT")
    : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {/* Logo Vivino */}
        <div className="flex items-center gap-1 rounded bg-red-50 px-2 py-1">
          <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
          <span className="text-xs font-semibold text-red-600">Vivino</span>
        </div>

        {/* Rating */}
        {wine.vivino_rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{formatRating()}</span>
            {wine.vivino_rating_count && (
              <span className="text-gray-500">({wine.vivino_rating_count})</span>
            )}
          </div>
        )}

        {/* Prezzo */}
        {wine.vivino_price && (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-semibold">{formatPrice()}</span>
          </div>
        )}

        {/* Link */}
        {wine.vivino_url && (
          <a
            href={wine.vivino_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-wine-600 hover:text-wine-700"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm">
      {/* Header con logo Vivino */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
          <span className="font-semibold text-red-600">Dati Vivino</span>
        </div>

        {wine.vivino_url && (
          <a
            href={wine.vivino_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-wine-600 transition-colors hover:text-wine-700"
          >
            Vedi su Vivino
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Contenuto */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Rating */}
        {wine.vivino_rating && (
          <div className="rounded-md bg-white p-3">
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4" />
              <span>Valutazione</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {formatRating()}
                </span>
                <span className="text-sm text-gray-500">/5</span>
              </div>
              {wine.vivino_rating_count && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>{wine.vivino_rating_count.toLocaleString()} voti</span>
                </div>
              )}
            </div>
            {/* Stelle visuali */}
            <div className="mt-2 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    wine.vivino_rating && star <= Math.round(wine.vivino_rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Prezzo */}
        {wine.vivino_price && (
          <div className="rounded-md bg-white p-3">
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Prezzo medio</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice()}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Prezzi dal mercato
            </div>
          </div>
        )}
      </div>

      {/* Immagine Vivino (se diversa da quella locale) */}
      {wine.vivino_image_url &&
        wine.vivino_image_url !== wine.foto_etichetta_url && (
          <div className="mt-3 rounded-md bg-white p-2">
            <p className="mb-2 text-xs text-gray-600">Immagine da Vivino:</p>
            <div className="relative h-32 w-full overflow-hidden rounded">
              <Image
                src={wine.vivino_image_url}
                alt={wine.nome}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

      {/* Footer con data aggiornamento */}
      {lastUpdated && (
        <div className="mt-3 border-t border-gray-200 pt-2 text-xs text-gray-500">
          Ultimo aggiornamento: {lastUpdated}
        </div>
      )}
    </div>
  );
}

// Componente placeholder quando non ci sono dati Vivino
export function VivinoPlaceholder() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
      <svg className="mx-auto h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
      </svg>
      <p className="mt-2 text-sm font-medium text-gray-700">
        Nessun dato Vivino disponibile
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Cerca questo vino su Vivino per vedere rating e prezzi
      </p>
    </div>
  );
}
