import { useState, useRef, useEffect } from "react";
import { Bot, Send, MapPin, ArrowRight, ChevronDown, ChevronUp, Info } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { PageMeta } from "@/components/PageMeta";
import { useAvailableLoads } from "@/hooks/useLoads";
import { useChatMessages, useCreateChatSession, useSendMessage } from "@/hooks/useChat";
import { useNegotiations, useAddNegotiation } from "@/hooks/useNegotiations";
import { useProfile } from "@/hooks/useProfile";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const templates = [
  "What's the market rate for this lane?",
  "Analyze fuel costs on this route",
  "Suggest a counter-offer strategy",
  "Tell me about this broker",
];

export default function AINegotiatorPage() {
  const { data: availableLoads = [] } = useAvailableLoads();
  const { data: negotiations = [] } = useNegotiations();
  const { data: profile } = useProfile();
  const addNegotiation = useAddNegotiation();
  const loc = useLocation();
  const [message, setMessage] = useState("");
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const { data: chatMessages = [] } = useChatMessages(sessionId);
  const createSession = useCreateChatSession();
  const sendMsg = useSendMessage();

  // Handle load passed via navigation state
  useEffect(() => {
    const state = loc.state as { loadId?: string } | null;
    if (state?.loadId) {
      setSelectedLoadId(state.loadId);
      window.history.replaceState({}, document.title);
    }
  }, [loc.state]);

  // Auto-create session when load is selected
  useEffect(() => {
    if (selectedLoadId && !sessionId && !initializedRef.current && availableLoads.length > 0) {
      initializedRef.current = true;
      createSession.mutate(selectedLoadId, {
        onSuccess: (id) => {
          setSessionId(id);
          const load = availableLoads.find(l => l.id === selectedLoadId);
          if (load) {
            sendMsg.mutate({
              sessionId: id,
              message: `I want to negotiate the ${load.origin} → ${load.destination} load at $${load.ratePerMile.toFixed(2)}/mi. What do you recommend?`,
              load,
              history: [],
            }, {
              onError: (err) => toast.error(err instanceof Error ? err.message : "AI service unavailable. Try again."),
            });
          }
        },
      });
    }
  }, [selectedLoadId, sessionId, availableLoads]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, pendingMessage]);

  const selectedLoad = selectedLoadId ? availableLoads.find(l => l.id === selectedLoadId) : null;

  const handleSend = async () => {
    if (!message.trim()) return;
    let sid = sessionId;
    if (!sid) {
      sid = await createSession.mutateAsync(selectedLoadId || undefined);
      setSessionId(sid);
    }
    setPendingMessage(message);
    sendMsg.mutate({ sessionId: sid, message, load: selectedLoad || undefined, history: chatMessages }, {
      onSuccess: () => {
        if (selectedLoad) {
          addNegotiation.mutate({
            loadId: selectedLoad.id,
            route: `${selectedLoad.origin} → ${selectedLoad.destination}`,
            offered: selectedLoad.ratePerMile,
            countered: +(selectedLoad.ratePerMile * 1.08).toFixed(2),
            result: "Pending",
            saved: 0,
          });
        }
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "AI service unavailable. Try again."),
      onSettled: () => setPendingMessage(null),
    });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleLoadChange = (newLoadId: string | null) => {
    setSelectedLoadId(newLoadId);
    setSessionId(null);
    initializedRef.current = false;
  };

  const winCount = negotiations.filter(n => n.result === "Won").length;
  const totalNegs = negotiations.length;
  const winRate = totalNegs > 0 ? Math.round((winCount / totalNegs) * 100) : 0;
  const avgSaved = totalNegs > 0 ? Math.round(negotiations.reduce((s, n) => s + n.saved, 0) / totalNegs) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageMeta title="AI Negotiator" />
      <h1 className="font-display text-3xl tracking-tight animate-fade-up">
        <Bot className="inline text-primary mr-2" size={26} /> AI Negotiator
      </h1>

      {/* Mobile load selector - always visible above chat on small screens */}
      <div className="lg:hidden">
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-display text-base mb-3">Select a Load</h3>
          <select value={selectedLoadId || ""} onChange={e => handleLoadChange(e.target.value || null)} aria-label="Select a load to negotiate" className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1f1f1f] focus:border-[#f5a820] focus:ring-1 focus:ring-[#f5a820]/20 rounded-lg px-3 py-2 text-[13px] focus:outline-none">
            <option value="">Choose a load...</option>
            {availableLoads.map(l => (
              <option key={l.id} value={l.id}>{l.origin} → {l.destination} — ${l.rate.toLocaleString()} (${l.ratePerMile.toFixed(2)}/mi)</option>
            ))}
          </select>
        </div>

        {/* Mobile collapsible load details */}
        {selectedLoad && (
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm mt-3 animate-fade-up">
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-[13px]"
              aria-expanded={detailsOpen}
              aria-controls="mobile-load-details"
            >
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-primary" />
                <span className="font-medium">{selectedLoad.origin}</span>
                <ArrowRight size={11} className="text-muted-foreground" />
                <span className="font-medium">{selectedLoad.destination}</span>
                <span className="text-muted-foreground mx-1">|</span>
                <span className="font-mono text-primary">${selectedLoad.ratePerMile.toFixed(2)}/mi</span>
              </div>
              {detailsOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            {detailsOpen && (
              <div id="mobile-load-details" className="px-4 pb-4 space-y-3 text-[13px] border-t border-gray-200 dark:border-[#1f1f1f] pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Miles:</span> <span className="font-mono">{selectedLoad.miles}</span></div>
                  <div><span className="text-muted-foreground">Weight:</span> <span className="font-mono">{selectedLoad.weight}</span></div>
                  <div><span className="text-muted-foreground">Equipment:</span> {selectedLoad.equipment}</div>
                  <div><span className="text-muted-foreground">Broker:</span> {selectedLoad.broker}</div>
                </div>
                <div className="border-t border-gray-200 dark:border-[#1f1f1f] my-3" />
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Current Rate</span><span className="font-mono text-primary">${selectedLoad.rate.toLocaleString()} (${selectedLoad.ratePerMile.toFixed(2)}/mi)</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Average</span>
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-info">${(selectedLoad.ratePerMile * 0.93).toFixed(2)}/mi</span>
                      <Info size={14} className="text-muted-foreground cursor-help" title="Estimated at 93% of current rate. Based on general market data — verify with your broker." />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommended Counter</span>
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-primary font-bold">${(selectedLoad.ratePerMile * 1.08).toFixed(2)}/mi</span>
                      <Info size={14} className="text-muted-foreground cursor-help" title="Suggested at 108% of current rate. This is an AI estimate — always confirm with your broker directly." />
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Based on 8% above current offer</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="hidden lg:block lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <h3 className="font-display text-base mb-4">Select a Load</h3>
            <select value={selectedLoadId || ""} onChange={e => handleLoadChange(e.target.value || null)} aria-label="Select a load to negotiate" className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1f1f1f] focus:border-[#f5a820] focus:ring-1 focus:ring-[#f5a820]/20 rounded-lg px-3 py-2 text-[13px] focus:outline-none">
              <option value="">Choose a load...</option>
              {availableLoads.map(l => (
                <option key={l.id} value={l.id}>{l.origin} → {l.destination} — ${l.rate.toLocaleString()} (${l.ratePerMile.toFixed(2)}/mi)</option>
              ))}
            </select>
          </div>

          {selectedLoad && (
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-5 animate-fade-up">
              <h3 className="font-display text-base mb-4">Load Details</h3>
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-primary" />
                  <span>{selectedLoad.origin}</span>
                  <ArrowRight size={11} className="text-muted-foreground" />
                  <span>{selectedLoad.destination}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Miles:</span> <span className="font-mono">{selectedLoad.miles}</span></div>
                  <div><span className="text-muted-foreground">Weight:</span> <span className="font-mono">{selectedLoad.weight}</span></div>
                  <div><span className="text-muted-foreground">Equipment:</span> {selectedLoad.equipment}</div>
                  <div><span className="text-muted-foreground">Broker:</span> {selectedLoad.broker}</div>
                </div>
                <div className="border-t border-gray-200 dark:border-[#1f1f1f] my-3" />
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Current Rate</span><span className="font-mono text-primary">${selectedLoad.rate.toLocaleString()} (${selectedLoad.ratePerMile.toFixed(2)}/mi)</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Average</span>
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-info">${(selectedLoad.ratePerMile * 0.93).toFixed(2)}/mi</span>
                      <Info size={14} className="text-muted-foreground cursor-help" title="Estimated at 93% of current rate. Based on general market data — verify with your broker." />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommended Counter</span>
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-primary font-bold">${(selectedLoad.ratePerMile * 1.08).toFixed(2)}/mi</span>
                      <Info size={14} className="text-muted-foreground cursor-help" title="Suggested at 108% of current rate. This is an AI estimate — always confirm with your broker directly." />
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Based on 8% above current offer</div>
                </div>
              </div>
            </div>
          )}

          {negotiations.length > 0 && (
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <h3 className="font-display text-base mb-4">Negotiation History</h3>
              <div className="space-y-3">
                {negotiations.slice(0, 5).map((n, i) => (
                  <div key={i} className="flex items-center justify-between text-[13px] pb-2 border-b border-gray-200 dark:border-[#1f1f1f] last:border-0">
                    <div>
                      <div>{n.route}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">${n.offered}/mi → ${n.countered}/mi</div>
                    </div>
                    <div className="text-right">
                      <span className={`pill-badge text-[10px] ${n.result === "Won" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{n.result}</span>
                      {n.saved > 0 && <div className="text-[11px] text-success font-mono mt-1">+${n.saved}</div>}
                    </div>
                  </div>
                ))}
              </div>
              {totalNegs > 0 && (
                <div className="mt-3 text-[11px] text-muted-foreground">
                  Win rate: <span className="font-mono text-success">{winRate}%</span> · Avg saved: <span className="font-mono text-primary">${avgSaved}/load</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="col-span-1 lg:col-span-3 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm flex flex-col h-[calc(100vh-12rem)] sm:h-[600px] animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="p-4">
            {profile && profile.subscriptionTier !== "pro" && (
              <div className="text-[12px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg px-3 py-2 mb-3">
                Free plan: AI negotiations are limited. Upgrade to Pro for unlimited access.
              </div>
            )}
            <h3 className="font-display text-base">AI Chat</h3>
            {selectedLoad && <p className="text-[11px] text-muted-foreground mt-1.5">Analyzing: {selectedLoad.origin} → {selectedLoad.destination}</p>}
          </div>
          <div className="border-t border-gray-200 dark:border-[#1f1f1f]" />

          <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite" aria-label="Chat messages">
            {chatMessages.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <Bot size={32} className="text-primary/30 mx-auto" />
                <div className="text-muted-foreground text-[13px]">Select a load and start chatting to get AI-powered negotiation advice.</div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 inline-flex items-start gap-2 text-left max-w-md mx-auto">
                  <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-[11px] text-muted-foreground">AI responses are generated suggestions — always verify rates with your broker</span>
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-[13px] whitespace-pre-wrap ${msg.role === "user" ? "gradient-gold text-primary-foreground rounded-br-md" : "bg-[var(--chat-ai-bg)] border border-[var(--chat-ai-border)] rounded-bl-md"}`}>
                  {msg.role === "ai" && <Bot size={13} className="text-primary mb-1" />}
                  {msg.text}
                </div>
              </div>
            ))}
            {pendingMessage && (
              <div className="flex justify-end">
                <div className="max-w-[80%] p-3 rounded-2xl rounded-br-md text-[13px] whitespace-pre-wrap gradient-gold text-primary-foreground opacity-70">
                  {pendingMessage}
                </div>
              </div>
            )}
            {sendMsg.isPending && (
              <div className="flex justify-start">
                <div className="bg-[var(--chat-ai-bg)] border border-[var(--chat-ai-border)] rounded-2xl rounded-bl-md p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {templates.map((t, i) => (
                <button key={i} onClick={() => setMessage(t)} className="text-[11px] bg-gray-50 dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#1f1f1f] rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:border-primary/20 transition-all text-muted-foreground">{t}</button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-[#1f1f1f]" />
          <div className="p-3 flex gap-2 items-center">
            <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={selectedLoad ? `Ask about ${selectedLoad.origin} → ${selectedLoad.destination}...` : "Select a load or ask about market trends..."} aria-label="Chat message input" className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1f1f1f] focus:border-[#f5a820] focus:ring-1 focus:ring-[#f5a820]/20 rounded-full px-4 py-2 text-[13px] focus:outline-none" />
            <GoldButton size="sm" onClick={handleSend} disabled={!message.trim() || sendMsg.isPending} aria-label="Send message" className="!rounded-full !px-3"><Send size={14} /></GoldButton>
          </div>
          <div className="text-center text-[10px] text-muted-foreground/40 pb-2">Press Enter to send</div>
        </div>
      </div>
    </div>
  );
}
