import { Package, MapPin, ArrowRight, Clock } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";

const loads = [
  { origin: "Dallas, TX", dest: "Atlanta, GA", status: "In Transit", rate: 2890, pickup: "Mar 17", delivery: "Mar 19", broker: "XPO Logistics" },
  { origin: "Houston, TX", dest: "Memphis, TN", status: "Picked Up", rate: 2340, pickup: "Mar 17", delivery: "Mar 18", broker: "TQL" },
  { origin: "Chicago, IL", dest: "Nashville, TN", status: "Delivered", rate: 1950, pickup: "Mar 15", delivery: "Mar 16", broker: "CH Robinson" },
];

const statusColors: Record<string, string> = {
  "In Transit": "bg-info/10 text-info",
  "Picked Up": "bg-primary/10 text-primary",
  "Delivered": "bg-success/10 text-success",
};

export default function MyLoadsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="font-display text-3xl tracking-wide animate-fade-up">MY LOADS</h1>
      <div className="space-y-3">
        {loads.map((l, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5 card-hover animate-fade-up" style={{animationDelay:`${i*100}ms`}}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-primary" />
                  <span className="font-display text-lg">{l.origin}</span>
                  <ArrowRight size={14} className="text-muted-foreground" />
                  <span className="font-display text-lg">{l.dest}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{l.broker}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {l.pickup} — {l.delivery}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-0.5 rounded ${statusColors[l.status]}`}>{l.status}</span>
                <span className="font-mono text-primary font-bold">${l.rate.toLocaleString()}</span>
                <GoldButton size="sm" variant="secondary">DETAILS</GoldButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
