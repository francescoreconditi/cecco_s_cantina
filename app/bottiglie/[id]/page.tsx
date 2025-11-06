"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useBottle,
  useDeleteBottle,
  useUpdateBottle,
} from "@/lib/hooks/use-bottles";
import { useWine } from "@/lib/hooks/use-wines";
import { useLocation } from "@/lib/hooks/use-locations";
import { usePhotoUrl } from "@/lib/hooks/use-photo-url";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ImageZoomHover } from "@/components/ui/image-zoom-hover";
import { CellarPositionDisplay } from "@/components/ubicazioni/cellar-position-display";
import type { CellarPosition } from "@/components/ubicazioni/cellar-position-selector";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Barcode, X, ZoomIn as ZoomInIcon, ZoomOut, RotateCcw } from "lucide-react";
import { WineGlassLoader } from "@/components/ui/wine-glass-loader";

export default function DettaglioBottigliaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: bottle, isLoading, error } = useBottle(id);
  const { data: wine } = useWine(bottle?.wine_id || "");
  const { data: location } = useLocation(bottle?.location_id || "");
  const labelFrontUrl = usePhotoUrl(bottle?.foto_etichetta_url, "bottle", id);
  const labelBackUrl = usePhotoUrl(bottle?.foto_retro_url, "bottle", id);
  const deleteBottle = useDeleteBottle();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomImageType, setZoomImageType] = useState<'front' | 'back'>('front');

  const handleDelete = async () => {
    try {
      await deleteBottle.mutateAsync(id);
      router.push("/bottiglie");
    } catch (error) {
      console.error("Errore eliminazione bottiglia:", error);
    }
  };

  if (isLoading) {
    return <WineGlassLoader message="Caricamento bottiglia..." />;
  }

  if (error || !bottle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-800 dark:text-red-300">
            Bottiglia non trovata o errore nel caricamento
          </p>
          <Link
            href="/bottiglie"
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
              href="/bottiglie"
              className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            >
              ← Torna alla lista
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/bottiglie/${bottle.id}/modifica`}
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
        {/* Foto etichette con zoom hover */}
        {(labelFrontUrl || labelBackUrl) && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {/* Foto Fronte */}
            {labelFrontUrl && (
              <div className="overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-4 shadow dark:shadow-slate-900/50">
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Etichetta Fronte
                </h3>
                <ImageZoomHover
                  src={labelFrontUrl}
                  alt={`Etichetta Fronte ${wine?.nome || 'Vino'}`}
                  onClick={() => {
                    setZoomImageType('front');
                    setShowImageZoom(true);
                  }}
                />
                <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-400">
                  Passa il mouse per ingrandire • Clicca per zoom
                </p>
              </div>
            )}

            {/* Foto Retro */}
            {labelBackUrl && (
              <div className="overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-4 shadow dark:shadow-slate-900/50">
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Etichetta Retro
                </h3>
                <ImageZoomHover
                  src={labelBackUrl}
                  alt={`Etichetta Retro ${wine?.nome || 'Vino'}`}
                  onClick={() => {
                    setZoomImageType('back');
                    setShowImageZoom(true);
                  }}
                />
                <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-400">
                  Passa il mouse per ingrandire • Clicca per zoom
                </p>
              </div>
            )}
          </div>
        )}

        {/* Titolo */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
                {wine?.nome || "Vino"}
              </h1>
              <p className="mt-2 text-xl text-gray-600 dark:text-slate-400">
                {wine?.produttore}
              </p>
              {wine?.annata && (
                <p className="mt-1 text-lg text-gray-500 dark:text-slate-400">
                  Annata: {wine.annata}
                </p>
              )}
            </div>
            {wine?.tipologia && (
              <span className="inline-flex rounded-full bg-wine-100 dark:bg-wine-900/50 px-4 py-2 text-sm font-medium text-wine-800 dark:text-wine-200">
                {wine.tipologia}
              </span>
            )}
          </div>
        </div>

        {/* Griglia informazioni */}
        <div className="space-y-6">
          {/* Inventario */}
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Inventario
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Quantità</dt>
                <dd className="mt-1 text-2xl font-bold text-wine-600 dark:text-wine-500">
                  {bottle.quantita}
                </dd>
              </div>
              {bottle.stato_maturita && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Stato Maturità
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                    {bottle.stato_maturita}
                  </dd>
                </div>
              )}
              {location && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Ubicazione
                  </dt>
                  <dd className="mt-1">
                    <Link
                      href={`/ubicazioni/${location.id}`}
                      className="text-sm text-wine-600 dark:text-wine-400 hover:text-wine-700 dark:hover:text-wine-300 font-medium"
                    >
                      {location.nome}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Visualizzazione Cantina */}
          {location &&
            location.nr_file &&
            location.bottiglie_fila_dispari &&
            location.bottiglie_fila_pari &&
            bottle.posizioni_cantina &&
            Array.isArray(bottle.posizioni_cantina) &&
            bottle.posizioni_cantina.length > 0 && (
              <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Posizioni in Cantina
                </h2>
                <CellarPositionDisplay
                  nr_file={location.nr_file}
                  bottiglie_fila_dispari={location.bottiglie_fila_dispari}
                  bottiglie_fila_pari={location.bottiglie_fila_pari}
                  positions={bottle.posizioni_cantina as unknown as CellarPosition[]}
                />
              </div>
            )}

          {/* Dati acquisto */}
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Dati Acquisto
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {bottle.prezzo_acquisto && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Prezzo</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                    €{bottle.prezzo_acquisto.toFixed(2)}
                  </dd>
                </div>
              )}
              {bottle.data_acquisto && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Data Acquisto
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                    {new Date(bottle.data_acquisto).toLocaleDateString("it-IT")}
                  </dd>
                </div>
              )}
              {bottle.fornitore && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Fornitore
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                    {bottle.fornitore}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Codice a barre */}
          {bottle.barcode && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
                Codice a Barre
              </h2>
              <div className="flex items-center gap-2">
                <Barcode className="h-5 w-5 text-wine-600 dark:text-wine-500" />
                <code className="rounded bg-gray-100 dark:bg-slate-700 px-3 py-2 text-lg font-mono text-gray-900 dark:text-slate-100">
                  {bottle.barcode}
                </code>
              </div>
            </div>
          )}

          {/* Note */}
          {bottle.note_private && (
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Note</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">
                {bottle.note_private}
              </p>
            </div>
          )}

          {/* Link al vino */}
          <div className="rounded-lg bg-wine-50 dark:bg-wine-900/20 border border-transparent dark:border-wine-800/50 p-6">
            <h3 className="mb-2 text-sm font-semibold text-wine-900 dark:text-wine-200">
              Vino Associato
            </h3>
            <Link
              href={`/vini/${bottle.wine_id}`}
              className="inline-flex items-center text-wine-600 dark:text-wine-400 hover:text-wine-700 dark:hover:text-wine-300"
            >
              <span>Vedi dettaglio vino "{wine?.nome || 'Vino'}"</span>
              <span className="ml-2">→</span>
            </Link>
          </div>

          {/* Metadata */}
          <div className="rounded-lg bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 p-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>
                Creato il{" "}
                {new Date(bottle.created_at).toLocaleDateString("it-IT")}
              </span>
              <span>
                Aggiornato il{" "}
                {new Date(bottle.updated_at).toLocaleDateString("it-IT")}
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
              Sei sicuro di voler eliminare questa bottiglia di "
              {wine?.nome || 'Vino'}"? Questa azione non può essere annullata.
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
                disabled={deleteBottle.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleteBottle.isPending ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal zoom interattivo */}
      {showImageZoom && (zoomImageType === 'front' ? labelFrontUrl : labelBackUrl) && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header con controlli */}
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black to-transparent p-4">
            <div className="text-white">
              <h3 className="text-lg font-semibold">{wine?.nome || 'Vino'}</h3>
              <p className="text-sm text-gray-300">
                {wine?.produttore}
                {wine?.annata && ` • ${wine.annata}`}
                {' • '}
                <span className="font-semibold">
                  {zoomImageType === 'front' ? 'Fronte' : 'Retro'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {/* Pulsanti per cambiare vista */}
              {labelFrontUrl && labelBackUrl && (
                <div className="flex gap-1 rounded-full bg-white bg-opacity-20 p-1">
                  <button
                    onClick={() => setZoomImageType('front')}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      zoomImageType === 'front'
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Fronte
                  </button>
                  <button
                    onClick={() => setZoomImageType('back')}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      zoomImageType === 'back'
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Retro
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowImageZoom(false)}
                className="rounded-full bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-30"
                aria-label="Chiudi"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Contenitore zoom con TransformWrapper */}
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit
            wheel={{ step: 0.1 }}
            doubleClick={{ mode: "toggle", step: 0.7 }}
          >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <>
                {/* Controlli zoom */}
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black bg-opacity-50 p-2 backdrop-blur-sm">
                  <button
                    onClick={() => zoomOut()}
                    className="rounded-full bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-30"
                    aria-label="Riduci zoom"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="rounded-full bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-30"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => zoomIn()}
                    className="rounded-full bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-30"
                    aria-label="Aumenta zoom"
                  >
                    <ZoomInIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Istruzioni */}
                <div className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black bg-opacity-50 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">
                  Usa la rotella del mouse o i pulsanti per zoomare • Trascina per
                  muoverti
                </div>

                {/* Immagine trasformabile */}
                <TransformComponent
                  wrapperClass="!w-full !h-full flex items-center justify-center"
                  contentClass="flex items-center justify-center"
                >
                  <Image
                    src={(zoomImageType === 'front' ? labelFrontUrl : labelBackUrl)!}
                    alt={`Etichetta ${zoomImageType === 'front' ? 'Fronte' : 'Retro'} ${wine?.nome || 'Vino'} - Zoom`}
                    width={1200}
                    height={1600}
                    className="max-h-screen max-w-full object-contain"
                    priority
                    key={zoomImageType}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}
    </div>
  );
}
