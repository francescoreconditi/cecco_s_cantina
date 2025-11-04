// Hooks TanStack Query per operazioni sulle ubicazioni
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
import type { Database } from "@/lib/types/database";

type LocationInsert = Database["public"]["Tables"]["locations"]["Insert"];
type LocationUpdate = Database["public"]["Tables"]["locations"]["Update"];

// Hook per recuperare tutte le ubicazioni
export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });
}

// Hook per recuperare una singola ubicazione
export function useLocation(id: string) {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: () => getLocation(id),
    enabled: !!id,
  });
}

// Hook per recuperare l'albero gerarchico
export function useLocationsTree() {
  return useQuery({
    queryKey: ["locations", "tree"],
    queryFn: getLocationsTree,
  });
}

// Hook per recuperare ubicazioni root
export function useRootLocations() {
  return useQuery({
    queryKey: ["locations", "root"],
    queryFn: getRootLocations,
  });
}

// Hook per recuperare ubicazioni figlie
export function useChildLocations(parentId: string) {
  return useQuery({
    queryKey: ["locations", "children", parentId],
    queryFn: () => getChildLocations(parentId),
    enabled: !!parentId,
  });
}

// Hook per creare una nuova ubicazione
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (location: Omit<LocationInsert, "id" | "owner_id">) =>
      createLocation(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

// Hook per aggiornare un'ubicazione
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, location }: { id: string; location: LocationUpdate }) =>
      updateLocation(id, location),
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
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
