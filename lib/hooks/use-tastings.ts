// Hooks per degustazioni con supporto offline
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTastings,
  getTasting,
  createTasting,
  updateTasting,
  deleteTasting,
  uploadTastingPhoto,
  deleteTastingPhoto,
} from "@/lib/api/tastings";
import { db, addToOutbox } from "@/lib/dexie/db";
import type { Database } from "@/lib/types/database";
import type { Tasting } from "@/lib/types/database";

type TastingInsert = Database["public"]["Tables"]["tastings"]["Insert"];
type TastingUpdate = Database["public"]["Tables"]["tastings"]["Update"];

export function useTastings() {
  return useQuery({
    queryKey: ["tastings"],
    queryFn: async () => {
      try {
        const tastings = await getTastings();
        // Salva in IndexedDB per uso offline
        if (tastings && tastings.length > 0) {
          await db.tastings.bulkPut(
            tastings.map((tasting: Tasting) => ({
              id: tasting.id,
              ownerId: tasting.owner_id,
              wineId: tasting.wine_id,
              data: tasting.data,
              punteggio: tasting.punteggio || undefined,
              aspettoVisivo: tasting.aspetto_visivo || undefined,
              profumo: tasting.profumo || undefined,
              gusto: tasting.gusto || undefined,
              noteGenerali: tasting.note_generali || undefined,
              occasione: tasting.occasione || undefined,
              abbinamentoCibo: tasting.abbinamento_cibo || undefined,
              partecipanti: tasting.partecipanti || [],
              fotoDegustazioneUrl: tasting.foto_degustazione_url || undefined,
              createdAt: tasting.created_at,
              updatedAt: tasting.updated_at,
            }))
          );
        }
        return tastings;
      } catch (error) {
        // Se fallisce (offline), leggi da IndexedDB
        console.log("Caricamento degustazioni da cache offline");
        const cachedTastings = await db.tastings.toArray();
        return cachedTastings.map((tasting) => ({
          id: tasting.id,
          owner_id: tasting.ownerId,
          wine_id: tasting.wineId,
          data: tasting.data,
          punteggio: tasting.punteggio,
          aspetto_visivo: tasting.aspettoVisivo,
          profumo: tasting.profumo,
          gusto: tasting.gusto,
          note_generali: tasting.noteGenerali,
          occasione: tasting.occasione,
          abbinamento_cibo: tasting.abbinamentoCibo,
          partecipanti: tasting.partecipanti,
          foto_degustazione_url: tasting.fotoDegustazioneUrl,
          created_at: tasting.createdAt,
          updated_at: tasting.updatedAt,
        })) as Tasting[];
      }
    },
  });
}

export function useTasting(id: string) {
  return useQuery({
    queryKey: ["tastings", id],
    queryFn: async () => {
      try {
        const tasting = await getTasting(id);
        // Salva in IndexedDB
        if (tasting) {
          await db.tastings.put({
            id: tasting.id,
            ownerId: tasting.owner_id,
            wineId: tasting.wine_id,
            data: tasting.data,
            punteggio: tasting.punteggio || undefined,
            aspettoVisivo: tasting.aspetto_visivo || undefined,
            profumo: tasting.profumo || undefined,
            gusto: tasting.gusto || undefined,
            noteGenerali: tasting.note_generali || undefined,
            occasione: tasting.occasione || undefined,
            abbinamentoCibo: tasting.abbinamento_cibo || undefined,
            partecipanti: tasting.partecipanti || [],
            fotoDegustazioneUrl: tasting.foto_degustazione_url || undefined,
            createdAt: tasting.created_at,
            updatedAt: tasting.updated_at,
          });
        }
        return tasting;
      } catch (error) {
        // Fallback a cache offline
        const cachedTasting = await db.tastings.get(id);
        if (!cachedTasting) throw error;
        return {
          id: cachedTasting.id,
          owner_id: cachedTasting.ownerId,
          wine_id: cachedTasting.wineId,
          data: cachedTasting.data,
          punteggio: cachedTasting.punteggio,
          aspetto_visivo: cachedTasting.aspettoVisivo,
          profumo: cachedTasting.profumo,
          gusto: cachedTasting.gusto,
          note_generali: cachedTasting.noteGenerali,
          occasione: cachedTasting.occasione,
          abbinamento_cibo: cachedTasting.abbinamentoCibo,
          partecipanti: cachedTasting.partecipanti,
          foto_degustazione_url: cachedTasting.fotoDegustazioneUrl,
          created_at: cachedTasting.createdAt,
          updated_at: cachedTasting.updatedAt,
        } as Tasting;
      }
    },
    enabled: !!id,
  });
}

