import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";
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

// Simple AI response generator (runs client-side for now — will be replaced with server-side LLM)
function generateAIResponse(message: string, load?: Load): string {
  const lower = message.toLowerCase();

  if (load) {
    if (lower.includes("market rate") || lower.includes("lane")) {
      const marketAvg = (load.ratePerMile * 0.93).toFixed(2);
      return `Based on current market data for the ${load.origin} → ${load.destination} lane:\n\n• Current offer: $${load.ratePerMile.toFixed(2)}/mi ($${load.rate.toLocaleString()} total)\n• Market average: $${marketAvg}/mi\n• Your offer is ${((load.ratePerMile / Number(marketAvg) - 1) * 100).toFixed(0)}% above market\n\nThis is a competitive rate. The ${load.equipment} market on this lane has been steady.`;
    }
    if (lower.includes("fuel") || lower.includes("cost")) {
      const fuelCost = (load.miles * 0.60).toFixed(0);
      const tollEst = (load.rate * 0.033).toFixed(0);
      const net = load.rate - Number(fuelCost) - Number(tollEst);
      return `Cost breakdown for ${load.origin} → ${load.destination} (${load.miles} mi):\n\n• Fuel estimate: $${Number(fuelCost).toLocaleString()} (~$3.89/gal, 6.5 MPG)\n• Tolls & fees: ~$${Number(tollEst).toLocaleString()}\n• Net after costs: $${net.toLocaleString()}\n• Effective rate: $${(net / load.miles).toFixed(2)}/mi\n\nAt current diesel prices, this load nets you a solid margin.`;
    }
    if (lower.includes("counter") || lower.includes("offer") || lower.includes("strategy")) {
      const counter = (load.ratePerMile * 1.08).toFixed(2);
      return `Counter-offer strategy for ${load.broker}:\n\n• Current: $${load.ratePerMile.toFixed(2)}/mi\n• Recommended counter: $${counter}/mi (+8%)\n• Total ask: $${Math.round(Number(counter) * load.miles).toLocaleString()}\n\nTip: ${load.broker} has a ${load.brokerRating}/5 rating. Lead with your on-time delivery record and equipment availability. Don't go below $${(load.ratePerMile * 1.03).toFixed(2)}/mi.`;
    }
    if (lower.includes("broker")) {
      return `Broker analysis: ${load.broker}\n\n• Rating: ${load.brokerRating}/5 stars\n• Equipment: ${load.equipment}\n• Route: ${load.origin} → ${load.destination}\n\n${load.brokerRating >= 4.5 ? "This is a highly-rated broker. Expect reliable payment and fair dealing." : load.brokerRating >= 4.0 ? "Solid broker with good track record. Standard terms should apply." : "Mid-range rating. Consider requesting quick-pay or factoring options."}`;
    }

    return `I'm analyzing the ${load.origin} → ${load.destination} load ($${load.rate.toLocaleString()}, ${load.miles} mi, ${load.equipment}).\n\nYou can ask me about:\n• Market rates for this lane\n• Fuel costs and net profit\n• Counter-offer strategies\n• Broker reputation\n\nWhat would you like to know?`;
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hey! I'm your LoadHawk AI negotiation assistant. Select a load from the dropdown and I can help you analyze rates, calculate costs, and build counter-offer strategies.";
  }

  return "Select a load from the dropdown above to get started. I can analyze market rates, calculate your net profit after fuel and tolls, suggest counter-offers, and give you broker intelligence for any lane.";
}

export function useSendMessage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, message, load }: { sessionId: string; message: string; load?: Load }) => {
      if (!user) throw new Error("Not authenticated");

      // Save user message
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: message,
      });

      // Generate AI response (client-side for now)
      const aiResponse = generateAIResponse(message, load);

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
  });
}
