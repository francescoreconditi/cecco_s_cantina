// Hooks TanStack Query per operazioni sulle bottiglie
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBottles,
  getBottle,
  createBottle,
  updateBottle,
  deleteBottle,
  getBottlesByWine,
  getBottleStats,
  uploadLabel,
  deleteLabel,
} from "@/lib/api/bottles";
import type { Database } from "@/lib/types/database";

type BottleInsert = Database["public"]["Tables"]["bottles"]["Insert"];
type BottleUpdate = Database["public"]["Tables"]["bottles"]["Update"];

export function useBottles() {
  return useQuery({
    queryKey: ["bottles"],
    queryFn: getBottles,
  });
}

export function useBottle(id: string) {
  return useQuery({
    queryKey: ["bottles", id],
    queryFn: () => getBottle(id),
    enabled: !!id,
  });
}

export function useBottlesByWine(wineId: string) {
  return useQuery({
    queryKey: ["bottles", "wine", wineId],
    queryFn: () => getBottlesByWine(wineId),
    enabled: !!wineId,
  });
}

export function useBottleStats() {
  return useQuery({
    queryKey: ["bottles", "stats"],
    queryFn: getBottleStats,
  });
}

export function useCreateBottle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bottle: Omit<BottleInsert, "id" | "owner_id">) =>
      createBottle(bottle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
    },
  });
}

export function useUpdateBottle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bottle }: { id: string; bottle: BottleUpdate }) =>
      updateBottle(id, bottle),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bottles", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
    },
  });
}

export function useDeleteBottle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBottle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
    },
  });
}

export function useUploadLabel() {
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) =>
      uploadLabel(file, userId),
  });
}

export function useDeleteLabel() {
  return useMutation({
    mutationFn: (url: string) => deleteLabel(url),
  });
}
