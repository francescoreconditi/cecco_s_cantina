// Componente filtri per la lista vini
interface WineFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterRegione: string;
  onRegioneChange: (regione: string) => void;
  filterTipologia: string;
  onTipologiaChange: (tipologia: string) => void;
  regioni: string[];
  tipologie: string[];
}

export function WineFilters({
  searchQuery,
  onSearchChange,
  filterRegione,
  onRegioneChange,
  filterTipologia,
  onTipologiaChange,
  regioni,
  tipologie,
}: WineFiltersProps) {
  const hasActiveFilters = searchQuery || filterRegione || filterTipologia;

  const clearFilters = () => {
    onSearchChange("");
    onRegioneChange("");
    onTipologiaChange("");
  };

  return (
    <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Ricerca */}
        <div className="md:col-span-2">
          <label htmlFor="search" className="sr-only">
            Cerca
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
              placeholder="Cerca per nome, produttore o denominazione..."
            />
          </div>
        </div>

        {/* Filtro Regione */}
        <div>
          <label htmlFor="regione" className="sr-only">
            Regione
          </label>
          <select
            id="regione"
            value={filterRegione}
            onChange={(e) => onRegioneChange(e.target.value)}
            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
          >
            <option value="">Tutte le regioni</option>
            {regioni.map((regione) => (
              <option key={regione} value={regione}>
                {regione}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Tipologia */}
        <div>
          <label htmlFor="tipologia" className="sr-only">
            Tipologia
          </label>
          <select
            id="tipologia"
            value={filterTipologia}
            onChange={(e) => onTipologiaChange(e.target.value)}
            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
          >
            <option value="">Tutte le tipologie</option>
            {tipologie.map((tipologia) => (
              <option key={tipologia} value={tipologia}>
                {tipologia}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pulsante reset filtri */}
      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-wine-600 hover:text-wine-700 font-medium"
          >
            Cancella filtri
          </button>
        </div>
      )}
    </div>
  );
}
