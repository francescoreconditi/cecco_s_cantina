// Componente interattivo per selezionare posizioni nella cantina
"use client";

import { useState, useEffect } from "react";

export interface CellarPosition {
  riga: number;
  colonna: number;
}

interface CellarPositionSelectorProps {
  nr_file: number;
  bottiglie_fila_dispari: number;
  bottiglie_fila_pari: number;
  quantita: number;
  selectedPositions?: CellarPosition[];
  onPositionsChange: (positions: CellarPosition[]) => void;
  occupiedPositions?: CellarPosition[];
}

export function CellarPositionSelector({
  nr_file,
  bottiglie_fila_dispari,
  bottiglie_fila_pari,
  quantita,
  selectedPositions = [],
  onPositionsChange,
  occupiedPositions = [],
}: CellarPositionSelectorProps) {
  const [selected, setSelected] = useState<CellarPosition[]>(selectedPositions);

  useEffect(() => {
    setSelected(selectedPositions);
  }, [selectedPositions]);

  const handlePositionClick = (riga: number, colonna: number) => {
    const positionKey = `${riga}-${colonna}`;
    const isSelected = selected.some((p) => p.riga === riga && p.colonna === colonna);
    const isOccupied = occupiedPositions.some((p) => p.riga === riga && p.colonna === colonna);

    if (isOccupied) {
      // Non permettere di selezionare posizioni occupate
      return;
    }

    let newSelected: CellarPosition[];
    if (isSelected) {
      // Deseleziona
      newSelected = selected.filter((p) => !(p.riga === riga && p.colonna === colonna));
    } else {
      // Seleziona solo se non abbiamo raggiunto il limite
      if (selected.length < quantita) {
        newSelected = [...selected, { riga, colonna }];
      } else {
        // Già raggiunto il limite, mostra un feedback visivo
        return;
      }
    }

    setSelected(newSelected);
    onPositionsChange(newSelected);
  };

  // Calcola il totale delle bottiglie
  const nr_file_dispari = Math.ceil(nr_file / 2);
  const nr_file_pari = Math.floor(nr_file / 2);
  const totale_bottiglie = nr_file_dispari * bottiglie_fila_dispari + nr_file_pari * bottiglie_fila_pari;

  // Trova il numero massimo di bottiglie per fila per il layout
  const max_bottiglie = Math.max(bottiglie_fila_dispari, bottiglie_fila_pari);

  const isPositionSelected = (riga: number, colonna: number) => {
    return selected.some((p) => p.riga === riga && p.colonna === colonna);
  };

  const isPositionOccupied = (riga: number, colonna: number) => {
    return occupiedPositions.some((p) => p.riga === riga && p.colonna === colonna);
  };

  return (
    <div className="space-y-4">
      {/* Statistiche e Istruzioni */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-gray-900 dark:text-slate-100">{selected.length}</span> / {quantita} selezionate
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/50"></div>
            <span className="text-gray-600 dark:text-slate-400">Libera</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-wine-600 dark:border-wine-500 bg-wine-200 dark:bg-wine-800"></div>
            <span className="text-gray-600 dark:text-slate-400">Selezionata</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-slate-600"></div>
            <span className="text-gray-600 dark:text-slate-400">Occupata</span>
          </div>
        </div>
      </div>

      {/* Messaggio di selezione */}
      {selected.length < quantita && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Seleziona {quantita - selected.length} posizion{quantita - selected.length === 1 ? "e" : "i"} dalla cantina
          </p>
        </div>
      )}

      {selected.length === quantita && (
        <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
          <p className="text-sm text-green-800 dark:text-green-300">
            Tutte le posizioni sono state selezionate!
          </p>
        </div>
      )}

      {/* Rappresentazione grafica interattiva */}
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
                      const isSelected = isPositionSelected(filaNumber, colonnaNumber);
                      const isOccupied = isPositionOccupied(filaNumber, colonnaNumber);

                      return (
                        <button
                          type="button"
                          key={bottleIndex}
                          onClick={() => handlePositionClick(filaNumber, colonnaNumber)}
                          disabled={isOccupied}
                          className="flex items-center justify-center p-1"
                          title={
                            isOccupied
                              ? "Posizione occupata"
                              : isSelected
                              ? `Fila ${filaNumber} - Posizione ${colonnaNumber} (selezionata)`
                              : `Fila ${filaNumber} - Posizione ${colonnaNumber}`
                          }
                        >
                          <div
                            className={`h-8 w-8 rounded-full border-2 transition-all ${
                              isOccupied
                                ? "bg-gray-300 dark:bg-slate-600 border-gray-400 dark:border-slate-500 cursor-not-allowed opacity-50"
                                : isSelected
                                ? "border-wine-600 dark:border-wine-500 bg-wine-200 dark:bg-wine-800 hover:bg-wine-300 dark:hover:bg-wine-700"
                                : "border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900/70 cursor-pointer"
                            }`}
                          />
                        </button>
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

      {/* Riepilogo posizioni selezionate */}
      {selected.length > 0 && (
        <div className="mt-4 rounded-md bg-wine-50 dark:bg-wine-900/20 border border-wine-200 dark:border-wine-800 p-3">
          <p className="text-xs font-medium text-wine-900 dark:text-wine-200 mb-2">
            Posizioni selezionate:
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((pos, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-md bg-wine-100 dark:bg-wine-900/50 px-2 py-1 text-xs text-wine-800 dark:text-wine-200"
              >
                Fila {pos.riga}, Pos. {pos.colonna}
                <button
                  type="button"
                  onClick={() => handlePositionClick(pos.riga, pos.colonna)}
                  className="ml-1 hover:text-wine-900 dark:hover:text-wine-100"
                  title="Rimuovi"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
