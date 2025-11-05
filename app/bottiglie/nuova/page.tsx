"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBottle, useUploadLabel } from "@/lib/hooks/use-bottles";
import { useWines } from "@/lib/hooks/use-wines";
import { useLocations } from "@/lib/hooks/use-locations";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { BarcodeScanner } from "@/components/bottiglie/barcode-scanner";
import { Header } from "@/components/layout/header";
import { CellarPositionSelector } from "@/components/ubicazioni/cellar-position-selector";
import type { CellarPosition } from "@/components/ubicazioni/cellar-position-selector";
import { ScanLine } from "lucide-react";

export default function NuovaBottigliaPage() {
  const router = useRouter();
  const createBottle = useCreateBottle();
  const uploadLabel = useUploadLabel();
  const { data: wines } = useWines();
  const { data: locations } = useLocations();

  const [formData, setFormData] = useState({
    wine_id: "",
    quantita: "1",
    data_acquisto: "",
    prezzo_acquisto: "",
    barcode: "",
    stato_maturita: "",
    location_id: "",
  });

  const [photoFileFront, setPhotoFileFront] = useState<File | null>(null);
  const [photoPreviewFront, setPhotoPreviewFront] = useState<string | null>(null);
  const [photoFileBack, setPhotoFileBack] = useState<File | null>(null);
  const [photoPreviewBack, setPhotoPreviewBack] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<CellarPosition[]>([]);

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

  const handleBarcodeDetected = (barcode: string) => {
    setFormData({ ...formData, barcode });
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let fotoFronteUrl = null;
      let fotoRetroUrl = null;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Upload foto fronte se presente
      if (photoFileFront && user) {
        fotoFronteUrl = await uploadLabel.mutateAsync({
          file: photoFileFront,
          userId: user.id,
        });
      }

      // Upload foto retro se presente
      if (photoFileBack && user) {
        fotoRetroUrl = await uploadLabel.mutateAsync({
          file: photoFileBack,
          userId: user.id,
        });
      }

      // Crea bottiglia
      await createBottle.mutateAsync({
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
        posizioni_cantina: selectedPositions.length > 0 ? selectedPositions : null,
      });

      router.push("/bottiglie");
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            Aggiungi Bottiglia
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selezione Vino */}
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
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
            <Link
              href="/vini/nuovo"
              className="mt-2 inline-block text-sm text-wine-600 dark:text-wine-400 hover:text-wine-700 dark:hover:text-wine-300"
            >
              + Crea nuovo vino
            </Link>
          </div>

          {/* Foto + Barcode */}
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-slate-100">Foto e Barcode</h3>

            {/* Upload foto fronte */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Foto Etichetta Fronte
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChangeFront}
                className="mt-1 block w-full text-sm text-gray-900 dark:text-slate-100 file:mr-4 file:rounded-md file:border-0 file:bg-wine-50 dark:file:bg-wine-900/50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-wine-700 dark:file:text-wine-300 hover:file:bg-wine-100 dark:hover:file:bg-wine-900"
              />
              {photoPreviewFront && (
                <img
                  src={photoPreviewFront}
                  alt="Preview Fronte"
                  className="mt-2 h-48 w-auto rounded-md border border-gray-200 dark:border-slate-700"
                />
              )}
            </div>

            {/* Upload foto retro */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Foto Etichetta Retro
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChangeBack}
                className="mt-1 block w-full text-sm text-gray-900 dark:text-slate-100 file:mr-4 file:rounded-md file:border-0 file:bg-wine-50 dark:file:bg-wine-900/50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-wine-700 dark:file:text-wine-300 hover:file:bg-wine-100 dark:hover:file:bg-wine-900"
              />
              {photoPreviewBack && (
                <img
                  src={photoPreviewBack}
                  alt="Preview Retro"
                  className="mt-2 h-48 w-auto rounded-md border border-gray-200 dark:border-slate-700"
                />
              )}
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
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
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
              <div className="sm:col-span-2">
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

              {/* Selettore Posizioni Cantina */}
              {formData.location_id && (() => {
                const selectedLocation = locations?.find((loc) => loc.id === formData.location_id);
                return selectedLocation?.nr_file &&
                  selectedLocation?.bottiglie_fila_dispari &&
                  selectedLocation?.bottiglie_fila_pari ? (
                  <div className="sm:col-span-2 border-t border-gray-200 dark:border-slate-700 pt-6">
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
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href="/bottiglie"
              className="rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={createBottle.isPending || uploadLabel.isPending}
              className="rounded-md bg-wine-600 dark:bg-wine-700 px-4 py-2 text-sm font-semibold text-white hover:bg-wine-500 dark:hover:bg-wine-600 disabled:opacity-50"
            >
              {createBottle.isPending || uploadLabel.isPending
                ? "Salvataggio..."
                : "Salva Bottiglia"}
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
