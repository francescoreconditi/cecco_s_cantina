// Card per visualizzare un vino nella lista
import Link from "next/link";
import type { Database } from "@/lib/types/database";
import { VivinoCard } from "@/components/vivino/vivino-card";

type Wine = Database["public"]["Tables"]["wines"]["Row"];

interface WineCardProps {
  wine: Wine;
}

export function WineCard({ wine }: WineCardProps) {
  return (
    <Link href={`/vini/${wine.id}`}>
      <div className="group relative overflow-hidden rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700 transition-all hover:shadow-lg dark:hover:shadow-slate-900">
        {/* Badge tipologia */}
        {wine.tipologia && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex rounded-full bg-wine-100 dark:bg-wine-900/50 px-3 py-1 text-xs font-medium text-wine-800 dark:text-wine-200">
              {wine.tipologia}
            </span>
          </div>
        )}

        {/* Contenuto principale */}
        <div className="space-y-3">
          {/* Nome vino */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 group-hover:text-wine-600 dark:group-hover:text-wine-400">
              {wine.nome}
            </h3>
            {wine.produttore && (
              <p className="text-sm text-gray-600 dark:text-slate-400">{wine.produttore}</p>
            )}
          </div>

          {/* Denominazione */}
          {wine.denominazione && (
            <p className="text-sm font-medium text-wine-700 dark:text-wine-400">
              {wine.denominazione}
            </p>
          )}

          {/* Dettagli */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-slate-400">
            {wine.annata && (
              <span className="flex items-center">
                <svg
                  className="mr-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {wine.annata}
              </span>
            )}

            {wine.regione && (
              <span className="flex items-center">
                <svg
                  className="mr-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {wine.regione}
              </span>
            )}

            {wine.grado_alcolico && (
              <span>{wine.grado_alcolico}% vol</span>
            )}
          </div>

          {/* Vitigni */}
          {wine.vitigni && wine.vitigni.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {wine.vitigni.slice(0, 3).map((vitigno, index) => (
                <span
                  key={index}
                  className="inline-flex rounded-md bg-gray-100 dark:bg-slate-700 px-2 py-1 text-xs text-gray-700 dark:text-slate-300"
                >
                  {vitigno}
                </span>
              ))}
              {wine.vitigni.length > 3 && (
                <span className="inline-flex items-center text-xs text-gray-500 dark:text-slate-400">
                  +{wine.vitigni.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Vivino Info (compact) */}
          <div className="pt-2">
            <VivinoCard wine={wine} compact />
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 text-gray-400 dark:text-slate-500 transition-transform group-hover:translate-x-1">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
