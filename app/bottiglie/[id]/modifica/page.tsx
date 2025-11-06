"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useBottle,
  useUpdateBottle,
  useUploadLabel,
  useDeleteLabel,
} from "@/lib/hooks/use-bottles";
import { useWines } from "@/lib/hooks/use-wines";
import { useLocations } from "@/lib/hooks/use-locations";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { BarcodeScanner } from "@/components/bottiglie/barcode-scanner";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { ScanLine, AlertCircle } from "lucide-react";
import { CellarPositionSelector } from "@/components/ubicazioni/cellar-position-selector";
import type { CellarPosition } from "@/components/ubicazioni/cellar-position-selector";
import type { Json } from "@/lib/types/database";
import { WineGlassLoader } from "@/components/ui/wine-glass-loader";
import { usePhotoUrl } from "@/lib/hooks/use-photo-url";

export default function ModificaBottigliaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: bottle, isLoading } = useBottle(id);
  const updateBottle = useUpdateBottle();
  const uploadLabel = useUploadLabel();
  const deleteLabel = useDeleteLabel();
  const { data: wines } = useWines();
  const { data: locations } = useLocations();

  // Risolvi blob URLs per le foto
  const labelFrontUrl = usePhotoUrl(bottle?.foto_etichetta_url, "bottle", id);
  const labelBackUrl = usePhotoUrl(bottle?.foto_retro_url, "bottle", id);

  const [formData, setFormData] = useState({
    wine_id: "",
    quantita: "1",
    data_acquisto: "",
    prezzo_acquisto: "",
    barcode: "",
    stato_maturita: "",
    location_id: "",
    fornitore: "",
    note: "",
  });

  const [photoFileFront, setPhotoFileFront] = useState<File | null>(null);
  const [photoPreviewFront, setPhotoPreviewFront] = useState<string | null>(null);
  const [photoFileBack, setPhotoFileBack] = useState<File | null>(null);
  const [photoPreviewBack, setPhotoPreviewBack] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [currentPhotoFrontUrl, setCurrentPhotoFrontUrl] = useState<string | null>(null);
  const [currentPhotoBackUrl, setCurrentPhotoBackUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<CellarPosition[]>([]);

  // Popola form quando i dati vengono caricati
  useEffect(() => {
    if (bottle) {
      // Converti data da ISO timestamp a yyyy-MM-dd
      let dataAcquisto = "";
      if (bottle.data_acquisto) {
        const date = new Date(bottle.data_acquisto);
        dataAcquisto = date.toISOString().split("T")[0];
      }

      setFormData({
        wine_id: bottle.wine_id,
        quantita: bottle.quantita?.toString() || "1",
        data_acquisto: dataAcquisto,
        prezzo_acquisto: bottle.prezzo_acquisto?.toString() || "",
        barcode: bottle.barcode || "",
        stato_maturita: bottle.stato_maturita || "",
        location_id: bottle.location_id || "",
        fornitore: bottle.fornitore || "",
        note: bottle.note_private || "",
      });
      setCurrentPhotoFrontUrl(bottle.foto_etichetta_url);
      setCurrentPhotoBackUrl(bottle.foto_retro_url);

      // Carica posizioni esistenti
      if (bottle.posizioni_cantina && Array.isArray(bottle.posizioni_cantina)) {
        setSelectedPositions(bottle.posizioni_cantina as unknown as CellarPosition[]);
      } else {
        setSelectedPositions([]);
      }
    }
  }, [bottle]);

  const handlePhotoChangeFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileFront(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewFront(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChangeBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileBack(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewBack(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhotoFront = () => {
    setPhotoFileFront(null);
    setPhotoPreviewFront(null);
    setCurrentPhotoFrontUrl(null);
  };

  const handleRemovePhotoBack = () => {
    setPhotoFileBack(null);
    setPhotoPreviewBack(null);
    setCurrentPhotoBackUrl(null);
  };

  const handleBarcodeDetected = (barcode: string) => {
    setFormData({ ...formData, barcode });
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let fotoFronteUrl = currentPhotoFrontUrl;
      let fotoRetroUrl = currentPhotoBackUrl;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Gestione foto fronte
      if (photoFileFront && user) {
        // Elimina vecchia foto fronte se esiste
        if (currentPhotoFrontUrl) {
          try {
            await deleteLabel.mutateAsync(currentPhotoFrontUrl);
          } catch (error) {
            console.error("Errore eliminazione foto fronte:", error);
          }
        }
        // Upload nuova foto fronte
        fotoFronteUrl = await uploadLabel.mutateAsync({
          file: photoFileFront,
          userId: user.id,
        });
      }
      // Se l'utente ha rimosso la foto fronte senza caricare una nuova
      if (!currentPhotoFrontUrl && !photoFileFront) {
        fotoFronteUrl = null;
      }

      // Gestione foto retro
      if (photoFileBack && user) {
        // Elimina vecchia foto retro se esiste
        if (currentPhotoBackUrl) {
          try {
            await deleteLabel.mutateAsync(currentPhotoBackUrl);
          } catch (error) {
            console.error("Errore eliminazione foto retro:", error);
          }
        }
        // Upload nuova foto retro
        fotoRetroUrl = await uploadLabel.mutateAsync({
          file: photoFileBack,
          userId: user.id,
        });
      }
      // Se l'utente ha rimosso la foto retro senza caricare una nuova
      if (!currentPhotoBackUrl && !photoFileBack) {
        fotoRetroUrl = null;
      }

      // Aggiorna bottiglia
      await updateBottle.mutateAsync({
        id: id,
        bottle: {
          wine_id: formData.wine_id,
          quantita: parseInt(formData.quantita),
          data_acquisto: formData.data_acquisto || null,
          prezzo_acquisto: formData.prezzo_acquisto
            ? parseFloat(formData.prezzo_acquisto)
            : null,
          barcode: formData.barcode || null,
          foto_etichetta_url: fotoFronteUrl,
          foto_retro_url: fotoRetroUrl,
          stato_maturita: formData.stato_maturita || null,
          location_id: formData.location_id || null,
          posizioni_cantina: selectedPositions.length > 0 ? (selectedPositions as unknown as Json) : null,
          fornitore: formData.fornitore || null,
          note_private: formData.note || null,
        },
      });

      router.push(`/bottiglie/${id}`);
    } catch (err: any) {
      console.error("Errore aggiornamento bottiglia:", err);
      setError(
        err?.message || "Errore durante l'aggiornamento della bottiglia"
      );
    }
  };

  if (isLoading) {
    return <WineGlassLoader message="Caricamento dati bottiglia..." />;
  }

  if (!bottle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-800 dark:text-red-300">Bottiglia non trovata</p>
          <Link
            href="/bottiglie"
            className="mt-4 inline-block text-sm text-wine-600 dark:text-wine-400"
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

      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            Modifica Bottiglia
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            {wines?.find((w) => w.id === bottle.wine_id)?.nome || "Vino"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Messaggio di errore */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Errore durante il salvataggio
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selezione Vino */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Vino *
            </label>
            <select
              required
              value={formData.wine_id}
              onChange={(e) =>
                setFormData({ ...formData, wine_id: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
            >
              <option value="">Seleziona un vino...</option>
              {wines?.map((wine) => (
                <option key={wine.id} value={wine.id}>
                  {wine.nome} - {wine.produttore} ({wine.annata})
                </option>
              ))}
            </select>
          </div>

          {/* Foto + Barcode */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-slate-100">Foto e Barcode</h3>

            {/* Foto Fronte */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Foto Etichetta Fronte
              </label>

              {/* Foto attuale fronte o preview nuova */}
              {(currentPhotoFrontUrl || photoPreviewFront) && (
                <div className="mb-3">
                  <div className="relative inline-block">
                    {photoPreviewFront ? (
                      <img
                        src={photoPreviewFront}
                        alt="Preview Fronte"
                        className="h-48 w-auto rounded-md border border-gray-200 dark:border-slate-600"
                      />
                    ) : currentPhotoFrontUrl && labelFrontUrl ? (
                      <div className="relative h-48 w-48">
                        <Image
                          src={labelFrontUrl}
                          alt="Etichetta Fronte"
                          fill
                          className="rounded-md object-cover border border-gray-200 dark:border-slate-600"
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleRemovePhotoFront}
                      className="absolute right-2 top-2 rounded-full bg-red-600 dark:bg-red-700 p-2 text-white hover:bg-red-700 dark:hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Upload nuova foto fronte */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChangeFront}
                className="mt-1 block w-full text-sm text-gray-900 dark:text-slate-100 file:mr-4 file:rounded-md file:border-0 file:bg-wine-50 dark:file:bg-wine-900/50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-wine-700 dark:file:text-wine-300 hover:file:bg-wine-100 dark:hover:file:bg-wine-900"
              />
            </div>

            {/* Foto Retro */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Foto Etichetta Retro
              </label>

              {/* Foto attuale retro o preview nuova */}
              {(currentPhotoBackUrl || photoPreviewBack) && (
                <div className="mb-3">
                  <div className="relative inline-block">
                    {photoPreviewBack ? (
                      <img
                        src={photoPreviewBack}
                        alt="Preview Retro"
                        className="h-48 w-auto rounded-md border border-gray-200 dark:border-slate-600"
                      />
                    ) : currentPhotoBackUrl && labelBackUrl ? (
                      <div className="relative h-48 w-48">
                        <Image
                          src={labelBackUrl}
                          alt="Etichetta Retro"
                          fill
                          className="rounded-md object-cover border border-gray-200 dark:border-slate-600"
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleRemovePhotoBack}
                      className="absolute right-2 top-2 rounded-full bg-red-600 dark:bg-red-700 p-2 text-white hover:bg-red-700 dark:hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Upload nuova foto retro */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChangeBack}
                className="mt-1 block w-full text-sm text-gray-900 dark:text-slate-100 file:mr-4 file:rounded-md file:border-0 file:bg-wine-50 dark:file:bg-wine-900/50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-wine-700 dark:file:text-wine-300 hover:file:bg-wine-100 dark:hover:file:bg-wine-900"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Barcode
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Inserisci o scansiona"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-2 rounded-md bg-wine-600 dark:bg-wine-700 px-4 py-2 text-sm text-white hover:bg-wine-500 dark:hover:bg-wine-600"
                >
                  <ScanLine className="h-4 w-4" />
                  Scansiona
                </button>
              </div>
            </div>
          </div>

          {/* Dettagli */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-slate-100">Dettagli</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Quantità *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantita}
                  onChange={(e) =>
                    setFormData({ ...formData, quantita: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Prezzo Acquisto (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prezzo_acquisto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prezzo_acquisto: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Data Acquisto
                </label>
                <input
                  type="date"
                  value={formData.data_acquisto}
                  onChange={(e) =>
                    setFormData({ ...formData, data_acquisto: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Stato Maturità
                </label>
                <select
                  value={formData.stato_maturita}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stato_maturita: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                >
                  <option value="">Seleziona...</option>
                  <option value="pronta">Pronta</option>
                  <option value="in_evoluzione">In evoluzione</option>
                  <option value="oltre_picco">Oltre il picco</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Ubicazione
                </label>
                <select
                  value={formData.location_id}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      location_id: e.target.value,
                    });
                    // Reset posizioni quando cambia ubicazione
                    setSelectedPositions([]);
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                >
                  <option value="">Seleziona...</option>
                  {locations?.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Fornitore
                </label>
                <input
                  type="text"
                  value={formData.fornitore}
                  onChange={(e) =>
                    setFormData({ ...formData, fornitore: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Nome del fornitore o negozio"
                />
              </div>
            </div>

            {/* Seleziona Posizioni in Cantina */}
            {formData.location_id && (() => {
              const selectedLocation = locations?.find((loc) => loc.id === formData.location_id);
              return selectedLocation?.nr_file &&
                selectedLocation?.bottiglie_fila_dispari &&
                selectedLocation?.bottiglie_fila_pari ? (
                <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6">
                  <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-slate-100">
                    Seleziona Posizioni in Cantina
                  </h3>
                  <CellarPositionSelector
                    nr_file={selectedLocation.nr_file}
                    bottiglie_fila_dispari={selectedLocation.bottiglie_fila_dispari}
                    bottiglie_fila_pari={selectedLocation.bottiglie_fila_pari}
                    quantita={parseInt(formData.quantita) || 1}
                    selectedPositions={selectedPositions}
                    onPositionsChange={setSelectedPositions}
                    occupiedPositions={[]}
                  />
                </div>
              ) : null;
            })()}
          </div>

          {/* Note */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
              placeholder="Note aggiuntive sulla bottiglia..."
            />
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/bottiglie/${id}`}
              className="rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={updateBottle.isPending || uploadLabel.isPending}
              className="rounded-md bg-wine-600 dark:bg-wine-700 px-4 py-2 text-sm font-semibold text-white hover:bg-wine-500 dark:hover:bg-wine-600 disabled:opacity-50"
            >
              {updateBottle.isPending || uploadLabel.isPending
                ? "Salvataggio..."
                : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>

      {/* Scanner Barcode Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 dark:bg-opacity-90">
          <div className="w-full max-w-lg">
            <BarcodeScanner
              onDetected={handleBarcodeDetected}
              onClose={() => setShowScanner(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
