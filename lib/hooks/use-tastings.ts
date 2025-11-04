// Hooks per degustazioni
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTastings, getTasting, createTasting, updateTasting, deleteTasting } from "@/lib/api/tastings";
import type { Database } from "@/lib/types/database";

type TastingInsert = Database["public"]["Tables"]["tastings"]["Insert"];
type TastingUpdate = Database["public"]["Tables"]["tastings"]["Update"];

export function useTastings() {
  return useQuery({ queryKey: ["tastings"], queryFn: getTastings });
}

export function useTasting(id: string) {
  return useQuery({
    queryKey: ["tastings", id],
    queryFn: () => getTasting(id),
    enabled: !!id,
  });
}

export function useCreateTasting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tasting: Omit<TastingInsert, "id" | "owner_id">) =>
      createTasting(tasting),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tastings"] }),
  });
}

export function useUpdateTasting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tasting }: { id: string; tasting: TastingUpdate }) =>
      updateTasting(id, tasting),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tastings", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tastings"] });
    },
  });
}

export function useDeleteTasting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTasting(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tastings"] }),
  });
}
