"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateWine, useUploadWineLabel } from "@/lib/hooks/use-wines";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function NuovoVinoPage() {
  const router = useRouter();
  const createWine = useCreateWine();
  const uploadLabel = useUploadWineLabel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    produttore: "",
    denominazione: "",
    annata: "",
    vitigni: "",
    regione: "",
    paese: "Italia",
    formato_ml: "750",
    grado_alcolico: "",
    tipologia: "",
    note: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let fotoUrl: string | null = null;

      // Se c'è una foto, caricala
      if (photoFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          fotoUrl = (await uploadLabel.mutateAsync({
            file: photoFile,
            userId: user.id,
          })) as string;
        }
      }

      // Prepara i dati per l'invio
      const wineData = {
        nome: formData.nome,
        produttore: formData.produttore || null,
        denominazione: formData.denominazione || null,
        annata: formData.annata ? parseInt(formData.annata) : null,
        vitigni: formData.vitigni
          ? formData.vitigni.split(",").map((v) => v.trim())
          : [],
        regione: formData.regione || null,
        paese: formData.paese || "Italia",
        formato_ml: formData.formato_ml ? parseInt(formData.formato_ml) : 750,
        grado_alcolico: formData.grado_alcolico
          ? parseFloat(formData.grado_alcolico)
          : null,
        tipologia: formData.tipologia || null,
        note: formData.note || null,
        foto_etichetta_url: fotoUrl,
      };

      await createWine.mutateAsync(wineData);

      // Redirect alla lista vini
      router.push("/vini");
    } catch (error) {
      console.error("Errore creazione vino:", error);
      const errorMessage = error instanceof Error ? error.message : "Errore durante la creazione del vino. Riprova.";
      setError(errorMessage);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header Pagina */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Aggiungi Nuovo Vino
            </h1>
            <Link
              href="/vini"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Annulla
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Foto Etichetta */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Foto Etichetta
            </h2>

            {/* Preview foto */}
            {photoPreview && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Anteprima
                </label>
                <div className="relative mt-2 inline-block">
                  <img
                    src={photoPreview}
                    alt="Anteprima etichetta"
                    className="h-48 w-auto rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
                    aria-label="Rimuovi foto"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Upload foto */}
            <div>
              <label
                htmlFor="foto"
                className="block text-sm font-medium text-gray-700"
              >
                {photoPreview ? "Cambia Foto" : "Aggiungi Foto"}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="foto"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-wine-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-wine-700 hover:file:bg-wine-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Carica una foto dell'etichetta del vino (opzionale)
              </p>
            </div>
          </div>

          {/* Informazioni Principali */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Informazioni Principali
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nome Vino *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="es. Barolo Riserva"
                />
              </div>

              <div>
                <label
                  htmlFor="produttore"
                  className="block text-sm font-medium text-gray-700"
                >
                  Produttore
                </label>
                <input
                  type="text"
                  id="produttore"
                  name="produttore"
                  value={formData.produttore}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="es. Marchesi di Barolo"
                />
              </div>

              <div>
                <label
                  htmlFor="denominazione"
                  className="block text-sm font-medium text-gray-700"
                >
                  Denominazione
                </label>
                <input
                  type="text"
                  id="denominazione"
                  name="denominazione"
                  value={formData.denominazione}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="es. DOCG, DOC, IGT"
                />
              </div>

              <div>
                <label
                  htmlFor="annata"
                  className="block text-sm font-medium text-gray-700"
                >
                  Annata
                </label>
                <input
                  type="number"
                  id="annata"
                  name="annata"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.annata}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder={new Date().getFullYear().toString()}
                />
              </div>

              <div>
                <label
                  htmlFor="tipologia"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipologia
                </label>
                <select
                  id="tipologia"
                  name="tipologia"
                  value={formData.tipologia}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                >
                  <option value="">Seleziona...</option>
                  <option value="Rosso">Rosso</option>
                  <option value="Bianco">Bianco</option>
                  <option value="Rosato">Rosato</option>
                  <option value="Spumante">Spumante</option>
                  <option value="Passito">Passito</option>
                  <option value="Fortificato">Fortificato</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vitigni e Territorio */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Vitigni e Territorio
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="vitigni"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vitigni
                </label>
                <input
                  type="text"
                  id="vitigni"
                  name="vitigni"
                  value={formData.vitigni}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="Separa con virgole: Nebbiolo, Barbera, Dolcetto"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Inserisci i vitigni separati da virgole
                </p>
              </div>

              <div>
                <label
                  htmlFor="regione"
                  className="block text-sm font-medium text-gray-700"
                >
                  Regione
                </label>
                <input
                  type="text"
                  id="regione"
                  name="regione"
                  value={formData.regione}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="es. Piemonte"
                />
              </div>

              <div>
                <label
                  htmlFor="paese"
                  className="block text-sm font-medium text-gray-700"
                >
                  Paese
                </label>
                <input
                  type="text"
                  id="paese"
                  name="paese"
                  value={formData.paese}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                />
              </div>
            </div>
          </div>

          {/* Caratteristiche */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Caratteristiche
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="formato_ml"
                  className="block text-sm font-medium text-gray-700"
                >
                  Formato (ml)
                </label>
                <select
                  id="formato_ml"
                  name="formato_ml"
                  value={formData.formato_ml}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                >
                  <option value="375">375 ml (Mezza)</option>
                  <option value="750">750 ml (Standard)</option>
                  <option value="1500">1500 ml (Magnum)</option>
                  <option value="3000">3000 ml (Doppio Magnum)</option>
                  <option value="6000">6000 ml (Imperiale)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="grado_alcolico"
                  className="block text-sm font-medium text-gray-700"
                >
                  Grado Alcolico (%)
                </label>
                <input
                  type="number"
                  id="grado_alcolico"
                  name="grado_alcolico"
                  step="0.1"
                  min="0"
                  max="20"
                  value={formData.grado_alcolico}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="es. 14.5"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Note</h2>
            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700"
              >
                Note Personali
              </label>
              <textarea
                id="note"
                name="note"
                rows={4}
                value={formData.note}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                placeholder="Aggiungi note, osservazioni o informazioni aggiuntive..."
              />
            </div>
          </div>

          {/* Errore */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Errore:</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href="/vini"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={createWine.isPending || uploadLabel.isPending}
              className="rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500 disabled:opacity-50"
            >
              {createWine.isPending || uploadLabel.isPending
                ? "Salvataggio..."
                : "Salva Vino"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
