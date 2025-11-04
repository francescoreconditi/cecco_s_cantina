"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useLocation,
  useUpdateLocation,
  useLocations,
} from "@/lib/hooks/use-locations";
import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function ModificaUbicazionePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: location, isLoading, error } = useLocation(id);
  const { data: locations } = useLocations();
  const updateLocation = useUpdateLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    descrizione: "",
    parent_id: "",
    temperatura: "",
    umidita: "",
    capacita_massima: "",
    note_ambientali: "",
  });

  // Inizializza il form con i dati dell'ubicazione
  useEffect(() => {
    if (location) {
      setFormData({
        nome: location.nome || "",
        descrizione: location.descrizione || "",
        parent_id: location.parent_id || "",
        temperatura:
          location.temperatura !== null ? location.temperatura.toString() : "",
        umidita: location.umidita !== null ? location.umidita.toString() : "",
        capacita_massima:
          location.capacita_massima !== null
            ? location.capacita_massima.toString()
            : "",
        note_ambientali: location.note_ambientali || "",
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

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
        note_ambientali: formData.note_ambientali || null,
      };

      await updateLocation.mutateAsync({ id, location: locationData });

      // Redirect alla pagina dettaglio
      router.push(`/ubicazioni/${id}`);
    } catch (error) {
      console.error("Errore aggiornamento ubicazione:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore durante l'aggiornamento dell'ubicazione. Riprova.";
      setSubmitError(errorMessage);
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

  if (error || !location) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-800">
            Ubicazione non trovata o errore nel caricamento
          </p>
          <Link
            href="/ubicazioni"
            className="mt-4 inline-block text-sm text-wine-600 hover:text-wine-700"
          >
            Torna alla lista
          </Link>
        </div>
      </div>
    );
  }

  // Filtra le ubicazioni per evitare loop gerarchici
  const availableParents = locations?.filter(
    (loc) => loc.id !== id && loc.parent_id !== id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header Pagina */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Modifica Ubicazione
            </h1>
            <Link
              href={`/ubicazioni/${id}`}
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
          {/* Informazioni Principali */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Informazioni Principali
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="es. Cantina Principale, Scaffale A1, Cassetto Nord"
                />
              </div>

              <div>
                <label
                  htmlFor="descrizione"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descrizione
                </label>
                <textarea
                  id="descrizione"
                  name="descrizione"
                  rows={3}
                  value={formData.descrizione}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="Aggiungi dettagli sull'ubicazione..."
                />
              </div>

              <div>
                <label
                  htmlFor="parent_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ubicazione Genitore
                </label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                >
                  <option value="">Nessuna (ubicazione principale)</option>
                  {availableParents?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nome}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Seleziona un'ubicazione genitore per creare una gerarchia
                </p>
              </div>
            </div>
          </div>

          {/* Condizioni Ambientali */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Condizioni Ambientali
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="temperatura"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="es. 14.5"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Temperatura ideale: 12-16°C
                </p>
              </div>

              <div>
                <label
                  htmlFor="umidita"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="es. 70"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Umidità ideale: 60-80%
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="note_ambientali"
                  className="block text-sm font-medium text-gray-700"
                >
                  Note Ambientali
                </label>
                <textarea
                  id="note_ambientali"
                  name="note_ambientali"
                  rows={3}
                  value={formData.note_ambientali}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                  placeholder="Note su illuminazione, ventilazione, vibrazioni, ecc."
                />
              </div>
            </div>
          </div>

          {/* Capacità */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Capacità
            </h2>
            <div>
              <label
                htmlFor="capacita_massima"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wine-500 focus:outline-none focus:ring-wine-500"
                placeholder="es. 50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Numero massimo di bottiglie che l'ubicazione può contenere
              </p>
            </div>
          </div>

          {/* Errore */}
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Errore:</p>
              <p className="mt-1 text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/ubicazioni/${id}`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={updateLocation.isPending}
              className="rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500 disabled:opacity-50"
            >
              {updateLocation.isPending
                ? "Salvataggio..."
                : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
