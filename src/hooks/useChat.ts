import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";
import type { ChatMessage, Load } from "@/types";

export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ["chat", "messages", sessionId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map((m: { role: string; content: string }) => ({
        role: m.role as ChatMessage["role"],
        text: m.content,
      }));
    },
    enabled: !!sessionId,
  });
}

export function useCreateChatSession() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (loadId?: string) => {
      if (!user) throw new Error("Not authenticated");
      const insert: Record<string, unknown> = { user_id: user.id };
      if (loadId) insert.load_id = loadId;

      const { data, error } = await supabase.from("chat_sessions").insert(insert).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

// Call the server-side AI negotiation endpoint (DeepSeek V3 via HF)
async function callNegotiateAPI(message: string, load?: Load, history?: ChatMessage[]): Promise<string> {
  const res = await authFetch("/api/negotiate", {
    method: "POST",
    body: JSON.stringify({
      message,
      load: load ? {
        origin: load.origin,
        destination: load.destination,
        miles: load.miles,
        rate: load.rate,
        ratePerMile: load.ratePerMile,
        equipment: load.equipment,
        broker: load.broker,
        brokerRating: load.brokerRating,
      } : undefined,
      history: history?.map(m => ({ role: m.role, content: m.text })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "AI service unavailable" }));
    throw new Error(err.error || "Failed to get AI response");
  }

  const data = await res.json();
  return data.response;
}

export function useSendMessage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, message, load, history }: { sessionId: string; message: string; load?: Load; history?: ChatMessage[] }) => {
      if (!user) throw new Error("Not authenticated");

      // Save user message
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: message,
      });

      // Call server-side AI
      const aiResponse = await callNegotiateAPI(message, load, history);

      // Save AI response
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "ai",
        content: aiResponse,
      });

      return aiResponse;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["chat", "messages", vars.sessionId] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again.");
    },
  });
}
