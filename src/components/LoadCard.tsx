import { MapPin, ArrowRight, Clock, Truck } from "lucide-react";
import { GoldButton } from "./GoldButton";

interface LoadCardProps {
  origin: string;
  destination: string;
  miles: number;
  weight: string;
  rate: number;
  ratePerMile: number;
  broker: string;
  equipment: string;
  postedAgo: string;
  delay?: number;
}

export function LoadCard({ origin, destination, miles, weight, rate, ratePerMile, broker, equipment, postedAgo, delay = 0 }: LoadCardProps) {
  return (
    <div
      className="bg-card border border-border rounded-lg p-5 card-hover animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-primary shrink-0" />
            <span className="font-display text-lg tracking-wide">{origin}</span>
            <ArrowRight size={14} className="text-muted-foreground shrink-0" />
            <span className="font-display text-lg tracking-wide">{destination}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{miles} mi</span>
            <span className="font-mono">{weight}</span>
            <span className="flex items-center gap-1"><Truck size={12} />{equipment}</span>
            <span>{broker}</span>
            <span className="flex items-center gap-1"><Clock size={12} />{postedAgo}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="font-display text-2xl text-primary">${rate.toLocaleString()}</div>
            <div className="font-mono text-xs text-success">${ratePerMile.toFixed(2)}/mi</div>
          </div>
          <div className="flex flex-col gap-2">
            <GoldButton size="sm">BOOK NOW</GoldButton>
            <GoldButton size="sm" variant="secondary">NEGOTIATE</GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
}
