// Hooks TanStack Query per operazioni sulle bottiglie con supporto offline
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBottles,
  getBottle,
  createBottle,
  updateBottle,
  deleteBottle,
  getBottlesByWine,
  getBottlesByLocation,
  getBottleStats,
  uploadLabel,
  deleteLabel,
} from "@/lib/api/bottles";
import { db, addToOutbox } from "@/lib/dexie/db";
import type { Database } from "@/lib/types/database";
import type { Bottle } from "@/lib/types/database";

type BottleInsert = Database["public"]["Tables"]["bottles"]["Insert"];
type BottleUpdate = Database["public"]["Tables"]["bottles"]["Update"];

export function useBottles() {
  return useQuery({
    queryKey: ["bottles"],
    queryFn: async () => {
      try {
        const bottles = await getBottles();
        // Salva in IndexedDB per uso offline
        if (bottles && bottles.length > 0) {
          await db.bottles.bulkPut(
            bottles.map((bottle: Bottle) => ({
              id: bottle.id,
              ownerId: bottle.owner_id,
              wineId: bottle.wine_id,
              quantita: bottle.quantita,
              dataAcquisto: bottle.data_acquisto || undefined,
              prezzoAcquisto: bottle.prezzo_acquisto || undefined,
              fornitore: bottle.fornitore || undefined,
              locationId: bottle.location_id || undefined,
              prontoDA: bottle.pronto_da || undefined,
              meglioEntro: bottle.meglio_entro || undefined,
              statoMaturita: bottle.stato_maturita || undefined,
              barcode: bottle.barcode || undefined,
              fotoEtichettaUrl: bottle.foto_etichetta_url || undefined,
              notePosizione: bottle.note_posizione || undefined,
              notePrivate: bottle.note_private || undefined,
              createdAt: bottle.created_at,
              updatedAt: bottle.updated_at,
            }))
          );
        }
        return bottles;
      } catch (error) {
        // Se fallisce (offline), leggi da IndexedDB
        console.log("Caricamento bottiglie da cache offline");
        const cachedBottles = await db.bottles.toArray();
        return cachedBottles.map((bottle) => ({
          id: bottle.id,
          owner_id: bottle.ownerId,
          wine_id: bottle.wineId,
          quantita: bottle.quantita,
          data_acquisto: bottle.dataAcquisto,
          prezzo_acquisto: bottle.prezzoAcquisto,
          fornitore: bottle.fornitore,
          location_id: bottle.locationId,
          pronto_da: bottle.prontoDA,
          meglio_entro: bottle.meglioEntro,
          stato_maturita: bottle.statoMaturita,
          barcode: bottle.barcode,
          foto_etichetta_url: bottle.fotoEtichettaUrl,
          note_posizione: bottle.notePosizione,
          note_private: bottle.notePrivate,
          created_at: bottle.createdAt,
          updated_at: bottle.updatedAt,
        })) as Bottle[];
      }
    },
  });
}

