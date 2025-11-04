// Skeleton loaders per stati di caricamento

// Skeleton base
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className || ""}`}
      aria-label="Caricamento..."
    />
  );
}

// Skeleton per card vino
export function WineCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

// Skeleton per lista vini
export function WineListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <WineCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton per card bottiglia
export function BottleCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

// Skeleton per lista bottiglie
export function BottleListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <BottleCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton per card degustazione
export function TastingCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

// Skeleton per lista degustazioni
export function TastingListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <TastingCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton per albero ubicazioni
export function LocationTreeSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-white p-4 shadow">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          {i % 2 === 0 && (
            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Skeleton per dettaglio pagina
export function PageDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>

      {/* Contenuto */}
      <div className="space-y-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <Skeleton className="mb-4 h-6 w-1/4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Skeleton className="mb-2 h-4 w-1/3" />
              <Skeleton className="h-5 w-2/3" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-1/3" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <Skeleton className="mb-4 h-6 w-1/4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton per KPI cards dashboard
export function KPICardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// Skeleton per dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Grafici */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <Skeleton className="mb-4 h-6 w-1/3" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <Skeleton className="mb-4 h-6 w-1/3" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
}

// Skeleton per form
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          <div>
            <Skeleton className="mb-2 h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Skeleton className="mb-2 h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
