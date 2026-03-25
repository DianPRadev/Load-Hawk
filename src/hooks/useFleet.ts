import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";
import type { Driver, DbDriver } from "@/types";
import { mapDbDriver } from "@/types";

export function useDrivers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["drivers", user?.id],
    queryFn: async (): Promise<Driver[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("fleet_owner_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as DbDriver[]).map(mapDbDriver);
    },
    enabled: !!user,
  });
}

export function useAddDriver() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (driver: { name: string; status: Driver["status"]; route: string; earnings: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("drivers").insert({
        fleet_owner_id: user.id,
        name: driver.name,
        status: driver.status,
        current_route: driver.route,
        monthly_earnings: driver.earnings,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    },
  });
}

export function useUpdateDriverStatus() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Driver["status"] }) => {
      if (!user) throw new Error("Not authenticated");
      const { error, count } = await supabase
        .from("drivers")
        .update({ status })
        .eq("id", id)
        .eq("fleet_owner_id", user.id);
      if (error) throw error;
      if (count === 0) throw new Error("Driver not found or you don't have permission");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    },
  });
}

export function useRemoveDriver() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error, count } = await supabase
        .from("drivers")
        .delete()
        .eq("id", id)
        .eq("fleet_owner_id", user.id);
      if (error) throw error;
      if (count === 0) throw new Error("Driver not found or you don't have permission");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    },
  });
}
