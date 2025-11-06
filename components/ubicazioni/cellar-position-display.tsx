// Componente per visualizzare le posizioni occupate nella cantina (sola lettura)
import { CellarPosition } from "./cellar-position-selector";

interface CellarPositionDisplayProps {
  nr_file: number;
  bottiglie_fila_dispari: number;
  bottiglie_fila_pari: number;
  positions: CellarPosition[];
}

export function CellarPositionDisplay({
  nr_file,
  bottiglie_fila_dispari,
  bottiglie_fila_pari,
  positions,
}: CellarPositionDisplayProps) {
  // Calcola il totale delle bottiglie
  const nr_file_dispari = Math.ceil(nr_file / 2);
  const nr_file_pari = Math.floor(nr_file / 2);
  const totale_bottiglie = nr_file_dispari * bottiglie_fila_dispari + nr_file_pari * bottiglie_fila_pari;

  // Trova il numero massimo di bottiglie per fila per il layout
  const max_bottiglie = Math.max(bottiglie_fila_dispari, bottiglie_fila_pari);

  const isPositionOccupied = (riga: number, colonna: number) => {
    return positions.some((p) => p.riga === riga && p.colonna === colonna);
  };

  return (
    <div className="space-y-4">
      {/* Statistiche */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-gray-900 dark:text-slate-100">{positions.length}</span> posizion{positions.length === 1 ? "e" : "i"} occupate
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/50"></div>
            <span className="text-gray-600 dark:text-slate-400">Libera</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-wine-600 dark:border-wine-500 bg-wine-200 dark:bg-wine-800"></div>
            <span className="text-gray-600 dark:text-slate-400">Occupata</span>
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
                  <div className="flex gap-1 justify-center flex-1">
                    {Array.from({ length: bottiglie }, (_, bottleIndex) => {
                      const colonnaNumber = bottleIndex + 1;
                      const isOccupied = isPositionOccupied(filaNumber, colonnaNumber);

                      return (
                        <div
                          key={bottleIndex}
                          className="flex items-center justify-center"
                          title={`Fila ${filaNumber} - Posizione ${colonnaNumber}${isOccupied ? " (occupata)" : ""}`}
                        >
                          <div
                            className={`h-8 w-8 rounded-full border-2 ${
                              isOccupied
                                ? "border-wine-600 dark:border-wine-500 bg-wine-200 dark:bg-wine-800"
                                : "border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/50"
                            }`}
                          />
                        </div>
                      );
                    })}
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

      {/* Riepilogo posizioni */}
      {positions.length > 0 && (
        <div className="mt-4 rounded-md bg-wine-50 dark:bg-wine-900/20 border border-wine-200 dark:border-wine-800 p-3">
          <p className="text-xs font-medium text-wine-900 dark:text-wine-200 mb-2">
            Posizioni occupate:
          </p>
          <div className="flex flex-wrap gap-2">
            {positions.map((pos, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-wine-100 dark:bg-wine-900/50 px-2 py-1 text-xs text-wine-800 dark:text-wine-200"
              >
                Fila {pos.riga}, Pos. {pos.colonna}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
