// Hooks TanStack Query per operazioni sulle ubicazioni con supporto offline
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationsTree,
  getRootLocations,
  getChildLocations,
} from "@/lib/api/locations";
import { db, addToOutbox } from "@/lib/dexie/db";
import type { Database } from "@/lib/types/database";
import type { Location } from "@/lib/types/database";

type LocationInsert = Database["public"]["Tables"]["locations"]["Insert"];
type LocationUpdate = Database["public"]["Tables"]["locations"]["Update"];

// Hook per recuperare tutte le ubicazioni
export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      try {
        const locations = await getLocations();
        // Salva in IndexedDB per uso offline
        if (locations && locations.length > 0) {
          await db.locations.bulkPut(
            locations.map((location: Location) => ({
              id: location.id,
              ownerId: location.owner_id,
              nome: location.nome,
              descrizione: location.descrizione || undefined,
              parentId: location.parent_id || undefined,
              temperatura: location.temperatura || undefined,
              umidita: location.umidita || undefined,
              noteAmbientali: location.note_ambientali || undefined,
              capacitaMassima: location.capacita_massima || undefined,
              createdAt: location.created_at,
              updatedAt: location.updated_at,
            }))
          );
        }
        return locations;
      } catch (error) {
        // Se fallisce (offline), leggi da IndexedDB
        console.log("Caricamento ubicazioni da cache offline");
        const cachedLocations = await db.locations.toArray();
        return cachedLocations.map((location) => ({
          id: location.id,
          owner_id: location.ownerId,
          nome: location.nome,
          descrizione: location.descrizione,
          parent_id: location.parentId,
          temperatura: location.temperatura,
          umidita: location.umidita,
          note_ambientali: location.noteAmbientali,
          capacita_massima: location.capacitaMassima,
          created_at: location.createdAt,
          updated_at: location.updatedAt,
        })) as Location[];
      }
    },
  });
}

// Hook per recuperare una singola ubicazione
export function useLocation(id: string) {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: async () => {
      try {
        const location = await getLocation(id);
        // Salva in IndexedDB
        if (location) {
          await db.locations.put({
            id: location.id,
            ownerId: location.owner_id,
            nome: location.nome,
            descrizione: location.descrizione || undefined,
            parentId: location.parent_id || undefined,
            temperatura: location.temperatura || undefined,
            umidita: location.umidita || undefined,
            noteAmbientali: location.note_ambientali || undefined,
            capacitaMassima: location.capacita_massima || undefined,
            createdAt: location.created_at,
            updatedAt: location.updated_at,
          });
        }
        return location;
      } catch (error) {
        // Fallback a cache offline
        const cachedLocation = await db.locations.get(id);
        if (!cachedLocation) throw error;
        return {
          id: cachedLocation.id,
          owner_id: cachedLocation.ownerId,
          nome: cachedLocation.nome,
          descrizione: cachedLocation.descrizione,
          parent_id: cachedLocation.parentId,
          temperatura: cachedLocation.temperatura,
          umidita: cachedLocation.umidita,
          note_ambientali: cachedLocation.noteAmbientali,
          capacita_massima: cachedLocation.capacitaMassima,
          created_at: cachedLocation.createdAt,
          updated_at: cachedLocation.updatedAt,
        } as Location;
      }
    },
    enabled: !!id,
  });
}

// Hook per recuperare l'albero gerarchico
export function useLocationsTree() {
  return useQuery({
    queryKey: ["locations", "tree"],
    queryFn: async () => {
      try {
        return await getLocationsTree();
      } catch (error) {
        // Costruisci albero offline da IndexedDB
        console.log("Costruzione albero ubicazioni da cache offline");
        const allLocations = await db.locations.toArray();

        // Converti in formato API
        const formattedLocations = allLocations.map((loc) => ({
          id: loc.id,
          owner_id: loc.ownerId,
          nome: loc.nome,
          descrizione: loc.descrizione,
          parent_id: loc.parentId,
          temperatura: loc.temperatura,
          umidita: loc.umidita,
          note_ambientali: loc.noteAmbientali,
          capacita_massima: loc.capacitaMassima,
          created_at: loc.createdAt,
          updated_at: loc.updatedAt,
        }));

        // Costruisci albero gerarchico
        const buildTree = (items: any[], parentId: string | null = null): any[] => {
          return items
            .filter((item) => item.parent_id === parentId)
            .map((item) => ({
              ...item,
              children: buildTree(items, item.id),
            }));
        };

        return buildTree(formattedLocations);
      }
    },
  });
}

