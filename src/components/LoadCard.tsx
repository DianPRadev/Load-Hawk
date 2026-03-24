import { memo } from "react";
import { MapPin, ArrowRight, Clock, Truck } from "lucide-react";
import { GoldButton } from "./GoldButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { useAuthModal } from "@/store/AuthModalContext";
import { useBookLoad, useBookedLoads } from "@/hooks/useLoads";
import type { Load } from "@/types";
import { toast } from "sonner";

interface LoadCardProps extends Load {
  delay?: number;
  showNegotiate?: boolean;
}

export const LoadCard = memo(function LoadCard({ id, origin, destination, miles, weight, rate, ratePerMile, broker, equipment, postedAgo, delay = 0, showNegotiate = true }: LoadCardProps) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { data: bookedLoads = [] } = useBookedLoads();
  const bookMutation = useBookLoad();
  const navigate = useNavigate();
  const isBooked = bookedLoads.some(l => l.id === id);

  const handleBook = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    bookMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Load booked: ${origin} → ${destination}`, {
          description: `$${rate.toLocaleString()} — Check My Loads for details`,
        });
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to book load");
      },
    });
  };

  const handleNegotiate = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    navigate("/ai-negotiator", { state: { loadId: id } });
  };

  return (
    <div
      className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl p-5 card-hover shadow-sm animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-primary shrink-0" />
            <span className="font-display text-lg tracking-tight truncate">{origin}</span>
            <ArrowRight size={13} className="text-muted-foreground shrink-0" />
            <span className="font-display text-lg tracking-tight truncate">{destination}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="font-mono">{miles} mi</span>
            <span className="font-mono">{weight}</span>
            <span className="flex items-center gap-1"><Truck size={11} />{equipment}</span>
            <span>{broker}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{postedAgo}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="font-display text-2xl text-primary">${rate.toLocaleString()}</div>
            <div className="font-mono text-[11px] text-success">${ratePerMile.toFixed(2)}/mi</div>
          </div>
          <div className="flex flex-col gap-2">
            {isBooked ? (
              <GoldButton size="sm" variant="secondary" disabled title="Already booked">Booked</GoldButton>
            ) : (
              <GoldButton size="sm" onClick={handleBook} loading={bookMutation.isPending}>Book Now</GoldButton>
            )}
            {showNegotiate && !isBooked && (
              <GoldButton size="sm" variant="secondary" onClick={handleNegotiate}>Negotiate</GoldButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
