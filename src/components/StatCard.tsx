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
      className="glass-panel rounded-2xl p-5 card-hover window-chrome animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-[12px] font-medium">{label}</span>
        <div className="text-primary/70 p-1.5 rounded-lg bg-primary/[0.06]">{icon}</div>
      </div>
      <div className="font-display text-3xl text-primary tracking-tight">{value}</div>
      {change && (
        <div className={cn("flex items-center gap-1 mt-2 text-[11px] font-mono", positive ? "text-success" : "text-muted-foreground")}>
          {positive && <TrendingUp size={11} />}
          {change}
        </div>
      )}
    </div>
  );
}
