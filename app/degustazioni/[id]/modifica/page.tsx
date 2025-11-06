"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTasting, useUpdateTasting, useUploadTastingPhoto, useDeleteTastingPhoto } from "@/lib/hooks/use-tastings";
import { useWines } from "@/lib/hooks/use-wines";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Upload, X } from "lucide-react";
import { WineGlassLoader } from "@/components/ui/wine-glass-loader";
import { usePhotoUrl } from "@/lib/hooks/use-photo-url";

export default function ModificaDegustazionePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: tasting, isLoading } = useTasting(id);
  const updateTasting = useUpdateTasting();
  const uploadPhoto = useUploadTastingPhoto();
  const deletePhoto = useDeleteTastingPhoto();
  const { data: wines } = useWines();

  // Risolvi blob URLs per la foto
  const photoUrl = usePhotoUrl(tasting?.foto_degustazione_url, "tasting", id);

  const [formData, setFormData] = useState({
    wine_id: "",
    data: new Date().toISOString().split("T")[0],
    punteggio: "",
    aspetto_visivo: "",
    profumo: "",
    gusto: "",
    note_generali: "",
    occasione: "",
    abbinamento_cibo: "",
    partecipanti: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Popola form quando i dati vengono caricati
  useEffect(() => {
    if (tasting) {
      // Converti data da ISO timestamp a yyyy-MM-dd
      let dataDegustazione = "";
      if (tasting.data) {
        const date = new Date(tasting.data);
        dataDegustazione = date.toISOString().split("T")[0];
      }

      setFormData({
        wine_id: tasting.wine_id,
        data: dataDegustazione,
        punteggio: tasting.punteggio?.toString() || "",
        aspetto_visivo: tasting.aspetto_visivo || "",
        profumo: tasting.profumo || "",
        gusto: tasting.gusto || "",
        note_generali: tasting.note_generali || "",
        occasione: tasting.occasione || "",
        abbinamento_cibo: tasting.abbinamento_cibo || "",
        partecipanti: tasting.partecipanti?.join(", ") || "",
      });

      // Carica foto esistente
      if (tasting.foto_degustazione_url) {
        setExistingPhotoUrl(tasting.foto_degustazione_url);
      }
    }
  }, [tasting]);

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

  const handleRemoveNewPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleRemoveExistingPhoto = () => {
    if (existingPhotoUrl) {
      setPhotoToDelete(existingPhotoUrl);
      setExistingPhotoUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Ottieni user
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Gestisci foto
      let finalPhotoUrl: string | null = existingPhotoUrl;

      // Elimina foto vecchia se richiesto
      if (photoToDelete) {
        await deletePhoto.mutateAsync(photoToDelete);
        finalPhotoUrl = null;
      }

      // Upload nuova foto se presente
      if (photoFile && user) {
        finalPhotoUrl = await uploadPhoto.mutateAsync({
          file: photoFile,
          userId: user.id,
        });
      }

      // 3. Converti partecipanti da stringa a array
      const partecipantiArray = formData.partecipanti
        ? formData.partecipanti
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
        : [];

      // 4. Aggiorna degustazione
      await updateTasting.mutateAsync({
        id,
        tasting: {
          wine_id: formData.wine_id,
          data: new Date(formData.data).toISOString(),
          punteggio: formData.punteggio ? parseInt(formData.punteggio) : null,
          aspetto_visivo: formData.aspetto_visivo || null,
          profumo: formData.profumo || null,
          gusto: formData.gusto || null,
          note_generali: formData.note_generali || null,
          occasione: formData.occasione || null,
          abbinamento_cibo: formData.abbinamento_cibo || null,
          partecipanti: partecipantiArray,
          foto_degustazione_url: finalPhotoUrl,
        },
      });

      router.push(`/degustazioni/${id}`);
    } catch (err: any) {
      console.error("Errore aggiornamento degustazione:", err);
      setError(
        err?.message || "Errore durante l'aggiornamento della degustazione"
      );
    }
  };

  if (isLoading) {
    return <WineGlassLoader message="Caricamento dati degustazione..." />;
  }

  if (!tasting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-800 dark:text-red-300">Degustazione non trovata</p>
          <Link
            href="/degustazioni"
            className="mt-4 inline-block text-sm text-wine-600 dark:text-wine-400 hover:text-wine-700 dark:hover:text-wine-300"
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
            Modifica Degustazione
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            {wines?.find((w) => w.id === tasting.wine_id)?.nome || "Vino"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
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
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Vino Degustato
            </h2>
            <div>
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
                    {wine.nome} - {wine.produttore}{" "}
                    {wine.annata ? `(${wine.annata})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data e Punteggio */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Informazioni Base
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Data Degustazione *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Punteggio (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.punteggio}
                  onChange={(e) =>
                    setFormData({ ...formData, punteggio: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="es. 85"
                />
              </div>
            </div>
          </div>

          {/* Note Degustazione */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Scheda di Degustazione
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Aspetto Visivo
                </label>
                <textarea
                  value={formData.aspetto_visivo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aspetto_visivo: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Colore, limpidezza, consistenza..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Profumo
                </label>
                <textarea
                  value={formData.profumo}
                  onChange={(e) =>
                    setFormData({ ...formData, profumo: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Intensità, complessità, aromi percepiti..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Gusto
                </label>
                <textarea
                  value={formData.gusto}
                  onChange={(e) =>
                    setFormData({ ...formData, gusto: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Corpo, tannini, acidità, persistenza..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Note Generali
                </label>
                <textarea
                  value={formData.note_generali}
                  onChange={(e) =>
                    setFormData({ ...formData, note_generali: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Impressioni complessive, valutazione finale..."
                />
              </div>
            </div>
          </div>

          {/* Foto Degustazione */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Foto Degustazione
            </h2>
            <div className="space-y-4">
              {/* Foto esistente */}
              {existingPhotoUrl && photoUrl && !photoPreview && (
                <div className="relative">
                  <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-gray-200 dark:border-slate-600">
                    <Image
                      src={photoUrl}
                      alt="Foto degustazione"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveExistingPhoto}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                    Foto attuale - Clicca X per rimuoverla
                  </p>
                </div>
              )}

              {/* Preview nuova foto */}
              {photoPreview && (
                <div className="relative">
                  <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-wine-500 dark:border-wine-400">
                    <Image
                      src={photoPreview}
                      alt="Anteprima foto"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveNewPhoto}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-xs text-wine-600 dark:text-wine-400 font-medium">
                    Nuova foto - Verrà caricata al salvataggio
                  </p>
                </div>
              )}

              {/* Upload nuova foto */}
              {!photoPreview && (
                <div>
                  <label
                    htmlFor="photo-upload"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 p-6 transition hover:border-wine-500 dark:hover:border-wine-400 hover:bg-wine-50 dark:hover:bg-wine-900/20"
                  >
                    <Upload className="h-10 w-10 text-gray-400 dark:text-slate-500" />
                    <span className="mt-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                      {existingPhotoUrl
                        ? "Carica una nuova foto"
                        : "Carica foto degustazione"}
                    </span>
                    <span className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      PNG, JPG fino a 10MB
                    </span>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Contesto */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Contesto
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Occasione
                </label>
                <input
                  type="text"
                  value={formData.occasione}
                  onChange={(e) =>
                    setFormData({ ...formData, occasione: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="es. Cena con amici, evento speciale..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Abbinamento Cibo
                </label>
                <input
                  type="text"
                  value={formData.abbinamento_cibo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      abbinamento_cibo: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="es. Risotto ai funghi porcini"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Partecipanti
                </label>
                <input
                  type="text"
                  value={formData.partecipanti}
                  onChange={(e) =>
                    setFormData({ ...formData, partecipanti: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Nomi separati da virgola: Mario, Luca, Sara"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Inserisci i nomi dei partecipanti separati da virgola
                </p>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/degustazioni/${id}`}
              className="rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={updateTasting.isPending}
              className="rounded-md bg-wine-600 dark:bg-wine-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500 dark:hover:bg-wine-600 disabled:opacity-50"
            >
              {updateTasting.isPending
                ? "Salvataggio..."
                : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