export function useBottle(id: string) {
  return useQuery({
    queryKey: ["bottles", id],
    queryFn: async () => {
      try {
        const bottle = await getBottle(id);
        // Salva in IndexedDB
        if (bottle) {
          await db.bottles.put({
            id: bottle.id,
            ownerId: bottle.owner_id,
            wineId: bottle.wine_id,
            quantita: bottle.quantita,
            dataAcquisto: bottle.data_acquisto || undefined,
            prezzoAcquisto: bottle.prezzo_acquisto || undefined,
            fornitore: bottle.fornitore || undefined,
            locationId: bottle.location_id || undefined,
            prontoDA: bottle.pronto_da || undefined,
            meglioEntro: bottle.meglio_entro || undefined,
            statoMaturita: bottle.stato_maturita || undefined,
            barcode: bottle.barcode || undefined,
            fotoEtichettaUrl: bottle.foto_etichetta_url || undefined,
            notePosizione: bottle.note_posizione || undefined,
            notePrivate: bottle.note_private || undefined,
            createdAt: bottle.created_at,
            updatedAt: bottle.updated_at,
          });
        }
        return bottle;
      } catch (error) {
        // Fallback a cache offline
        const cachedBottle = await db.bottles.get(id);
        if (!cachedBottle) throw error;
        return {
          id: cachedBottle.id,
          owner_id: cachedBottle.ownerId,
          wine_id: cachedBottle.wineId,
          quantita: cachedBottle.quantita,
          data_acquisto: cachedBottle.dataAcquisto,
          prezzo_acquisto: cachedBottle.prezzoAcquisto,
          fornitore: cachedBottle.fornitore,
          location_id: cachedBottle.locationId,
          pronto_da: cachedBottle.prontoDA,
          meglio_entro: cachedBottle.meglioEntro,
          stato_maturita: cachedBottle.statoMaturita,
          barcode: cachedBottle.barcode,
          foto_etichetta_url: cachedBottle.fotoEtichettaUrl,
          note_posizione: cachedBottle.notePosizione,
          note_private: cachedBottle.notePrivate,
          created_at: cachedBottle.createdAt,
          updated_at: cachedBottle.updatedAt,
        } as Bottle;
      }
    },
    enabled: !!id,
  });
}

export function useBottlesByWine(wineId: string) {
  return useQuery({
    queryKey: ["bottles", "wine", wineId],
    queryFn: async () => {
      try {
        return await getBottlesByWine(wineId);
      } catch (error) {
        // Fallback offline: query su IndexedDB
        console.log("Caricamento bottiglie per vino da cache offline");
        const cachedBottles = await db.bottles.where("wineId").equals(wineId).toArray();
        return cachedBottles.map((bottle) => ({
          id: bottle.id,
          owner_id: bottle.ownerId,
          wine_id: bottle.wineId,
          quantita: bottle.quantita,
          data_acquisto: bottle.dataAcquisto,
          prezzo_acquisto: bottle.prezzoAcquisto,
          fornitore: bottle.fornitore,
          location_id: bottle.locationId,
          pronto_da: bottle.prontoDA,
          meglio_entro: bottle.meglioEntro,
          stato_maturita: bottle.statoMaturita,
          barcode: bottle.barcode,
          foto_etichetta_url: bottle.fotoEtichettaUrl,
          note_posizione: bottle.notePosizione,
          note_private: bottle.notePrivate,
          created_at: bottle.createdAt,
          updated_at: bottle.updatedAt,
        })) as Bottle[];
      }
    },
    enabled: !!wineId,
  });
}

export function useBottlesByLocation(locationId: string) {
  return useQuery({
    queryKey: ["bottles", "location", locationId],
    queryFn: async () => {
      try {
        return await getBottlesByLocation(locationId);
      } catch (error) {
        // Fallback offline: query su IndexedDB
        console.log("Caricamento bottiglie per ubicazione da cache offline");
        const cachedBottles = await db.bottles.where("locationId").equals(locationId).toArray();
        return cachedBottles.map((bottle) => ({
          id: bottle.id,
          owner_id: bottle.ownerId,
          wine_id: bottle.wineId,
          quantita: bottle.quantita,
          data_acquisto: bottle.dataAcquisto,
          prezzo_acquisto: bottle.prezzoAcquisto,
          fornitore: bottle.fornitore,
          location_id: bottle.locationId,
          pronto_da: bottle.prontoDA,
          meglio_entro: bottle.meglioEntro,
          stato_maturita: bottle.statoMaturita,
          barcode: bottle.barcode,
          foto_etichetta_url: bottle.fotoEtichettaUrl,
          note_posizione: bottle.notePosizione,
          note_private: bottle.notePrivate,
          created_at: bottle.createdAt,
          updated_at: bottle.updatedAt,
        })) as Bottle[];
      }
    },
    enabled: !!locationId,
  });
}

