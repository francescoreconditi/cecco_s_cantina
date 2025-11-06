"use client";

interface WineGlassLoaderProps {
  message?: string;
}

export function WineGlassLoader({ message = "Caricamento..." }: WineGlassLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="mb-6 inline-block">
          {/* Contenitore per animazione */}
          <div className="relative h-32 w-24 animate-sway">
            {/* SVG Bicchiere di vino */}
            <svg
              viewBox="0 0 100 150"
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Definizione del gradiente per il vino */}
              <defs>
                <linearGradient id="wineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#722F37" />
                  <stop offset="100%" stopColor="#8B1538" />
                </linearGradient>

                {/* Clip path per il riempimento */}
                <clipPath id="glassClip">
                  <path d="M 30 20 L 70 20 L 60 80 L 40 80 Z M 45 80 L 55 80 L 55 120 L 45 120 Z" />
                </clipPath>
              </defs>

              {/* Contorno del bicchiere */}
              <g className="stroke-wine-700 dark:stroke-wine-400" strokeWidth="2" fill="none">
                {/* Coppa */}
                <path d="M 30 20 L 70 20 L 60 80 L 40 80 Z" />
                {/* Stelo */}
                <line x1="50" y1="80" x2="50" y2="120" />
                {/* Base */}
                <line x1="35" y1="120" x2="65" y2="120" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Vino che si riempie */}
              <g clipPath="url(#glassClip)">
                <rect
                  x="25"
                  y="20"
                  width="50"
                  height="100"
                  fill="url(#wineGradient)"
                  className="animate-fill-wine"
                  opacity="0.9"
                />
                {/* Effetto di brillantezza */}
                <ellipse
                  cx="45"
                  cy="50"
                  rx="8"
                  ry="4"
                  fill="white"
                  opacity="0.3"
                  className="animate-shimmer"
                />
              </g>
            </svg>
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-slate-300">
          {message}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Un momento di pazienza...
        </p>
      </div>
    </div>
  );
}
