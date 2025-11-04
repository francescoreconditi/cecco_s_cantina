"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useBottle,
  useUpdateBottle,
  useUploadLabel,
  useDeleteLabel,
} from "@/lib/hooks/use-bottles";
import { useWines } from "@/lib/hooks/use-wines";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { BarcodeScanner } from "@/components/bottiglie/barcode-scanner";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { ScanLine, AlertCircle } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    wine_id: "",
    quantita: "1",
    data_acquisto: "",
    prezzo_acquisto: "",
    barcode: "",
    stato_maturita: "",
    fornitore: "",
    note: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        fornitore: bottle.fornitore || "",
        note: bottle.note_private || "",
      });
      setCurrentPhotoUrl(bottle.foto_etichetta_url);
    }
  }, [bottle]);

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

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setCurrentPhotoUrl(null);
  };

  const handleBarcodeDetected = (barcode: string) => {
    setFormData({ ...formData, barcode });
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let fotoUrl = currentPhotoUrl;

      // Se c'è una nuova foto, carica e elimina la vecchia
      if (photoFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Elimina vecchia foto se esiste
          if (currentPhotoUrl) {
            try {
              await deleteLabel.mutateAsync(currentPhotoUrl);
            } catch (error) {
              console.error("Errore eliminazione foto vecchia:", error);
            }
          }

          // Upload nuova foto
          fotoUrl = await uploadLabel.mutateAsync({
            file: photoFile,
            userId: user.id,
          });
        }
      }

      // Se l'utente ha rimosso la foto senza caricare una nuova
      if (!currentPhotoUrl && !photoFile) {
        fotoUrl = null;
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
          foto_etichetta_url: fotoUrl,
          stato_maturita: formData.stato_maturita || null,
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-wine-200 border-t-wine-600"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!bottle) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-800">Bottiglia non trovata</p>
          <Link
            href="/bottiglie"
            className="mt-4 inline-block text-sm text-wine-600"
          >
            Torna alla lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Modifica Bottiglia
          </h1>
          <p className="mt-1 text-sm text-gray-600">{bottle.wine.nome}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Messaggio di errore */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Errore durante il salvataggio
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
          </div>

          {/* Foto + Barcode */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 font-semibold">Foto e Barcode</h3>

            {/* Foto attuale o preview nuova */}
            {(currentPhotoUrl || photoPreview) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Foto Attuale
                </label>
                <div className="relative mt-2 inline-block">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-48 w-auto rounded-md"
                    />
                  ) : currentPhotoUrl ? (
                    <div className="relative h-48 w-48">
                      <Image
                        src={currentPhotoUrl}
                        alt="Etichetta"
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Upload nuova foto */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {currentPhotoUrl || photoPreview
                  ? "Cambia Foto Etichetta"
                  : "Aggiungi Foto Etichetta"}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="mt-1 block w-full text-sm"
              />
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
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fornitore
                </label>
                <input
                  type="text"
                  value={formData.fornitore}
                  onChange={(e) =>
                    setFormData({ ...formData, fornitore: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="Nome del fornitore o negozio"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="rounded-lg bg-white p-6 shadow">
            <label className="block text-sm font-medium text-gray-700">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="Note aggiuntive sulla bottiglia..."
            />
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/bottiglie/${id}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={updateBottle.isPending || uploadLabel.isPending}
              className="rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white hover:bg-wine-500 disabled:opacity-50"
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
