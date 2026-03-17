import { Search, Star, Shield, AlertTriangle, Clock } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";

const brokers = [
  { name: "CH Robinson", mc: "MC-128790", rating: 4.8, reviews: 1247, daysToPay: 15, badges: ["Fast Pay", "Reliable"], lanes: "Southeast, Midwest" },
  { name: "TQL", mc: "MC-340512", rating: 4.5, reviews: 983, daysToPay: 21, badges: ["Reliable"], lanes: "Nationwide" },
  { name: "Echo Global", mc: "MC-382842", rating: 4.2, reviews: 756, daysToPay: 28, badges: [], lanes: "West Coast, Mountain" },
  { name: "Coyote Logistics", mc: "MC-474281", rating: 4.1, reviews: 612, daysToPay: 18, badges: ["Fast Pay"], lanes: "Great Lakes, Northeast" },
  { name: "Landstar", mc: "MC-143711", rating: 3.9, reviews: 445, daysToPay: 30, badges: [], lanes: "Southeast" },
  { name: "Bad Broker LLC", mc: "MC-999001", rating: 1.8, reviews: 89, daysToPay: 60, badges: ["Avoid"], lanes: "Southwest" },
];

export default function BrokerRatingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="font-display text-3xl tracking-wide">BROKER RATINGS</h1>
        <GoldButton size="sm">RATE A BROKER</GoldButton>
      </div>

      <div className="relative animate-fade-up" style={{animationDelay:"100ms"}}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Search by name or MC number..." className="w-full bg-input border border-border rounded-md pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      <div className="space-y-3">
        {brokers.map((b, i) => (
          <div key={b.mc} className="bg-card border border-border rounded-lg p-5 card-hover animate-fade-up" style={{animationDelay:`${150 + i * 80}ms`}}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-xl tracking-wide">{b.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{b.mc}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {b.badges.map(badge => (
                    <span key={badge} className={`text-xs px-2 py-0.5 rounded ${
                      badge === "Avoid" ? "bg-destructive/10 text-destructive" :
                      badge === "Fast Pay" ? "bg-success/10 text-success" :
                      "bg-primary/10 text-primary"
                    }`}>{badge}</span>
                  ))}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={12} /> Avg {b.daysToPay} days to pay</span>
                  <span>Lanes: {b.lanes}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={16} className={s < Math.round(b.rating) ? "text-primary fill-primary" : "text-muted-foreground"} />
                  ))}
                </div>
                <div className="font-mono text-lg text-primary mt-1">{b.rating}</div>
                <div className="text-xs text-muted-foreground">{b.reviews} reviews</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
