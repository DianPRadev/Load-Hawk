import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";

interface EarningsSummary {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  totalMiles: number;
  deliveredCount: number;
  activeCount: number;
  avgRatePerMile: number;
}

export function useEarningsSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["earnings", "summary", user?.id],
    queryFn: async (): Promise<EarningsSummary> => {
      if (!user) return { totalEarnings: 0, todayEarnings: 0, weekEarnings: 0, totalMiles: 0, deliveredCount: 0, activeCount: 0, avgRatePerMile: 0 };

      const { data, error } = await supabase
        .from("earnings_summary")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { totalEarnings: 0, todayEarnings: 0, weekEarnings: 0, totalMiles: 0, deliveredCount: 0, activeCount: 0, avgRatePerMile: 0 };

      return {
        totalEarnings: Number(data.total_earnings),
        todayEarnings: Number(data.today_earnings),
        weekEarnings: Number(data.week_earnings),
        totalMiles: Number(data.total_miles),
        deliveredCount: Number(data.delivered_count),
        activeCount: Number(data.active_count),
        avgRatePerMile: Number(Number(data.avg_rate_per_mile).toFixed(2)),
      };
    },
    enabled: !!user,
  });
}

export function useEarningsChart(period: "weekly" | "monthly" | "yearly") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["earnings", "chart", period, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("booked_loads")
        .select("booked_at, delivered_at, load:loads(rate)")
        .eq("user_id", user.id)
        .eq("status", "Delivered")
        .order("delivered_at", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const now = new Date();

      if (period === "weekly") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const filtered = data.filter((bl: { delivered_at: string | null }) => bl.delivered_at && new Date(bl.delivered_at) >= weekAgo);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const buckets = days.map((day) => ({ day, earnings: 0 }));
        filtered.forEach((bl: { delivered_at: string | null; load: { rate: number } | null }) => {
          if (!bl.delivered_at || !bl.load) return;
          const d = new Date(bl.delivered_at).getDay();
          const idx = d === 0 ? 6 : d - 1; // Mon=0
          buckets[idx].earnings += bl.load.rate;
        });
        return buckets;
      }

      if (period === "monthly") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const filtered = data.filter((bl: { delivered_at: string | null }) => bl.delivered_at && new Date(bl.delivered_at) >= monthAgo);
        const weeks = ["W1", "W2", "W3", "W4"];
        const buckets = weeks.map((week) => ({ week, earnings: 0 }));
        filtered.forEach((bl: { delivered_at: string | null; load: { rate: number } | null }) => {
          if (!bl.delivered_at || !bl.load) return;
          const dayOfMonth = new Date(bl.delivered_at).getDate();
          const weekIdx = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
          buckets[weekIdx].earnings += bl.load.rate;
        });
        return buckets;
      }

      // yearly
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      const filtered = data.filter((bl: { delivered_at: string | null }) => bl.delivered_at && new Date(bl.delivered_at) >= yearAgo);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const buckets = months.map((month) => ({ month, earnings: 0 }));
      filtered.forEach((bl: { delivered_at: string | null; load: { rate: number } | null }) => {
        if (!bl.delivered_at || !bl.load) return;
        const m = new Date(bl.delivered_at).getMonth();
        buckets[m].earnings += bl.load.rate;
      });
      return buckets;
    },
    enabled: !!user,
  });
}