export function useCreateTasting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tasting: Omit<TastingInsert, "id" | "owner_id">) => {
      try {
        const created = await createTasting(tasting);
        return created;
      } catch (error) {
        // Modalità offline: salva localmente e aggiungi all'outbox
        console.log("Creazione degustazione offline");
        const tempId = `temp-${crypto.randomUUID()}`;
        const now = new Date().toISOString();

        await db.tastings.put({
          id: tempId,
          ownerId: "temp-owner", // Sarà sovrascritto al sync
          wineId: tasting.wine_id,
          data: tasting.data || new Date().toISOString(),
          punteggio: tasting.punteggio ?? undefined,
          aspettoVisivo: tasting.aspetto_visivo ?? undefined,
          profumo: tasting.profumo ?? undefined,
          gusto: tasting.gusto ?? undefined,
          noteGenerali: tasting.note_generali ?? undefined,
          occasione: tasting.occasione ?? undefined,
          abbinamentoCibo: tasting.abbinamento_cibo ?? undefined,
          partecipanti: tasting.partecipanti || [],
          fotoDegustazioneUrl: tasting.foto_degustazione_url ?? undefined,
          createdAt: now,
          updatedAt: now,
        });

        await addToOutbox("insert", "tastings", { ...tasting, id: tempId });

        return {
          id: tempId,
          ...tasting,
          owner_id: "temp-owner",
          created_at: now,
          updated_at: now,
        } as Tasting;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tastings"] }),
  });
}

export function useUpdateTasting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tasting }: { id: string; tasting: TastingUpdate }) => {
      try {
        const updated = await updateTasting(id, tasting);
        return updated;
      } catch (error) {
        // Modalità offline: aggiorna localmente e aggiungi all'outbox
        console.log("Aggiornamento degustazione offline");
        const cachedTasting = await db.tastings.get(id);
        if (cachedTasting) {
          await db.tastings.update(id, {
            wineId: tasting.wine_id || cachedTasting.wineId,
            data: tasting.data || cachedTasting.data,
            punteggio: (tasting.punteggio !== undefined ? tasting.punteggio : cachedTasting.punteggio) ?? undefined,
            aspettoVisivo: (tasting.aspetto_visivo !== undefined ? tasting.aspetto_visivo : cachedTasting.aspettoVisivo) ?? undefined,
            profumo: (tasting.profumo !== undefined ? tasting.profumo : cachedTasting.profumo) ?? undefined,
            gusto: (tasting.gusto !== undefined ? tasting.gusto : cachedTasting.gusto) ?? undefined,
            noteGenerali: (tasting.note_generali !== undefined ? tasting.note_generali : cachedTasting.noteGenerali) ?? undefined,
            occasione: (tasting.occasione !== undefined ? tasting.occasione : cachedTasting.occasione) ?? undefined,
            abbinamentoCibo: (tasting.abbinamento_cibo !== undefined ? tasting.abbinamento_cibo : cachedTasting.abbinamentoCibo) ?? undefined,
            partecipanti: tasting.partecipanti || cachedTasting.partecipanti,
            fotoDegustazioneUrl: (tasting.foto_degustazione_url !== undefined ? tasting.foto_degustazione_url : cachedTasting.fotoDegustazioneUrl) ?? undefined,
            updatedAt: new Date().toISOString(),
          });
        }

        await addToOutbox("update", "tastings", { id, ...tasting });

        const updatedTasting = await db.tastings.get(id);
        return {
          id: updatedTasting!.id,
          owner_id: updatedTasting!.ownerId,
          wine_id: updatedTasting!.wineId,
          data: updatedTasting!.data,
          punteggio: updatedTasting!.punteggio,
          aspetto_visivo: updatedTasting!.aspettoVisivo,
          profumo: updatedTasting!.profumo,
          gusto: updatedTasting!.gusto,
          note_generali: updatedTasting!.noteGenerali,
          occasione: updatedTasting!.occasione,
          abbinamento_cibo: updatedTasting!.abbinamentoCibo,
          partecipanti: updatedTasting!.partecipanti,
          foto_degustazione_url: updatedTasting!.fotoDegustazioneUrl,
          created_at: updatedTasting!.createdAt,
          updated_at: updatedTasting!.updatedAt,
        } as Tasting;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tastings", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tastings"] });
    },
  });
}

export function useDeleteTasting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteTasting(id);
      } catch (error) {
        // Modalità offline: elimina localmente e aggiungi all'outbox
        console.log("Eliminazione degustazione offline");
        await db.tastings.delete(id);
        await addToOutbox("delete", "tastings", { id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tastings"] }),
  });
}

export function useUploadTastingPhoto() {
  return useMutation({
    mutationFn: async ({
      file,
      userId,
      tastingId,
    }: {
      file: File;
      userId: string;
      tastingId?: string;
    }) => {
      try {
        // Tentativo online
        const uploadedPath = await uploadTastingPhoto(file, userId);
        return uploadedPath;
      } catch (error) {
        // Fallback offline: salva in photoOutbox
        console.log("Upload foto degustazione offline");
        const { addPhotoToOutbox } = await import("@/lib/dexie/db");

        // Usa tasting ID se fornito, altrimenti genera temp ID
        const entityId = tastingId || `temp-${crypto.randomUUID()}`;

        await addPhotoToOutbox(file, userId, "tasting-photos", "tasting", entityId);

        // Ritorna URL blob locale temporaneo
        const blobUrl = URL.createObjectURL(file);
        return blobUrl;
      }
    },
  });
}

export function useDeleteTastingPhoto() {
  return useMutation({
    mutationFn: async (photoUrl: string) => {
      try {
        await deleteTastingPhoto(photoUrl);
      } catch (error) {
        // Offline: marca solo per eliminazione locale
        console.log("Delete foto degustazione offline (skip per ora)");
        // TODO: implementare delete queue se necessario
      }
    },
  });
}
