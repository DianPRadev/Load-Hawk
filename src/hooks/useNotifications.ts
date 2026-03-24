import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";
import type { NotificationItem, DbNotification } from "@/types";
import { mapDbNotification } from "@/types";

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async (): Promise<NotificationItem[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as DbNotification[]).map(mapDbNotification);
    },
    enabled: !!user,
  });
}

export function useUnreadCount() {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n) => !n.read).length ?? 0;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    },
  });
}

export function useClearNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    },
  });
}

export function useNotificationSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notification-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return {
        "Load Alerts (Email)": data.load_alerts_email,
        "Load Alerts (SMS)": data.load_alerts_sms,
        "Payment Received": data.payment_received,
        "Rate Changes": data.rate_changes,
        "Negotiation Updates": data.negotiation_updates,
      } as Record<string, boolean>;
    },
    enabled: !!user,
  });
}

export function useUpdateNotificationSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Record<string, boolean>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("notification_settings")
        .update({
          load_alerts_email: settings["Load Alerts (Email)"],
          load_alerts_sms: settings["Load Alerts (SMS)"],
          payment_received: settings["Payment Received"],
          rate_changes: settings["Rate Changes"],
          negotiation_updates: settings["Negotiation Updates"],
        })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
}