export function useBottleStats() {
  return useQuery({
    queryKey: ["bottles", "stats"],
    queryFn: async () => {
      try {
        return await getBottleStats();
      } catch (error) {
        // Calcola stats offline
        console.log("Calcolo statistiche bottiglie da cache offline");
        const bottles = await db.bottles.toArray();
        const total = bottles.reduce((sum, b) => sum + b.quantita, 0);

        // Group by stato maturita
        const byMaturity: Record<string, number> = {};
        bottles.forEach((b) => {
          const status = b.statoMaturita || "Sconosciuto";
          byMaturity[status] = (byMaturity[status] || 0) + b.quantita;
        });

        // Calcola valore totale (prezzo_acquisto * quantita)
        const totalValue = bottles.reduce((sum, b) => {
          const price = b.prezzoAcquisto || 0;
          const quantity = b.quantita || 0;
          return sum + (price * quantity);
        }, 0);

        return {
          total,
          byMaturity,
          count: bottles.length,
          totalValue,
        };
      }
    },
  });
}

export function useCreateBottle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bottle: Omit<BottleInsert, "id" | "owner_id">) => {
      try {
        const created = await createBottle(bottle);
        return created;
      } catch (error) {
        // Modalità offline: salva localmente e aggiungi all'outbox
        console.log("Creazione bottiglia offline");
        const tempId = `temp-${crypto.randomUUID()}`;
        const now = new Date().toISOString();

        await db.bottles.put({
          id: tempId,
          ownerId: "temp-owner", // Sarà sovrascritto al sync
          wineId: bottle.wine_id,
          quantita: bottle.quantita || 1,
          dataAcquisto: bottle.data_acquisto ?? undefined,
          prezzoAcquisto: bottle.prezzo_acquisto ?? undefined,
          fornitore: bottle.fornitore ?? undefined,
          locationId: bottle.location_id ?? undefined,
          prontoDA: bottle.pronto_da ?? undefined,
          meglioEntro: bottle.meglio_entro ?? undefined,
          statoMaturita: bottle.stato_maturita ?? undefined,
          barcode: bottle.barcode ?? undefined,
          fotoEtichettaUrl: bottle.foto_etichetta_url ?? undefined,
          notePosizione: bottle.note_posizione ?? undefined,
          notePrivate: bottle.note_private ?? undefined,
          createdAt: now,
          updatedAt: now,
        });

        await addToOutbox("insert", "bottles", { ...bottle, id: tempId });

        return {
          id: tempId,
          ...bottle,
          owner_id: "temp-owner",
          created_at: now,
          updated_at: now,
        } as Bottle;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
      if (data.location_id) {
        queryClient.invalidateQueries({
          queryKey: ["bottles", "location", data.location_id],
        });
      }
    },
  });
}

