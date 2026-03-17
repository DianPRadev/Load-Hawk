import { useState, useRef, useEffect } from "react";
import { Bot, Send, MapPin, ArrowRight } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { useApp, type Load } from "@/store/AppContext";
import { useLocation } from "react-router-dom";

const templates = [
  "What's the market rate for this lane?",
  "Analyze fuel costs on this route",
  "Suggest a counter-offer strategy",
  "Tell me about this broker",
];

export default function AINegotiatorPage() {
  const { availableLoads, chatMessages, sendChatMessage, negotiations } = useApp();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = location.state as { loadId?: string } | null;
    if (state?.loadId) {
      setSelectedLoadId(state.loadId);
      const load = availableLoads.find(l => l.id === state.loadId);
      if (load) {
        sendChatMessage(`I want to negotiate the ${load.origin} → ${load.destination} load at $${load.ratePerMile.toFixed(2)}/mi. What do you recommend?`, load);
      }
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const selectedLoad = selectedLoadId ? availableLoads.find(l => l.id === selectedLoadId) : null;

  const handleSend = () => {
    if (!message.trim()) return;
    sendChatMessage(message, selectedLoad || undefined);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const winCount = negotiations.filter(n => n.result === "Won").length;
  const totalNegs = negotiations.length;
  const winRate = totalNegs > 0 ? Math.round((winCount / totalNegs) * 100) : 0;
  const avgSaved = totalNegs > 0
    ? Math.round(negotiations.reduce((s, n) => s + n.saved, 0) / totalNegs)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="font-display text-3xl tracking-tight animate-fade-up">
        <Bot className="inline text-primary mr-2" size={26} /> AI Negotiator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Load context */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <h3 className="font-display text-base mb-4">Select a Load</h3>
            <select
              value={selectedLoadId || ""}
              onChange={e => setSelectedLoadId(e.target.value || null)}
              aria-label="Select a load to negotiate"
              className="w-full glass-input rounded-lg px-3 py-2 text-[13px] focus:outline-none"
            >
              <option value="">Choose a load...</option>
              {availableLoads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.origin} → {l.destination} — ${l.rate.toLocaleString()} (${l.ratePerMile.toFixed(2)}/mi)
                </option>
              ))}
            </select>
          </div>

          {selectedLoad && (
            <div className="glass-panel rounded-2xl p-5 animate-fade-up">
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
                <div className="macos-separator my-3" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Rate</span>
                    <span className="font-mono text-primary">${selectedLoad.rate.toLocaleString()} (${selectedLoad.ratePerMile.toFixed(2)}/mi)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Average</span>
                    <span className="font-mono text-info">${(selectedLoad.ratePerMile * 0.93).toFixed(2)}/mi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommended Counter</span>
                    <span className="font-mono text-primary font-bold">${(selectedLoad.ratePerMile * 1.08).toFixed(2)}/mi</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {negotiations.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <h3 className="font-display text-base mb-4">Negotiation History</h3>
              <div className="space-y-3">
                {negotiations.slice(0, 5).map((n, i) => (
                  <div key={i} className="flex items-center justify-between text-[13px] pb-2 border-b border-[var(--table-border)] last:border-0">
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
        <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col h-[600px] animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base">AI Chat</h3>
            </div>
            {selectedLoad && (
              <p className="text-[11px] text-muted-foreground mt-1.5 ml-[42px]">
                Analyzing: {selectedLoad.origin} → {selectedLoad.destination}
              </p>
            )}
          </div>

          <div className="macos-separator" />

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-[13px] whitespace-pre-wrap ${msg.role === "user"
                  ? "gradient-gold text-primary-foreground rounded-br-md"
                  : "bg-[var(--chat-ai-bg)] border border-[var(--chat-ai-border)] rounded-bl-md"
                  }`}>
                  {msg.role === "ai" && <Bot size={13} className="text-primary mb-1" />}
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Templates */}
          <div className="px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {templates.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(t)}
                  className="text-[11px] bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-[var(--glass-hover)] hover:border-primary/20 transition-all text-muted-foreground"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="macos-separator" />

          <div className="p-3 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedLoad ? `Ask about ${selectedLoad.origin} → ${selectedLoad.destination}...` : "Select a load or ask about market trends..."}
              aria-label="Chat message input"
              className="flex-1 glass-input rounded-full px-4 py-2 text-[13px] focus:outline-none"
            />
            <GoldButton size="sm" onClick={handleSend} disabled={!message.trim()} aria-label="Send message" className="!rounded-full !px-3">
              <Send size={14} />
            </GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
}
