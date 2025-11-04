"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useWine, useDeleteWine, useUpdateWine } from "@/lib/hooks/use-wines";
import Link from "next/link";
import { WineEditForm } from "@/components/vini/wine-edit-form";
import { Header } from "@/components/layout/header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
// import { VivinoSearchDialog } from "@/components/vivino/vivino-search-dialog";
import { VivinoCard } from "@/components/vivino/vivino-card";

export default function DettaglioVinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: wine, isLoading, error, refetch } = useWine(id);
  const deleteWine = useDeleteWine();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleVivinoSuccess = () => {
    // Refetch wine data to show updated Vivino info
    refetch();
  };

  const handleDelete = async () => {
    try {
      await deleteWine.mutateAsync(id);
      router.push("/vini");
    } catch (error) {
      console.error("Errore eliminazione vino:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-wine-200 border-t-wine-600"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error || !wine) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-800">
            Vino non trovato o errore nel caricamento
          </p>
          <Link
            href="/vini"
            className="mt-4 inline-block text-sm text-wine-600 hover:text-wine-700"
          >
            Torna alla lista
          </Link>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <WineEditForm
        wine={wine}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs />
        </div>
      </div>

      {/* Header Pagina */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/vini"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Torna alla lista
            </Link>
            <div className="flex gap-3">
              {/* <VivinoSearchDialog wine={wine} onSuccess={handleVivinoSuccess} /> */}
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md border border-wine-600 px-4 py-2 text-sm font-semibold text-wine-600 hover:bg-wine-50"
              >
                Modifica
              </button>
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
        {/* Titolo e badges */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{wine.nome}</h1>
              {wine.produttore && (
                <p className="mt-2 text-xl text-gray-600">{wine.produttore}</p>
              )}
            </div>
            {wine.tipologia && (
              <span className="inline-flex rounded-full bg-wine-100 px-4 py-2 text-sm font-medium text-wine-800">
                {wine.tipologia}
              </span>
            )}
          </div>

          {wine.denominazione && (
            <p className="mt-4 text-lg font-semibold text-wine-700">
              {wine.denominazione}
            </p>
          )}

          {/* Vivino Card */}
          <div className="mt-6">
            <VivinoCard wine={wine} />
          </div>
        </div>

        {/* Griglia informazioni */}
        <div className="space-y-6">
          {/* Caratteristiche principali */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Caratteristiche
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {wine.annata && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Annata</dt>
                  <dd className="mt-1 text-sm text-gray-900">{wine.annata}</dd>
                </div>
              )}
              {wine.regione && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Regione</dt>
                  <dd className="mt-1 text-sm text-gray-900">{wine.regione}</dd>
                </div>
              )}
              {wine.paese && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Paese</dt>
                  <dd className="mt-1 text-sm text-gray-900">{wine.paese}</dd>
                </div>
              )}
              {wine.formato_ml && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Formato</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {wine.formato_ml} ml
                  </dd>
                </div>
              )}
              {wine.grado_alcolico && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Gradazione
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {wine.grado_alcolico}% vol
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Vitigni */}
          {wine.vitigni && wine.vitigni.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Vitigni
              </h2>
              <div className="flex flex-wrap gap-2">
                {wine.vitigni.map((vitigno: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex rounded-md bg-wine-50 px-3 py-1 text-sm font-medium text-wine-700"
                  >
                    {vitigno}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {wine.note && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Note
              </h2>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {wine.note}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg bg-gray-100 p-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Creato il {new Date(wine.created_at).toLocaleDateString("it-IT")}
              </span>
              <span>
                Aggiornato il{" "}
                {new Date(wine.updated_at).toLocaleDateString("it-IT")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Conferma eliminazione
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Sei sicuro di voler eliminare "{wine.nome}"? Questa azione non può
              essere annullata.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteWine.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleteWine.isPending ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
