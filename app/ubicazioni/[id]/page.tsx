"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useLocation,
  useDeleteLocation,
  useChildLocations,
} from "@/lib/hooks/use-locations";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  MapPin,
  Thermometer,
  Droplets,
  Package,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export default function DettaglioUbicazionePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: location, isLoading, error } = useLocation(id);
  const { data: childLocations } = useChildLocations(id);
  const deleteLocation = useDeleteLocation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteLocation.mutateAsync(id);
      router.push("/ubicazioni");
    } catch (error) {
      console.error("Errore eliminazione ubicazione:", error);
    }
  };

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

  if (error || !location) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-800 dark:text-red-300">
            Ubicazione non trovata o errore nel caricamento
          </p>
          <Link
            href="/ubicazioni"
            className="mt-4 inline-block text-sm text-wine-600 hover:text-wine-700"
          >
            Torna alla lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs />
        </div>
      </div>

      {/* Header Pagina */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/ubicazioni"
              className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            >
              ← Torna alla lista
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/ubicazioni/${id}/modifica`}
                className="rounded-md border border-wine-600 px-4 py-2 text-sm font-semibold text-wine-600 hover:bg-wine-50"
              >
                Modifica
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-md border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Titolo */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <MapPin className="mt-1 h-8 w-8 flex-shrink-0 text-wine-600 dark:text-wine-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
                {location.nome}
              </h1>
              {location.descrizione && (
                <p className="mt-2 text-lg text-gray-600 dark:text-slate-400">
                  {location.descrizione}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Griglia informazioni */}
        <div className="space-y-6">
          {/* Condizioni Ambientali */}
          {(location.temperatura !== null ||
            location.umidita !== null ||
            location.note_ambientali) && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                <AlertCircle className="h-5 w-5 text-wine-600 dark:text-wine-500" />
                Condizioni Ambientali
              </h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {location.temperatura !== null && (
                  <div>
                    <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                      <Thermometer className="h-4 w-4" />
                      Temperatura
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {location.temperatura}°C
                    </dd>
                    {location.temperatura < 12 || location.temperatura > 16 ? (
                      <dd className="mt-1 text-xs text-orange-600">
                        Temperatura non ottimale (ideale: 12-16°C)
                      </dd>
                    ) : (
                      <dd className="mt-1 text-xs text-green-600">
                        Temperatura ottimale
                      </dd>
                    )}
                  </div>
                )}
                {location.umidita !== null && (
                  <div>
                    <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                      <Droplets className="h-4 w-4" />
                      Umidità
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {location.umidita}%
                    </dd>
                    {location.umidita < 60 || location.umidita > 80 ? (
                      <dd className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                        Umidità non ottimale (ideale: 60-80%)
                      </dd>
                    ) : (
                      <dd className="mt-1 text-xs text-green-600 dark:text-green-400">
                        Umidità ottimale
                      </dd>
                    )}
                  </div>
                )}
                {location.note_ambientali && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Note Ambientali
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">
                      {location.note_ambientali}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Capacità */}
          {location.capacita_massima !== null && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                <Package className="h-5 w-5 text-wine-600 dark:text-wine-500" />
                Capacità
              </h2>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Capacità Massima
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                  {location.capacita_massima} bottiglie
                </dd>
              </div>
            </div>
          )}

          {/* Sotto-ubicazioni */}
          {childLocations && childLocations.length > 0 && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
                Sotto-ubicazioni ({childLocations.length})
              </h2>
              <div className="space-y-2">
                {childLocations.map((child) => (
                  <Link
                    key={child.id}
                    href={`/ubicazioni/${child.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-wine-600 dark:text-wine-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">
                          {child.nome}
                        </p>
                        {child.descrizione && (
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            {child.descrizione}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 p-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>
                Creato il{" "}
                {new Date(location.created_at).toLocaleDateString("it-IT")}
              </span>
              <span>
                Aggiornato il{" "}
                {new Date(location.updated_at).toLocaleDateString("it-IT")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Conferma eliminazione
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
              Sei sicuro di voler eliminare "{location.nome}"?{" "}
              {childLocations && childLocations.length > 0 && (
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  Attenzione: questa ubicazione contiene{" "}
                  {childLocations.length} sotto-ubicazion
                  {childLocations.length === 1 ? "e" : "i"}.
                </span>
              )}{" "}
              Questa azione non può essere annullata.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLocation.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleteLocation.isPending ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
