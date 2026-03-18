import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";
import type { Load, BookedLoad, DbLoad, DbBookedLoad } from "@/types";
import { mapDbLoad } from "@/types";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function useAvailableLoads(filters?: {
  origin?: string;
  destination?: string;
  equipment?: string;
  minRate?: number;
  maxMiles?: number;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;

  return useQuery({
    queryKey: ["loads", "available", filters],
    queryFn: async (): Promise<Load[]> => {
      let q = supabase
        .from("loads")
        .select("*")
        .eq("status", "available")
        .order("posted_at", { ascending: false });

      if (filters?.origin) q = q.ilike("origin", `%${filters.origin}%`);
      if (filters?.destination) q = q.ilike("destination", `%${filters.destination}%`);
      if (filters?.equipment) q = q.eq("equipment", filters.equipment);
      if (filters?.minRate) q = q.gte("rate", filters.minRate);
      if (filters?.maxMiles) q = q.lte("miles", filters.maxMiles);

      q = q.range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error } = await q;
      if (error) throw error;
      return (data as DbLoad[]).map(mapDbLoad);
    },
    staleTime: 30_000,
  });
}

export function useAvailableLoadsCount(filters?: {
  origin?: string;
  destination?: string;
  equipment?: string;
  minRate?: number;
  maxMiles?: number;
}) {
  return useQuery({
    queryKey: ["loads", "available", "count", filters],
    queryFn: async (): Promise<number> => {
      let q = supabase
        .from("loads")
        .select("*", { count: "exact", head: true })
        .eq("status", "available");

      if (filters?.origin) q = q.ilike("origin", `%${filters.origin}%`);
      if (filters?.destination) q = q.ilike("destination", `%${filters.destination}%`);
      if (filters?.equipment) q = q.eq("equipment", filters.equipment);
      if (filters?.minRate) q = q.gte("rate", filters.minRate);
      if (filters?.maxMiles) q = q.lte("miles", filters.maxMiles);

      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 30_000,
  });
}

export function useBookedLoads() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["loads", "booked", user?.id],
    queryFn: async (): Promise<BookedLoad[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("booked_loads")
        .select("*, load:loads(*)")
        .eq("user_id", user.id)
        .order("booked_at", { ascending: false });
      if (error) throw error;

      return (data as (DbBookedLoad & { load: DbLoad })[]).map((bl) => {
        const load = mapDbLoad(bl.load);
        return {
          ...load,
          status: bl.status as BookedLoad["status"],
          pickup: bl.pickup_date,
          delivery: bl.delivery_date || "",
          bookedAt: new Date(bl.booked_at).getTime(),
        };
      });
    },
    enabled: !!user,
  });
}

export function useBookLoad() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (loadId: string) => {
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const pickup = formatDate(now);
      const deliveryDate = new Date(now);
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const delivery = formatDate(deliveryDate);

      const { error } = await supabase.from("booked_loads").insert({
        user_id: user.id,
        load_id: loadId,
        status: "Picked Up",
        pickup_date: pickup,
        delivery_date: delivery,
      });
      if (error) throw error;

      // Create notification
      const { data: load } = await supabase.from("loads").select("origin, destination, rate").eq("id", loadId).single();
      if (load) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          text: `Load booked: ${load.origin} → ${load.destination} — $${load.rate.toLocaleString()}`,
          type: "load",
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loads"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdateLoadStatus() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookedLoadId, loadId, newStatus }: { bookedLoadId: string; loadId: string; newStatus: string }) => {
      if (!user) throw new Error("Not authenticated");

      const update: Record<string, unknown> = { status: newStatus };
      if (newStatus === "Delivered") {
        update.delivered_at = new Date().toISOString();
      }

      // Find the booked_load row by user_id + load_id
      const { error } = await supabase
        .from("booked_loads")
        .update(update)
        .eq("user_id", user.id)
        .eq("load_id", loadId);
      if (error) throw error;

      // Notification
      const { data: load } = await supabase.from("loads").select("origin, destination").eq("id", loadId).single();
      if (load) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          text: `${load.origin} → ${load.destination} — Status: ${newStatus}`,
          type: newStatus === "Delivered" ? "payment" : "load",
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loads"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["earnings"] });
    },
  });
}

export function useIsBooked(loadId: string) {
  const { data: booked } = useBookedLoads();
  return booked?.some((l) => l.id === loadId) ?? false;
}