export function useUpdateBottle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bottle }: { id: string; bottle: BottleUpdate }) => {
      try {
        const updated = await updateBottle(id, bottle);
        return updated;
      } catch (error) {
        // Modalità offline: aggiorna localmente e aggiungi all'outbox
        console.log("Aggiornamento bottiglia offline");
        const cachedBottle = await db.bottles.get(id);
        if (cachedBottle) {
          await db.bottles.update(id, {
            wineId: bottle.wine_id || cachedBottle.wineId,
            quantita: bottle.quantita !== undefined ? bottle.quantita : cachedBottle.quantita,
            dataAcquisto: (bottle.data_acquisto !== undefined ? bottle.data_acquisto : cachedBottle.dataAcquisto) ?? undefined,
            prezzoAcquisto: (bottle.prezzo_acquisto !== undefined ? bottle.prezzo_acquisto : cachedBottle.prezzoAcquisto) ?? undefined,
            fornitore: (bottle.fornitore !== undefined ? bottle.fornitore : cachedBottle.fornitore) ?? undefined,
            locationId: (bottle.location_id !== undefined ? bottle.location_id : cachedBottle.locationId) ?? undefined,
            prontoDA: (bottle.pronto_da !== undefined ? bottle.pronto_da : cachedBottle.prontoDA) ?? undefined,
            meglioEntro: (bottle.meglio_entro !== undefined ? bottle.meglio_entro : cachedBottle.meglioEntro) ?? undefined,
            statoMaturita: (bottle.stato_maturita !== undefined ? bottle.stato_maturita : cachedBottle.statoMaturita) ?? undefined,
            barcode: (bottle.barcode !== undefined ? bottle.barcode : cachedBottle.barcode) ?? undefined,
            fotoEtichettaUrl: (bottle.foto_etichetta_url !== undefined ? bottle.foto_etichetta_url : cachedBottle.fotoEtichettaUrl) ?? undefined,
            notePosizione: (bottle.note_posizione !== undefined ? bottle.note_posizione : cachedBottle.notePosizione) ?? undefined,
            notePrivate: (bottle.note_private !== undefined ? bottle.note_private : cachedBottle.notePrivate) ?? undefined,
            updatedAt: new Date().toISOString(),
          });
        }

        await addToOutbox("update", "bottles", { id, ...bottle });

        const updatedBottle = await db.bottles.get(id);
        return {
          id: updatedBottle!.id,
          owner_id: updatedBottle!.ownerId,
          wine_id: updatedBottle!.wineId,
          quantita: updatedBottle!.quantita,
          data_acquisto: updatedBottle!.dataAcquisto,
          prezzo_acquisto: updatedBottle!.prezzoAcquisto,
          fornitore: updatedBottle!.fornitore,
          location_id: updatedBottle!.locationId,
          pronto_da: updatedBottle!.prontoDA,
          meglio_entro: updatedBottle!.meglioEntro,
          stato_maturita: updatedBottle!.statoMaturita,
          barcode: updatedBottle!.barcode,
          foto_etichetta_url: updatedBottle!.fotoEtichettaUrl,
          note_posizione: updatedBottle!.notePosizione,
          note_private: updatedBottle!.notePrivate,
          created_at: updatedBottle!.createdAt,
          updated_at: updatedBottle!.updatedAt,
        } as Bottle;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bottles", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
      if (data.location_id) {
        queryClient.invalidateQueries({
          queryKey: ["bottles", "location", data.location_id],
        });
      }
    },
  });
}

export function useDeleteBottle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteBottle(id);
      } catch (error) {
        // Modalità offline: elimina localmente e aggiungi all'outbox
        console.log("Eliminazione bottiglia offline");
        await db.bottles.delete(id);
        await addToOutbox("delete", "bottles", { id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
    },
  });
}

export function useUploadLabel() {
  return useMutation({
    mutationFn: async ({
      file,
      userId,
      bottleId,
    }: {
      file: File;
      userId: string;
      bottleId?: string;
    }) => {
      try {
        // Tentativo online
        const uploadedPath = await uploadLabel(file, userId);
        return uploadedPath;
      } catch (error) {
        // Fallback offline: salva in photoOutbox
        console.log("Upload etichetta bottiglia offline");
        const { addPhotoToOutbox } = await import("@/lib/dexie/db");

        // Usa bottle ID se fornito, altrimenti genera temp ID
        const entityId = bottleId || `temp-${crypto.randomUUID()}`;

        await addPhotoToOutbox(file, userId, "labels", "bottle", entityId);

        // Ritorna URL blob locale temporaneo
        const blobUrl = URL.createObjectURL(file);
        return blobUrl;
      }
    },
  });
}

export function useDeleteLabel() {
  return useMutation({
    mutationFn: async (url: string) => {
      try {
        await deleteLabel(url);
      } catch (error) {
        // Offline: skip per ora
        console.log("Delete etichetta bottiglia offline (skip per ora)");
        // TODO: implementare delete queue se necessario
      }
    },
  });
}
