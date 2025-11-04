"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateBottle, useUploadLabel } from "@/lib/hooks/use-bottles";
import { useWines } from "@/lib/hooks/use-wines";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { BarcodeScanner } from "@/components/bottiglie/barcode-scanner";
import { Header } from "@/components/layout/header";
import { ScanLine } from "lucide-react";

export default function NuovaBottigliaPage() {
  const router = useRouter();
  const createBottle = useCreateBottle();
  const uploadLabel = useUploadLabel();
  const { data: wines } = useWines();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    wine_id: "",
    quantita: "1",
    data_acquisto: "",
    prezzo_acquisto: "",
    barcode: "",
    stato_maturita: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
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
      let fotoUrl = null;

      // Upload foto se presente
      if (photoFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          fotoUrl = await uploadLabel.mutateAsync({
            file: photoFile,
            userId: user.id,
          });
        }
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
        foto_etichetta_url: fotoUrl,
        stato_maturita: formData.stato_maturita || null,
      });

      router.push("/bottiglie");
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Aggiungi Bottiglia
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selezione Vino */}
          <div className="rounded-lg bg-white p-6 shadow">
            <label className="block text-sm font-medium text-gray-700">
              Vino *
            </label>
            <select
              required
              value={formData.wine_id}
              onChange={(e) =>
                setFormData({ ...formData, wine_id: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
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
              className="mt-2 inline-block text-sm text-wine-600"
            >
              + Crea nuovo vino
            </Link>
          </div>

          {/* Foto + Barcode */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 font-semibold">Foto e Barcode</h3>

            {/* Upload foto */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Foto Etichetta
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="mt-1 block w-full text-sm"
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mt-2 h-48 w-auto rounded-md"
                />
              )}
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Barcode
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="Inserisci o scansiona"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-2 rounded-md bg-wine-600 px-4 py-2 text-sm text-white hover:bg-wine-500"
                >
                  <ScanLine className="h-4 w-4" />
                  Scansiona
                </button>
              </div>
            </div>
          </div>

          {/* Dettagli */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 font-semibold">Dettagli</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data Acquisto
                </label>
                <input
                  type="date"
                  value={formData.data_acquisto}
                  onChange={(e) =>
                    setFormData({ ...formData, data_acquisto: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  <option value="">Seleziona...</option>
                  <option value="pronta">Pronta</option>
                  <option value="in_evoluzione">In evoluzione</option>
                  <option value="oltre_picco">Oltre il picco</option>
                </select>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href="/bottiglie"
              className="rounded-md border px-4 py-2 text-sm font-semibold"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={createBottle.isPending || uploadLabel.isPending}
              className="rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
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
