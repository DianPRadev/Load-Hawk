import { Search, MapPin, Truck, Filter, Sparkles } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { useState } from "react";

const loads = [
  { origin: "Dallas, TX", dest: "Atlanta, GA", miles: 781, rate: 2890, rpm: 3.70, equip: "Dry Van", broker: "XPO Logistics", rating: 4.6, posted: "12m ago" },
  { origin: "Chicago, IL", dest: "Nashville, TN", miles: 473, rate: 1950, rpm: 4.12, equip: "Reefer", broker: "CH Robinson", rating: 4.8, posted: "25m ago" },
  { origin: "Houston, TX", dest: "Memphis, TN", miles: 586, rate: 2340, rpm: 3.99, equip: "Flatbed", broker: "TQL", rating: 4.5, posted: "38m ago" },
  { origin: "Phoenix, AZ", dest: "Denver, CO", miles: 602, rate: 2480, rpm: 4.12, equip: "Dry Van", broker: "Coyote", rating: 4.1, posted: "1h ago" },
  { origin: "Miami, FL", dest: "Charlotte, NC", miles: 651, rate: 2670, rpm: 4.10, equip: "Reefer", broker: "Echo Global", rating: 4.2, posted: "1h ago" },
  { origin: "LA, CA", dest: "Seattle, WA", miles: 1135, rate: 4200, rpm: 3.70, equip: "Dry Van", broker: "Landstar", rating: 3.9, posted: "2h ago" },
  { origin: "Newark, NJ", dest: "Boston, MA", miles: 215, rate: 980, rpm: 4.56, equip: "Flatbed", broker: "Schneider", rating: 4.3, posted: "2h ago" },
];

export default function FindLoadsPage() {
  const [aiHighlight, setAiHighlight] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Map placeholder */}
      <div className="w-full h-48 bg-card border border-border rounded-lg flex items-center justify-center animate-fade-up relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0px, transparent 50%), radial-gradient(circle at 70% 40%, hsl(var(--info)) 0px, transparent 40%)"
        }} />
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin size={20} />
          <span className="font-display text-xl tracking-wide">FREIGHT LANE MAP</span>
        </div>
        {/* Dots for loads */}
        {[{x:25,y:55},{x:45,y:35},{x:70,y:45},{x:30,y:70},{x:85,y:30},{x:55,y:60},{x:15,y:40}].map((d,i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full gradient-gold animate-pulse" style={{left:`${d.x}%`,top:`${d.y}%`,animationDelay:`${i*200}ms`}} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center animate-fade-up" style={{animationDelay:"100ms"}}>
        <input placeholder="Origin" className="bg-input border border-border rounded-md px-3 py-2 text-sm w-32 focus:ring-1 focus:ring-primary focus:outline-none" />
        <input placeholder="Destination" className="bg-input border border-border rounded-md px-3 py-2 text-sm w-32 focus:ring-1 focus:ring-primary focus:outline-none" />
        <select className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none">
          <option>Equipment</option>
          <option>Dry Van</option>
          <option>Reefer</option>
          <option>Flatbed</option>
        </select>
        <input placeholder="Min Rate" className="bg-input border border-border rounded-md px-3 py-2 text-sm w-24 focus:ring-1 focus:ring-primary focus:outline-none" />
        <input placeholder="Max DH Miles" className="bg-input border border-border rounded-md px-3 py-2 text-sm w-28 focus:ring-1 focus:ring-primary focus:outline-none" />
        <GoldButton size="sm"><Search size={14} /> SEARCH</GoldButton>
        <GoldButton size="sm" variant={aiHighlight ? "primary" : "secondary"} onClick={() => setAiHighlight(!aiHighlight)}>
          <Sparkles size={14} /> AI RECOMMEND
        </GoldButton>
      </div>

      {/* Results table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden animate-fade-up" style={{animationDelay:"200ms"}}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Origin","Destination","Miles","Rate","$/Mile","Equipment","Broker","Rating","Posted","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-display text-primary tracking-wide text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loads.map((l, i) => (
                <tr key={i} className={`border-b border-border hover:bg-card-elevated transition-colors ${i % 2 === 0 ? "bg-card" : "bg-background-secondary"} ${aiHighlight && l.rpm > 4 ? "ring-1 ring-primary/30" : ""}`}>
                  <td className="px-4 py-3">{l.origin}</td>
                  <td className="px-4 py-3">{l.dest}</td>
                  <td className="px-4 py-3 font-mono">{l.miles}</td>
                  <td className="px-4 py-3 font-mono text-primary">${l.rate.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-success">${l.rpm.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{l.equip}</span>
                  </td>
                  <td className="px-4 py-3">{l.broker}</td>
                  <td className="px-4 py-3 font-mono">★ {l.rating}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.posted}</td>
                  <td className="px-4 py-3">
                    <GoldButton size="sm">BOOK</GoldButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
