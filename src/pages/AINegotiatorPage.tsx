import { useState } from "react";
import { Bot, Send, MapPin, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";

const templates = [
  "Based on current spot rates, I'd like to counter at $X.XX/mile",
  "Given fuel costs and deadhead, my minimum is $X.XX/mile",
  "I can accept at $X.XX if pickup is flexible by 1 day",
];

const chatHistory = [
  { role: "ai" as const, text: "I've analyzed the current spot rates on the Dallas → Atlanta lane. The market average is $3.45/mile, but rates have been trending up 8% this week. I recommend countering at $3.85/mile." },
  { role: "user" as const, text: "What about fuel costs on this route?" },
  { role: "ai" as const, text: "Good thinking. Current diesel average along I-20 is $3.89/gal. At 6.5 MPG, your fuel cost is roughly $0.60/mile. With a counter of $3.85/mile, your net margin would be $2.54/mile after fuel — well above the profitable threshold of $2.00/mile." },
];

const pastNegotiations = [
  { route: "Houston → Memphis", offered: 3.20, countered: 3.85, result: "Won", saved: 380 },
  { route: "Chicago → Nashville", offered: 3.50, countered: 4.10, result: "Won", saved: 284 },
  { route: "Phoenix → Denver", offered: 3.10, countered: 3.60, result: "Lost", saved: 0 },
];

export default function AINegotiatorPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="font-display text-3xl tracking-wide animate-fade-up">
        <Bot className="inline text-primary mr-2" size={28} /> AI NEGOTIATOR
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Load context - left */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 animate-fade-up" style={{animationDelay:"100ms"}}>
            <h3 className="font-display text-lg mb-4">LOAD DETAILS</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <span>Dallas, TX</span>
                <ArrowRight size={12} className="text-muted-foreground" />
                <span>Atlanta, GA</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Miles:</span> <span className="font-mono">781</span></div>
                <div><span className="text-muted-foreground">Weight:</span> <span className="font-mono">42,000 lbs</span></div>
                <div><span className="text-muted-foreground">Equipment:</span> Dry Van</div>
                <div><span className="text-muted-foreground">Broker:</span> XPO Logistics</div>
              </div>
              <div className="border-t border-border pt-3 mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offered Rate</span>
                  <span className="font-mono text-destructive">$2,580 ($3.30/mi)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Average</span>
                  <span className="font-mono text-info">$2,694 ($3.45/mi)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommended Counter</span>
                  <span className="font-mono text-primary font-bold">$3,007 ($3.85/mi)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Past negotiations */}
          <div className="bg-card border border-border rounded-lg p-5 animate-fade-up" style={{animationDelay:"200ms"}}>
            <h3 className="font-display text-lg mb-4">NEGOTIATION HISTORY</h3>
            <div className="space-y-3">
              {pastNegotiations.map((n, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <div>
                    <div>{n.route}</div>
                    <div className="text-xs text-muted-foreground font-mono">${n.offered}/mi → ${n.countered}/mi</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded ${n.result === "Won" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{n.result}</span>
                    {n.saved > 0 && <div className="text-xs text-success font-mono mt-1">+${n.saved}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Win rate: <span className="font-mono text-success">67%</span> · Avg saved: <span className="font-mono text-primary">$221/load</span></div>
          </div>
        </div>

        {/* Chat - right */}
        <div className="lg:col-span-3 bg-card border border-border rounded-lg flex flex-col h-[600px] animate-fade-up" style={{animationDelay:"150ms"}}>
          <div className="p-4 border-b border-border">
            <h3 className="font-display text-lg">AI CHAT</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "gradient-gold text-primary-foreground"
                    : "bg-card-elevated border border-border"
                }`}>
                  {msg.role === "ai" && <Bot size={14} className="text-primary mb-1" />}
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Templates */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {templates.map((t, i) => (
                <button key={i} onClick={() => setMessage(t)} className="text-xs bg-card-elevated border border-border rounded px-3 py-1.5 whitespace-nowrap hover:border-primary/30 transition-colors text-muted-foreground">
                  {t.slice(0, 40)}...
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your counter-offer strategy..."
              className="flex-1 bg-input border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <GoldButton size="sm"><Send size={14} /></GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
}