// Hook per recuperare ubicazioni root
export function useRootLocations() {
  return useQuery({
    queryKey: ["locations", "root"],
    queryFn: async () => {
      try {
        return await getRootLocations();
      } catch (error) {
        // Query offline: parent_id null o undefined
        console.log("Caricamento ubicazioni root da cache offline");
        const rootLocations = await db.locations
          .filter((loc) => !loc.parentId)
          .toArray();

        return rootLocations.map((location) => ({
          id: location.id,
          owner_id: location.ownerId,
          nome: location.nome,
          descrizione: location.descrizione,
          parent_id: location.parentId,
          temperatura: location.temperatura,
          umidita: location.umidita,
          note_ambientali: location.noteAmbientali,
          capacita_massima: location.capacitaMassima,
          created_at: location.createdAt,
          updated_at: location.updatedAt,
        })) as Location[];
      }
    },
  });
}

// Hook per recuperare ubicazioni figlie
export function useChildLocations(parentId: string) {
  return useQuery({
    queryKey: ["locations", "children", parentId],
    queryFn: async () => {
      try {
        return await getChildLocations(parentId);
      } catch (error) {
        // Query offline: parent_id = parentId
        console.log("Caricamento ubicazioni figlie da cache offline");
        const childLocations = await db.locations
          .where("parentId")
          .equals(parentId)
          .toArray();

        return childLocations.map((location) => ({
          id: location.id,
          owner_id: location.ownerId,
          nome: location.nome,
          descrizione: location.descrizione,
          parent_id: location.parentId,
          temperatura: location.temperatura,
          umidita: location.umidita,
          note_ambientali: location.noteAmbientali,
          capacita_massima: location.capacitaMassima,
          created_at: location.createdAt,
          updated_at: location.updatedAt,
        })) as Location[];
      }
    },
    enabled: !!parentId,
  });
}

// Hook per creare una nuova ubicazione
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Omit<LocationInsert, "id" | "owner_id">) => {
      try {
        const created = await createLocation(location);
        return created;
      } catch (error) {
        // Modalità offline: salva localmente e aggiungi all'outbox
        console.log("Creazione ubicazione offline");
        const tempId = `temp-${crypto.randomUUID()}`;
        const now = new Date().toISOString();

        await db.locations.put({
          id: tempId,
          ownerId: "temp-owner", // Sarà sovrascritto al sync
          nome: location.nome,
          descrizione: location.descrizione ?? undefined,
          parentId: location.parent_id ?? undefined,
          temperatura: location.temperatura ?? undefined,
          umidita: location.umidita ?? undefined,
          noteAmbientali: location.note_ambientali ?? undefined,
          capacitaMassima: location.capacita_massima ?? undefined,
          createdAt: now,
          updatedAt: now,
        });

        await addToOutbox("insert", "locations", { ...location, id: tempId });

        return {
          id: tempId,
          ...location,
          owner_id: "temp-owner",
          created_at: now,
          updated_at: now,
        } as Location;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

// Hook per aggiornare un'ubicazione
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, location }: { id: string; location: LocationUpdate }) => {
      try {
        const updated = await updateLocation(id, location);
        return updated;
      } catch (error) {
        // Modalità offline: aggiorna localmente e aggiungi all'outbox
        console.log("Aggiornamento ubicazione offline");
        const cachedLocation = await db.locations.get(id);
        if (cachedLocation) {
          await db.locations.update(id, {
            nome: location.nome || cachedLocation.nome,
            descrizione: (location.descrizione !== undefined ? location.descrizione : cachedLocation.descrizione) ?? undefined,
            parentId: (location.parent_id !== undefined ? location.parent_id : cachedLocation.parentId) ?? undefined,
            temperatura: (location.temperatura !== undefined ? location.temperatura : cachedLocation.temperatura) ?? undefined,
            umidita: (location.umidita !== undefined ? location.umidita : cachedLocation.umidita) ?? undefined,
            noteAmbientali: (location.note_ambientali !== undefined ? location.note_ambientali : cachedLocation.noteAmbientali) ?? undefined,
            capacitaMassima: (location.capacita_massima !== undefined ? location.capacita_massima : cachedLocation.capacitaMassima) ?? undefined,
            updatedAt: new Date().toISOString(),
          });
        }

        await addToOutbox("update", "locations", { id, ...location });

        const updatedLocation = await db.locations.get(id);
        return {
          id: updatedLocation!.id,
          owner_id: updatedLocation!.ownerId,
          nome: updatedLocation!.nome,
          descrizione: updatedLocation!.descrizione,
          parent_id: updatedLocation!.parentId,
          temperatura: updatedLocation!.temperatura,
          umidita: updatedLocation!.umidita,
          note_ambientali: updatedLocation!.noteAmbientali,
          capacita_massima: updatedLocation!.capacitaMassima,
          created_at: updatedLocation!.createdAt,
          updated_at: updatedLocation!.updatedAt,
        } as Location;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["locations", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

// Hook per eliminare un'ubicazione
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteLocation(id);
      } catch (error) {
        // Modalità offline: elimina localmente e aggiungi all'outbox
        console.log("Eliminazione ubicazione offline");
        await db.locations.delete(id);
        await addToOutbox("delete", "locations", { id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
