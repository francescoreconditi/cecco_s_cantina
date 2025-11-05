// Componente per visualizzare la rappresentazione grafica del layout della cantina
interface CellarLayoutProps {
  nr_file: number;
  bottiglie_fila_dispari: number;
  bottiglie_fila_pari: number;
}

export function CellarLayout({
  nr_file,
  bottiglie_fila_dispari,
  bottiglie_fila_pari,
}: CellarLayoutProps) {
  // Calcola il totale delle bottiglie
  const nr_file_dispari = Math.ceil(nr_file / 2);
  const nr_file_pari = Math.floor(nr_file / 2);
  const totale_bottiglie = nr_file_dispari * bottiglie_fila_dispari + nr_file_pari * bottiglie_fila_pari;

  // Trova il numero massimo di bottiglie per fila per il layout
  const max_bottiglie = Math.max(bottiglie_fila_dispari, bottiglie_fila_pari);

  return (
    <div className="space-y-4">
      {/* Statistiche */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-gray-900 dark:text-slate-100">{nr_file}</span> file
          </span>
          <span className="text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-gray-900 dark:text-slate-100">{totale_bottiglie}</span> posti totali
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border border-wine-300 dark:border-wine-700 bg-wine-50 dark:bg-wine-900/30"></div>
            <span className="text-gray-600 dark:text-slate-400">Posto disponibile</span>
          </div>
        </div>
      </div>

      {/* Rappresentazione grafica */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="space-y-2">
            {Array.from({ length: nr_file }, (_, index) => {
              const filaNumber = index + 1;
              const isOddRow = filaNumber % 2 === 1;
              const bottiglie = isOddRow ? bottiglie_fila_dispari : bottiglie_fila_pari;

              return (
                <div key={index} className="flex items-center gap-2">
                  {/* Numero fila */}
                  <div className="flex-shrink-0 w-8 text-sm font-medium text-gray-600 dark:text-slate-400 text-right">
                    {filaNumber}
                  </div>

                  {/* Bottiglie */}
                  <div className="flex gap-1">
                    {Array.from({ length: bottiglie }, (_, bottleIndex) => (
                      <div
                        key={bottleIndex}
                        className="h-10 w-8 rounded border-2 border-wine-300 dark:border-wine-700 bg-wine-50 dark:bg-wine-900/30 hover:bg-wine-100 dark:hover:bg-wine-900/50 transition-colors cursor-pointer flex items-center justify-center"
                        title={`Fila ${filaNumber} - Posizione ${bottleIndex + 1}`}
                      >
                        <svg
                          className="h-5 w-5 text-wine-400 dark:text-wine-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 2h8c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1h-.5l-.71 14.97c-.02.55-.46.98-1 .98H10.2c-.55 0-.99-.44-1-.98L8.5 6H8c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1z" />
                        </svg>
                      </div>
                    ))}
                    {/* Spazi vuoti per allineamento */}
                    {bottiglie < max_bottiglie &&
                      Array.from({ length: max_bottiglie - bottiglie }, (_, emptyIndex) => (
                        <div
                          key={`empty-${emptyIndex}`}
                          className="h-10 w-8"
                        ></div>
                      ))}
                  </div>

                  {/* Info fila */}
                  <div className="flex-shrink-0 ml-2 text-xs text-gray-500 dark:text-slate-500">
                    {bottiglie} posti
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Note informative */}
      <div className="mt-4 rounded-md bg-wine-50 dark:bg-wine-900/20 border border-wine-200 dark:border-wine-800 p-3">
        <p className="text-xs text-wine-800 dark:text-wine-300">
          <strong>Configurazione:</strong> {nr_file_dispari} fil{nr_file_dispari === 1 ? "a" : "e"} dispari
          con {bottiglie_fila_dispari} posti + {nr_file_pari} fil{nr_file_pari === 1 ? "a" : "e"} pari
          con {bottiglie_fila_pari} posti = <strong>{totale_bottiglie} posti totali</strong>
        </p>
      </div>
    </div>
  );
}
