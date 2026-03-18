import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  origin: string;
  destination: string;
  equipment: string;
  min_rate: number;
  max_miles: number;
  alerts_enabled: boolean;
  created_at: string;
}

export interface SaveSearchInput {
  name: string;
  origin?: string;
  destination?: string;
  equipment?: string;
  min_rate?: number;
  max_miles?: number;
}

export function useSavedSearches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved_searches", user?.id],
    queryFn: async (): Promise<SavedSearch[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavedSearch[];
    },
    enabled: !!user,
  });
}

export function useSaveSearch() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveSearchInput) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("saved_searches").insert({
        user_id: user.id,
        name: input.name,
        origin: input.origin || "",
        destination: input.destination || "",
        equipment: input.equipment || "",
        min_rate: input.min_rate || 0,
        max_miles: input.max_miles || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved_searches"] });
    },
  });
}

export function useDeleteSavedSearch() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("saved_searches")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved_searches"] });
    },
  });
}

export function useToggleSearchAlerts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, currentValue }: { id: string; currentValue: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("saved_searches")
        .update({ alerts_enabled: !currentValue })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved_searches"] });
    },
  });
}
