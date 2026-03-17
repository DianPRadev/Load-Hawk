import { Package, MapPin, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { useApp, type LoadStatus } from "@/store/AppContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  "In Transit": "bg-info/15 text-info",
  "Picked Up": "bg-primary/15 text-primary",
  "Delivered": "bg-success/15 text-success",
};

const STATUS_FLOW: LoadStatus[] = ["Picked Up", "In Transit", "Delivered"];

export default function MyLoadsPage() {
  const { bookedLoads, updateLoadStatus } = useApp();
  const navigate = useNavigate();

  const handleAdvanceStatus = (loadId: string, currentStatus: LoadStatus) => {
    const currentIdx = STATUS_FLOW.indexOf(currentStatus);
    if (currentIdx < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIdx + 1];
      updateLoadStatus(loadId, nextStatus);
      toast.success(`Status updated to: ${nextStatus}`);
    }
  };

  const getNextStatusLabel = (status: LoadStatus): string | null => {
    const idx = STATUS_FLOW.indexOf(status);
    if (idx < STATUS_FLOW.length - 1) {
      const next = STATUS_FLOW[idx + 1];
      return next === "In Transit" ? "Start Transit" : next === "Delivered" ? "Mark Delivered" : null;
    }
    return null;
  };

  if (bookedLoads.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="font-display text-3xl tracking-tight animate-fade-up">My Loads</h1>
        <div className="glass-panel rounded-2xl p-12 text-center animate-fade-up" style={{ animationDelay: "100ms" }}>
          <AlertCircle size={44} className="text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="font-display text-xl mb-2">No Loads Booked Yet</h2>
          <p className="text-muted-foreground text-[13px] mb-6">Head to Find Loads to book your first load</p>
          <GoldButton onClick={() => navigate("/find-loads")}>Find Loads</GoldButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="font-display text-3xl tracking-tight">My Loads</h1>
        <span className="text-[13px] text-muted-foreground">{bookedLoads.length} load{bookedLoads.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-3">
        {bookedLoads.map((l, i) => {
          const nextLabel = getNextStatusLabel(l.status);
          return (
            <div key={l.id} className="glass-panel rounded-2xl p-5 card-hover animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-primary" />
                    <span className="font-display text-lg">{l.origin}</span>
                    <ArrowRight size={13} className="text-muted-foreground" />
                    <span className="font-display text-lg">{l.destination}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span>{l.broker}</span>
                    <span className="font-mono">{l.miles} mi</span>
                    <span>{l.equipment}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {l.pickup} — {l.delivery}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`pill-badge text-[11px] ${statusColors[l.status]}`}>{l.status}</span>
                  <span className="font-mono text-primary font-bold">${l.rate.toLocaleString()}</span>
                  {nextLabel && (
                    <GoldButton size="sm" onClick={() => handleAdvanceStatus(l.id, l.status)}>
                      {nextLabel}
                    </GoldButton>
                  )}
                  {l.status === "Delivered" && (
                    <GoldButton size="sm" variant="secondary" disabled>Completed</GoldButton>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
