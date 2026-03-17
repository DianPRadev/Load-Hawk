import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";
import type { Broker, DbBroker } from "@/types";

function mapDbBroker(db: DbBroker, userRatings: { rating: number; comment: string; date: string }[] = []): Broker {
  return {
    id: db.id,
    name: db.name,
    mc: db.mc,
    rating: Number(db.rating),
    reviews: db.total_reviews,
    daysToPay: db.days_to_pay,
    badges: db.badges || [],
    lanes: db.lanes,
    userRatings,
  };
}

export function useBrokers(search?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["brokers", search, user?.id],
    queryFn: async (): Promise<Broker[]> => {
      let q = supabase.from("brokers").select("*").order("rating", { ascending: false });

      if (search) {
        q = q.or(`name.ilike.%${search}%,mc.ilike.%${search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;

      const brokers = data as DbBroker[];

      // Fetch user's own ratings if logged in
      if (user) {
        const { data: ratings } = await supabase
          .from("broker_ratings")
          .select("broker_id, rating, comment, created_at")
          .eq("user_id", user.id);

        const ratingsByBroker: Record<string, { rating: number; comment: string; date: string }[]> = {};
        (ratings || []).forEach((r: { broker_id: string; rating: number; comment: string; created_at: string }) => {
          if (!ratingsByBroker[r.broker_id]) ratingsByBroker[r.broker_id] = [];
          ratingsByBroker[r.broker_id].push({
            rating: r.rating,
            comment: r.comment || "",
            date: new Date(r.created_at).toLocaleDateString(),
          });
        });

        return brokers.map((b) => mapDbBroker(b, ratingsByBroker[b.id] || []));
      }

      return brokers.map((b) => mapDbBroker(b));
    },
    staleTime: 60_000,
  });
}

export function useRateBroker() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ brokerId, rating, comment }: { brokerId: string; rating: number; comment: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("broker_ratings").insert({
        broker_id: brokerId,
        user_id: user.id,
        rating,
        comment,
      });
      if (error) throw error;

      // The DB trigger auto-recalculates broker.rating
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brokers"] });
    },
  });
}
