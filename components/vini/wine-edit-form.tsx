// Form per modificare un vino esistente
"use client";

import { useState } from "react";
import { useUpdateWine } from "@/lib/hooks/use-wines";
import type { Database } from "@/lib/types/database";

type Wine = Database["public"]["Tables"]["wines"]["Row"];

interface WineEditFormProps {
  wine: Wine;
  onCancel: () => void;
  onSuccess: () => void;
}

export function WineEditForm({ wine, onCancel, onSuccess }: WineEditFormProps) {
  const updateWine = useUpdateWine();

  // Form state inizializzato con i valori attuali
  const [formData, setFormData] = useState({
    nome: wine.nome,
    produttore: wine.produttore || "",
    denominazione: wine.denominazione || "",
    annata: wine.annata?.toString() || "",
    vitigni: wine.vitigni?.join(", ") || "",
    regione: wine.regione || "",
    paese: wine.paese || "Italia",
    formato_ml: wine.formato_ml?.toString() || "750",
    grado_alcolico: wine.grado_alcolico?.toString() || "",
    tipologia: wine.tipologia || "",
    note: wine.note || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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
      };

      await updateWine.mutateAsync({ id: wine.id, wine: wineData });
      onSuccess();
    } catch (error) {
      console.error("Errore aggiornamento vino:", error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Modifica Vino</h1>
            <button
              onClick={onCancel}
              className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informazioni Principali */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Informazioni Principali
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>

              <div>
                <label
                  htmlFor="produttore"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Produttore
                </label>
                <input
                  type="text"
                  id="produttore"
                  name="produttore"
                  value={formData.produttore}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>

              <div>
                <label
                  htmlFor="denominazione"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Denominazione
                </label>
                <input
                  type="text"
                  id="denominazione"
                  name="denominazione"
                  value={formData.denominazione}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>

              <div>
                <label
                  htmlFor="annata"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>

              <div>
                <label
                  htmlFor="tipologia"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Tipologia
                </label>
                <select
                  id="tipologia"
                  name="tipologia"
                  value={formData.tipologia}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
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
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Vitigni e Territorio
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="vitigni"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Vitigni
                </label>
                <input
                  type="text"
                  id="vitigni"
                  name="vitigni"
                  value={formData.vitigni}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Separa con virgole: Nebbiolo, Barbera, Dolcetto"
                />
              </div>

              <div>
                <label
                  htmlFor="regione"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Regione
                </label>
                <input
                  type="text"
                  id="regione"
                  name="regione"
                  value={formData.regione}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>

              <div>
                <label
                  htmlFor="paese"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Paese
                </label>
                <input
                  type="text"
                  id="paese"
                  name="paese"
                  value={formData.paese}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>
            </div>
          </div>

          {/* Caratteristiche */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Caratteristiche
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="formato_ml"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Formato (ml)
                </label>
                <select
                  id="formato_ml"
                  name="formato_ml"
                  value={formData.formato_ml}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
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
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Note</h2>
            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Note Personali
              </label>
              <textarea
                id="note"
                name="note"
                rows={4}
                value={formData.note}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
              />
            </div>
          </div>

          {/* Errore */}
          {updateWine.isError && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-300">
                Errore durante l'aggiornamento del vino. Riprova.
              </p>
            </div>
          )}

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={updateWine.isPending}
              className="rounded-md bg-wine-600 dark:bg-wine-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500 dark:hover:bg-wine-600 disabled:opacity-50"
            >
              {updateWine.isPending ? "Salvataggio..." : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
