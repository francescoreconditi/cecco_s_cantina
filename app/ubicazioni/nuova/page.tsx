"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateLocation, useLocations } from "@/lib/hooks/use-locations";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { CellarLayout } from "@/components/ubicazioni/cellar-layout";

export default function NuovaUbicazionePage() {
  const router = useRouter();
  const createLocation = useCreateLocation();
  const { data: locations } = useLocations();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    descrizione: "",
    parent_id: "",
    temperatura: "",
    umidita: "",
    capacita_massima: "",
    nr_file: "",
    bottiglie_fila_dispari: "",
    bottiglie_fila_pari: "",
    note_ambientali: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Prepara i dati per l'invio
      const locationData = {
        nome: formData.nome,
        descrizione: formData.descrizione || null,
        parent_id: formData.parent_id || null,
        temperatura: formData.temperatura
          ? parseFloat(formData.temperatura)
          : null,
        umidita: formData.umidita ? parseFloat(formData.umidita) : null,
        capacita_massima: formData.capacita_massima
          ? parseInt(formData.capacita_massima)
          : null,
        nr_file: formData.nr_file ? parseInt(formData.nr_file) : null,
        bottiglie_fila_dispari: formData.bottiglie_fila_dispari
          ? parseInt(formData.bottiglie_fila_dispari)
          : null,
        bottiglie_fila_pari: formData.bottiglie_fila_pari
          ? parseInt(formData.bottiglie_fila_pari)
          : null,
        note_ambientali: formData.note_ambientali || null,
      };

      await createLocation.mutateAsync(locationData);

      // Redirect alla lista ubicazioni
      router.push("/ubicazioni");
    } catch (error) {
      console.error("Errore creazione ubicazione:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore durante la creazione dell'ubicazione. Riprova.";
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      {/* Header Pagina */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              Nuova Ubicazione
            </h1>
            <Link
              href="/ubicazioni"
              className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            >
              Annulla
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informazioni Principali */}
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Informazioni Principali
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Nome Ubicazione *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="es. Cantina Principale, Scaffale A1, Cassetto Nord"
                />
              </div>

              <div>
                <label
                  htmlFor="descrizione"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Descrizione
                </label>
                <textarea
                  id="descrizione"
                  name="descrizione"
                  rows={3}
                  value={formData.descrizione}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Aggiungi dettagli sull'ubicazione..."
                />
              </div>

              <div>
                <label
                  htmlFor="parent_id"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Ubicazione Genitore
                </label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                >
                  <option value="">Nessuna (ubicazione principale)</option>
                  {locations?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nome}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Seleziona un'ubicazione genitore per creare una gerarchia
                </p>
              </div>
            </div>
          </div>

          {/* Condizioni Ambientali */}
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Condizioni Ambientali
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="temperatura"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  id="temperatura"
                  name="temperatura"
                  step="0.1"
                  min="-10"
                  max="40"
                  value={formData.temperatura}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="es. 14.5"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Temperatura ideale: 12-16°C
                </p>
              </div>

              <div>
                <label
                  htmlFor="umidita"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Umidità (%)
                </label>
                <input
                  type="number"
                  id="umidita"
                  name="umidita"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.umidita}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="es. 70"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Umidità ideale: 60-80%
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="note_ambientali"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Note Ambientali
                </label>
                <textarea
                  id="note_ambientali"
                  name="note_ambientali"
                  rows={3}
                  value={formData.note_ambientali}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="Note su illuminazione, ventilazione, vibrazioni, ecc."
                />
              </div>
            </div>
          </div>

          {/* Capacità */}
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 shadow dark:shadow-slate-900/50">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Capacità
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="capacita_massima"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Capacità Massima (bottiglie)
                </label>
                <input
                  type="number"
                  id="capacita_massima"
                  name="capacita_massima"
                  min="0"
                  value={formData.capacita_massima}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                  placeholder="es. 50"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Numero massimo di bottiglie che l'ubicazione può contenere
                </p>
              </div>

              {/* Configurazione Layout Fisico */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-slate-100">
                  Layout Fisico (opzionale)
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-slate-400">
                  Configura la struttura fisica della cantina per una rappresentazione visiva
                </p>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="nr_file"
                      className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                    >
                      Numero di File
                    </label>
                    <input
                      type="number"
                      id="nr_file"
                      name="nr_file"
                      min="0"
                      value={formData.nr_file}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                      placeholder="es. 5"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      Righe totali
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="bottiglie_fila_dispari"
                      className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                    >
                      Bottiglie Fila Dispari
                    </label>
                    <input
                      type="number"
                      id="bottiglie_fila_dispari"
                      name="bottiglie_fila_dispari"
                      min="0"
                      value={formData.bottiglie_fila_dispari}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                      placeholder="es. 10"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      File 1ª, 3ª, 5ª...
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="bottiglie_fila_pari"
                      className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                    >
                      Bottiglie Fila Pari
                    </label>
                    <input
                      type="number"
                      id="bottiglie_fila_pari"
                      name="bottiglie_fila_pari"
                      min="0"
                      value={formData.bottiglie_fila_pari}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-wine-500 dark:focus:border-wine-600 focus:outline-none focus:ring-wine-500 dark:focus:ring-wine-600"
                      placeholder="es. 9"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      File 2ª, 4ª, 6ª...
                    </p>
                  </div>
                </div>

                {/* Anteprima Layout */}
                {formData.nr_file &&
                  formData.bottiglie_fila_dispari &&
                  formData.bottiglie_fila_pari &&
                  parseInt(formData.nr_file) > 0 &&
                  parseInt(formData.bottiglie_fila_dispari) > 0 &&
                  parseInt(formData.bottiglie_fila_pari) > 0 && (
                    <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6">
                      <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-slate-100">
                        Anteprima Layout
                      </h4>
                      <CellarLayout
                        nr_file={parseInt(formData.nr_file)}
                        bottiglie_fila_dispari={parseInt(formData.bottiglie_fila_dispari)}
                        bottiglie_fila_pari={parseInt(formData.bottiglie_fila_pari)}
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Errore */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Errore:</p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href="/ubicazioni"
              className="rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={createLocation.isPending}
              className="rounded-md bg-wine-600 dark:bg-wine-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500 dark:hover:bg-wine-600 disabled:opacity-50"
            >
              {createLocation.isPending
                ? "Salvataggio..."
                : "Salva Ubicazione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
