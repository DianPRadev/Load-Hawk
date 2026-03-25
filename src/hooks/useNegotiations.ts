import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";
import type { NegotiationRecord } from "@/types";
import { toast } from "sonner";

export function useNegotiations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["negotiations", user?.id],
    queryFn: async (): Promise<NegotiationRecord[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("negotiations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((n: { route: string; offered: number; countered: number; result: string; saved: number; created_at: string }) => ({
        route: n.route,
        offered: Number(n.offered),
        countered: Number(n.countered),
        result: n.result as NegotiationRecord["result"],
        saved: n.saved,
        date: new Date(n.created_at).toLocaleDateString(),
      }));
    },
    enabled: !!user,
  });
}

export function useAddNegotiation() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (record: { loadId?: string; route: string; offered: number; countered: number; result: string; saved: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("negotiations").insert({
        user_id: user.id,
        load_id: record.loadId || null,
        route: record.route,
        offered: record.offered,
        countered: record.countered,
        result: record.result,
        saved: record.saved,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["negotiations"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save negotiation");
    },
  });
}
