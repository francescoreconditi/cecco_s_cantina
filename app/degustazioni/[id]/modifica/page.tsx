"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTasting, useUpdateTasting } from "@/lib/hooks/use-tastings";
import { useWines } from "@/lib/hooks/use-wines";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ModificaDegustazionePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: tasting, isLoading } = useTasting(id);
  const updateTasting = useUpdateTasting();
  const { data: wines } = useWines();

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
    }
  }, [tasting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Converti partecipanti da stringa a array
      const partecipantiArray = formData.partecipanti
        ? formData.partecipanti
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
        : [];

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-wine-200 border-t-wine-600"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!tasting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-800">Degustazione non trovata</p>
          <Link
            href="/degustazioni"
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
            Modifica Degustazione
          </h1>
          <p className="mt-1 text-sm text-gray-600">{tasting.wine.nome}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
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
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Vino Degustato
            </h2>
            <div>
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
                    {wine.nome} - {wine.produttore}{" "}
                    {wine.annata ? `(${wine.annata})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data e Punteggio */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Informazioni Base
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data Degustazione *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="es. 85"
                />
              </div>
            </div>
          </div>

          {/* Note Degustazione */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Scheda di Degustazione
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="Colore, limpidezza, consistenza..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profumo
                </label>
                <textarea
                  value={formData.profumo}
                  onChange={(e) =>
                    setFormData({ ...formData, profumo: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="Intensità, complessità, aromi percepiti..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gusto
                </label>
                <textarea
                  value={formData.gusto}
                  onChange={(e) =>
                    setFormData({ ...formData, gusto: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="Corpo, tannini, acidità, persistenza..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note Generali
                </label>
                <textarea
                  value={formData.note_generali}
                  onChange={(e) =>
                    setFormData({ ...formData, note_generali: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="Impressioni complessive, valutazione finale..."
                />
              </div>
            </div>
          </div>

          {/* Contesto */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Contesto
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Occasione
                </label>
                <input
                  type="text"
                  value={formData.occasione}
                  onChange={(e) =>
                    setFormData({ ...formData, occasione: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="es. Cena con amici, evento speciale..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="es. Risotto ai funghi porcini"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Partecipanti
                </label>
                <input
                  type="text"
                  value={formData.partecipanti}
                  onChange={(e) =>
                    setFormData({ ...formData, partecipanti: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="Nomi separati da virgola: Mario, Luca, Sara"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Inserisci i nomi dei partecipanti separati da virgola
                </p>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/degustazioni/${id}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={updateTasting.isPending}
              className="rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500 disabled:opacity-50"
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
