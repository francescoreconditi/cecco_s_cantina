// Hooks TanStack Query per operazioni sui vini con supporto offline
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWines,
  getWine,
  createWine,
  updateWine,
  deleteWine,
  searchWines,
  getWineStats,
  uploadWineLabel,
  deleteWineLabel,
} from "@/lib/api/wines";
import { db, addToOutbox } from "@/lib/dexie/db";
import type { Database } from "@/lib/types/database";
import type { Wine } from "@/lib/types/database";

type WineInsert = Database["public"]["Tables"]["wines"]["Insert"];
type WineUpdate = Database["public"]["Tables"]["wines"]["Update"];

// Hook per recuperare tutti i vini con supporto offline
export function useWines() {
  const query = useQuery({
    queryKey: ["wines"],
    queryFn: async () => {
      try {
        const wines = await getWines();
        // Salva in IndexedDB per uso offline
        if (wines && wines.length > 0) {
          await db.wines.bulkPut(
            wines.map((wine: Wine) => ({
              id: wine.id,
              ownerId: wine.owner_id,
              nome: wine.nome,
              produttore: wine.produttore || undefined,
              denominazione: wine.denominazione || undefined,
              annata: wine.annata || undefined,
              vitigni: wine.vitigni || [],
              regione: wine.regione || undefined,
              paese: wine.paese || undefined,
              formatoMl: wine.formato_ml || undefined,
              gradoAlcolico: wine.grado_alcolico || undefined,
              tipologia: wine.tipologia || undefined,
              note: wine.note || undefined,
              createdAt: wine.created_at,
              updatedAt: wine.updated_at,
            }))
          );
        }
        return wines;
      } catch (error) {
        // Se fallisce (offline), leggi da IndexedDB
        console.log("Caricamento da cache offline");
        const cachedWines = await db.wines.toArray();
        return cachedWines.map((wine) => ({
          id: wine.id,
          owner_id: wine.ownerId,
          nome: wine.nome,
          produttore: wine.produttore,
          denominazione: wine.denominazione,
          annata: wine.annata,
          vitigni: wine.vitigni,
          regione: wine.regione,
          paese: wine.paese,
          formato_ml: wine.formatoMl,
          grado_alcolico: wine.gradoAlcolico,
          tipologia: wine.tipologia,
          note: wine.note,
          created_at: wine.createdAt,
          updated_at: wine.updatedAt,
        })) as Wine[];
      }
    },
  });

  return query;
}

// Hook per recuperare un singolo vino con supporto offline
export function useWine(id: string) {
  return useQuery({
    queryKey: ["wines", id],
    queryFn: async () => {
      try {
        const wine = await getWine(id);
        // Salva in IndexedDB
        if (wine) {
          await db.wines.put({
            id: wine.id,
            ownerId: wine.owner_id,
            nome: wine.nome,
            produttore: wine.produttore || undefined,
            denominazione: wine.denominazione || undefined,
            annata: wine.annata || undefined,
            vitigni: wine.vitigni || [],
            regione: wine.regione || undefined,
            paese: wine.paese || undefined,
            formatoMl: wine.formato_ml || undefined,
            gradoAlcolico: wine.grado_alcolico || undefined,
            tipologia: wine.tipologia || undefined,
            note: wine.note || undefined,
            createdAt: wine.created_at,
            updatedAt: wine.updated_at,
          });
        }
        return wine;
      } catch (error) {
        // Fallback a cache offline
        const cachedWine = await db.wines.get(id);
        if (!cachedWine) throw error;
        return {
          id: cachedWine.id,
          owner_id: cachedWine.ownerId,
          nome: cachedWine.nome,
          produttore: cachedWine.produttore,
          denominazione: cachedWine.denominazione,
          annata: cachedWine.annata,
          vitigni: cachedWine.vitigni,
          regione: cachedWine.regione,
          paese: cachedWine.paese,
          formato_ml: cachedWine.formatoMl,
          grado_alcolico: cachedWine.gradoAlcolico,
          tipologia: cachedWine.tipologia,
          note: cachedWine.note,
          created_at: cachedWine.createdAt,
          updated_at: cachedWine.updatedAt,
        } as Wine;
      }
    },
    enabled: !!id,
  });
}

// Hook per cercare vini
export function useSearchWines(query: string) {
  return useQuery({
    queryKey: ["wines", "search", query],
    queryFn: () => searchWines(query),
    enabled: query.length > 0,
  });
}

