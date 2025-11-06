"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasting, useDeleteTasting } from "@/lib/hooks/use-tastings";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Calendar, Users, UtensilsCrossed, PartyPopper, Wine } from "lucide-react";
import { WineGlassLoader } from "@/components/ui/wine-glass-loader";

export default function DettaglioDegustazionePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: tasting, isLoading, error } = useTasting(id);
  const deleteTasting = useDeleteTasting();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTasting.mutateAsync(id);
      router.push("/degustazioni");
    } catch (error) {
      console.error("Errore eliminazione degustazione:", error);
    }
  };

  if (isLoading) {
    return <WineGlassLoader message="Caricamento degustazione..." />;
  }

  if (error || !tasting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-800 dark:text-red-300">
            Degustazione non trovata o errore nel caricamento
          </p>
          <Link
            href="/degustazioni"
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
              href="/degustazioni"
              className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            >
              ← Torna alla lista
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/degustazioni/${id}/modifica`}
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
        {/* Titolo e punteggio */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
                {tasting.wine.nome}
              </h1>
              <p className="mt-2 text-xl text-gray-600 dark:text-slate-400">
                {tasting.wine.produttore}
                {tasting.wine.annata && ` - ${tasting.wine.annata}`}
              </p>
            </div>
            {tasting.punteggio && (
              <div className="text-center">
                <div className="text-5xl font-bold text-wine-600 dark:text-wine-500">
                  {tasting.punteggio}
                </div>
                <div className="text-sm text-gray-500 dark:text-slate-400">/100</div>
              </div>
            )}
          </div>
        </div>

        {/* Foto Degustazione */}
        {tasting.foto_degustazione_url && (
          <div className="mb-8 rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Foto Degustazione
            </h2>
            <div className="relative h-96 w-full overflow-hidden rounded-lg">
              <Image
                src={tasting.foto_degustazione_url}
                alt="Foto degustazione"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Griglia informazioni */}
        <div className="space-y-6">
          {/* Informazioni base */}
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Informazioni Generali
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                <Calendar className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                <span>
                  {new Date(tasting.data).toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {tasting.occasione && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                  <PartyPopper className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                  <span>{tasting.occasione}</span>
                </div>
              )}
              {tasting.abbinamento_cibo && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                  <UtensilsCrossed className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                  <span>{tasting.abbinamento_cibo}</span>
                </div>
              )}
              {tasting.partecipanti && tasting.partecipanti.length > 0 && (
                <div className="flex items-start gap-2 text-gray-700 dark:text-slate-300">
                  <Users className="h-5 w-5 text-gray-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {tasting.partecipanti.length} partecipant
                      {tasting.partecipanti.length === 1 ? "e" : "i"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {tasting.partecipanti.join(", ")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aspetto Visivo */}
          {tasting.aspetto_visivo && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
                Aspetto Visivo
              </h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-slate-300">
                {tasting.aspetto_visivo}
              </p>
            </div>
          )}

          {/* Profumo */}
          {tasting.profumo && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
                Profumo
              </h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-slate-300">
                {tasting.profumo}
              </p>
            </div>
          )}

          {/* Gusto */}
          {tasting.gusto && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
                Gusto
              </h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-slate-300">
                {tasting.gusto}
              </p>
            </div>
          )}

          {/* Note Generali */}
          {tasting.note_generali && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
                Note Generali
              </h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-slate-300">
                {tasting.note_generali}
              </p>
            </div>
          )}

          {/* Link al vino */}
          <div className="rounded-lg bg-wine-50 dark:bg-wine-900/20 border border-transparent dark:border-wine-800/50 p-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-wine-900 dark:text-wine-200">
              <Wine className="h-4 w-4" />
              Vino Degustato
            </h3>
            <Link
              href={`/vini/${tasting.wine_id}`}
              className="inline-flex items-center text-wine-600 dark:text-wine-400 hover:text-wine-700 dark:hover:text-wine-300"
            >
              <span>Vedi scheda completa "{tasting.wine.nome}"</span>
              <span className="ml-2">→</span>
            </Link>
          </div>

          {/* Metadata */}
          <div className="rounded-lg bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 p-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>
                Registrata il{" "}
                {new Date(tasting.created_at).toLocaleDateString("it-IT")}
              </span>
              <span>
                Aggiornata il{" "}
                {new Date(tasting.updated_at).toLocaleDateString("it-IT")}
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
              Sei sicuro di voler eliminare questa degustazione di "
              {tasting.wine.nome}"? Questa azione non può essere annullata.
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
                disabled={deleteTasting.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleteTasting.isPending ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
