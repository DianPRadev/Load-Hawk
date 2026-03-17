import { Search, MapPin, Sparkles } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { useState, useMemo } from "react";
import { useApp } from "@/store/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function FindLoadsPage() {
  const { availableLoads, bookLoad, bookedLoads } = useApp();
  const navigate = useNavigate();
  const [aiHighlight, setAiHighlight] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [equipment, setEquipment] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxDH, setMaxDH] = useState("");

  const filteredLoads = useMemo(() => {
    return availableLoads.filter(l => {
      if (origin && !l.origin.toLowerCase().includes(origin.toLowerCase())) return false;
      if (destination && !l.destination.toLowerCase().includes(destination.toLowerCase())) return false;
      if (equipment && l.equipment !== equipment) return false;
      if (minRate && l.rate < Number(minRate)) return false;
      if (maxDH && l.miles > Number(maxDH)) return false;
      return true;
    });
  }, [availableLoads, origin, destination, equipment, minRate, maxDH]);

  const displayLoads = useMemo(() => {
    if (aiHighlight) {
      return [...filteredLoads].sort((a, b) => b.ratePerMile - a.ratePerMile);
    }
    return filteredLoads;
  }, [filteredLoads, aiHighlight]);

  const handleClearFilters = () => {
    setOrigin("");
    setDestination("");
    setEquipment("");
    setMinRate("");
    setMaxDH("");
  };

  const handleBook = (loadId: string) => {
    const load = availableLoads.find(l => l.id === loadId);
    if (!load) return;
    bookLoad(loadId);
    toast.success(`Load booked: ${load.origin} → ${load.destination}`, {
      description: `$${load.rate.toLocaleString()} — Check My Loads for details`,
    });
  };

  const isBooked = (loadId: string) => bookedLoads.some(b => b.id === loadId);
  const hasFilters = origin || destination || equipment || minRate || maxDH;
  const inputClass = "glass-input rounded-lg px-3 py-2 text-[13px] focus:outline-none";

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Map */}
      <div className="w-full h-44 glass-panel rounded-2xl flex items-center justify-center animate-fade-up relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0px, transparent 50%), radial-gradient(circle at 70% 40%, hsl(var(--info)) 0px, transparent 40%)"
        }} />
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin size={18} />
          <span className="font-display text-lg tracking-tight">Freight Lane Map</span>
        </div>
        {displayLoads.map((l, i) => (
          <div key={l.id} className="absolute w-2 h-2 rounded-full gradient-gold animate-pulse" style={{ left: `${15 + (i * 11) % 75}%`, top: `${25 + (i * 17) % 50}%`, animationDelay: `${i * 200}ms` }} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 items-center animate-fade-up" style={{ animationDelay: "100ms" }}>
        <input placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} aria-label="Filter by origin" className={`${inputClass} w-28`} />
        <input placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} aria-label="Filter by destination" className={`${inputClass} w-28`} />
        <select value={equipment} onChange={e => setEquipment(e.target.value)} aria-label="Filter by equipment type" className={`${inputClass}`}>
          <option value="">All Equipment</option>
          <option value="Dry Van">Dry Van</option>
          <option value="Reefer">Reefer</option>
          <option value="Flatbed">Flatbed</option>
        </select>
        <input placeholder="Min Rate ($)" value={minRate} onChange={e => setMinRate(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Minimum rate" className={`${inputClass} w-24`} />
        <input placeholder="Max Miles" value={maxDH} onChange={e => setMaxDH(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Maximum miles" className={`${inputClass} w-24`} />
        {hasFilters && (
          <GoldButton size="sm" variant="ghost" onClick={handleClearFilters}>Clear</GoldButton>
        )}
        <GoldButton size="sm" variant={aiHighlight ? "primary" : "secondary"} onClick={() => setAiHighlight(!aiHighlight)}>
          <Sparkles size={13} /> {aiHighlight ? "AI Sorted" : "AI Recommend"}
        </GoldButton>
      </div>

      {/* Count */}
      <div className="text-[12px] text-muted-foreground">
        Showing {displayLoads.length} of {availableLoads.length} loads
        {aiHighlight && " — sorted by best $/mile"}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--table-border)]">
                {["Origin", "Destination", "Miles", "Rate", "$/Mile", "Equipment", "Broker", "Rating", "Posted", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-display text-primary/80 tracking-tight text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayLoads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground text-[13px]">
                    No loads match your filters. Try adjusting your search criteria.
                  </td>
                </tr>
              ) : (
                displayLoads.map((l, i) => {
                  const booked = isBooked(l.id);
                  return (
                    <tr key={l.id} className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${aiHighlight && l.ratePerMile > 4 ? "bg-primary/[0.03]" : ""}`}>
                      <td className="px-4 py-3">{l.origin}</td>
                      <td className="px-4 py-3">{l.destination}</td>
                      <td className="px-4 py-3 font-mono text-[12px]">{l.miles}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-primary">${l.rate.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-success">${l.ratePerMile.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="pill-badge bg-primary/10 text-primary text-[10px]">{l.equipment}</span>
                      </td>
                      <td className="px-4 py-3">{l.broker}</td>
                      <td className="px-4 py-3 font-mono text-[12px]">★ {l.brokerRating}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.postedAgo}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {booked ? (
                            <GoldButton size="sm" variant="secondary" disabled>Booked</GoldButton>
                          ) : (
                            <>
                              <GoldButton size="sm" onClick={() => handleBook(l.id)}>Book</GoldButton>
                              <GoldButton size="sm" variant="secondary" onClick={() => navigate("/ai-negotiator", { state: { loadId: l.id } })}>
                                Negotiate
                              </GoldButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