// Hook per statistiche vini
export function useWineStats() {
  return useQuery({
    queryKey: ["wines", "stats"],
    queryFn: getWineStats,
  });
}

// Hook per creare un nuovo vino con supporto offline
export function useCreateWine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wine: Omit<WineInsert, "id" | "owner_id">) => {
      try {
        const created = await createWine(wine);
        return created;
      } catch (error) {
        // Modalità offline: salva localmente e aggiungi all'outbox
        const tempId = `temp-${crypto.randomUUID()}`;
        const now = new Date().toISOString();

        await db.wines.put({
          id: tempId,
          ownerId: "temp-owner", // Sarà sovrascritto al sync
          nome: wine.nome,
          produttore: wine.produttore ?? undefined,
          denominazione: wine.denominazione ?? undefined,
          annata: wine.annata ?? undefined,
          vitigni: wine.vitigni || [],
          regione: wine.regione ?? undefined,
          paese: wine.paese ?? undefined,
          formatoMl: wine.formato_ml ?? undefined,
          gradoAlcolico: wine.grado_alcolico ?? undefined,
          tipologia: wine.tipologia ?? undefined,
          note: wine.note ?? undefined,
          createdAt: now,
          updatedAt: now,
        });

        await addToOutbox("insert", "wines", { ...wine, id: tempId });

        return {
          id: tempId,
          ...wine,
          owner_id: "temp-owner",
          created_at: now,
          updated_at: now,
        } as Wine;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wines"] });
    },
  });
}

// Hook per aggiornare un vino con supporto offline
export function useUpdateWine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, wine }: { id: string; wine: WineUpdate }) => {
      try {
        const updated = await updateWine(id, wine);
        return updated;
      } catch (error) {
        // Modalità offline: aggiorna localmente e aggiungi all'outbox
        const cachedWine = await db.wines.get(id);
        if (cachedWine) {
          await db.wines.update(id, {
            nome: wine.nome || cachedWine.nome,
            produttore: (wine.produttore !== undefined ? wine.produttore : cachedWine.produttore) ?? undefined,
            denominazione: (wine.denominazione !== undefined ? wine.denominazione : cachedWine.denominazione) ?? undefined,
            annata: (wine.annata !== undefined ? wine.annata : cachedWine.annata) ?? undefined,
            vitigni: wine.vitigni || cachedWine.vitigni,
            regione: (wine.regione !== undefined ? wine.regione : cachedWine.regione) ?? undefined,
            paese: (wine.paese !== undefined ? wine.paese : cachedWine.paese) ?? undefined,
            formatoMl: (wine.formato_ml !== undefined ? wine.formato_ml : cachedWine.formatoMl) ?? undefined,
            gradoAlcolico: (wine.grado_alcolico !== undefined ? wine.grado_alcolico : cachedWine.gradoAlcolico) ?? undefined,
            tipologia: (wine.tipologia !== undefined ? wine.tipologia : cachedWine.tipologia) ?? undefined,
            note: (wine.note !== undefined ? wine.note : cachedWine.note) ?? undefined,
            updatedAt: new Date().toISOString(),
          });
        }

        await addToOutbox("update", "wines", { id, ...wine });

        const updatedWine = await db.wines.get(id);
        return {
          id: updatedWine!.id,
          owner_id: updatedWine!.ownerId,
          nome: updatedWine!.nome,
          produttore: updatedWine!.produttore,
          denominazione: updatedWine!.denominazione,
          annata: updatedWine!.annata,
          vitigni: updatedWine!.vitigni,
          regione: updatedWine!.regione,
          paese: updatedWine!.paese,
          formato_ml: updatedWine!.formatoMl,
          grado_alcolico: updatedWine!.gradoAlcolico,
          tipologia: updatedWine!.tipologia,
          note: updatedWine!.note,
          created_at: updatedWine!.createdAt,
          updated_at: updatedWine!.updatedAt,
        } as Wine;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wines", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["wines"] });
    },
  });
}

// Hook per eliminare un vino con supporto offline
export function useDeleteWine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteWine(id);
      } catch (error) {
        // Modalità offline: elimina localmente e aggiungi all'outbox
        await db.wines.delete(id);
        await addToOutbox("delete", "wines", { id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wines"] });
    },
  });
}

// Hook per upload foto etichetta vino
export function useUploadWineLabel() {
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) =>
      uploadWineLabel(file, userId),
  });
}

// Hook per eliminare foto etichetta vino
export function useDeleteWineLabel() {
  return useMutation({
    mutationFn: (url: string) => deleteWineLabel(url),
  });
}
