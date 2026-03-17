import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
  delay?: number;
}

export function StatCard({ label, value, change, positive, icon, delay = 0 }: StatCardProps) {
  return (
    <div
      className="bg-card border border-border rounded-lg p-5 card-hover animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-sm">{label}</span>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="font-display text-3xl text-primary tracking-wide">{value}</div>
      {change && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs font-mono", positive ? "text-success" : "text-destructive")}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change} vs last week
        </div>
      )}
    </div>
  );
}
