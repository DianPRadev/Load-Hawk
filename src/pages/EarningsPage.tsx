import { useState } from "react";
import { Download } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useEarningsSummary, useEarningsChart } from "@/hooks/useEarnings";
import { useBookedLoads } from "@/hooks/useLoads";
import { toast } from "sonner";

export default function EarningsPage() {
  const [view, setView] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const { data: earnings } = useEarningsSummary();
  const { data: chartData = [] } = useEarningsChart(view);
  const { data: bookedLoads = [] } = useBookedLoads();

  const grossEarnings = earnings?.totalEarnings ?? 0;
  const totalMiles = earnings?.totalMiles ?? 0;
  const deliveredCount = earnings?.deliveredCount ?? 0;
  const hasRealData = deliveredCount > 0;

  const fuelCosts = Math.round(totalMiles * 0.60);
  const tollsFees = Math.round(grossEarnings * 0.033);
  const netProfit = grossEarnings - fuelCosts - tollsFees;

  const breakdown = [
    { label: "Gross Earnings", value: `$${grossEarnings.toLocaleString()}`, color: "text-primary" },
    { label: "Fuel Costs", value: `-$${fuelCosts.toLocaleString()}`, color: "text-destructive" },
    { label: "Tolls & Fees", value: `-$${tollsFees.toLocaleString()}`, color: "text-destructive" },
    { label: "Net Profit", value: `$${netProfit.toLocaleString()}`, color: "text-success" },
  ];

  const handleExport = () => {
    if (bookedLoads.length === 0) return;
    const csv = ["Route,Rate,Miles,Status,Booked Date"];
    bookedLoads.forEach(l => {
      csv.push(`"${l.origin} → ${l.destination}",${l.rate},${l.miles},${l.status},${new Date(l.bookedAt).toLocaleDateString()}`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loadhawk-earnings.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const dataKey = view === "weekly" ? "day" : view === "monthly" ? "week" : "month";

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Earnings</h1>
          <p className="text-muted-foreground text-[13px]">
            {hasRealData
              ? `Based on ${deliveredCount} delivered load${deliveredCount !== 1 ? "s" : ""}`
              : "Book and deliver loads to see real earnings"
            }
          </p>
        </div>
        <GoldButton size="sm" variant="secondary" onClick={handleExport} disabled={bookedLoads.length === 0}>
          <Download size={13} /> Export CSV
        </GoldButton>
      </div>

      <div className="glass-panel rounded-2xl p-8 text-center window-chrome animate-fade-up" style={{ animationDelay: "100ms" }}>
        <p className="text-muted-foreground text-[12px] mb-2">{hasRealData ? "Total Earnings" : "No earnings yet"}</p>
        <h2 className="font-display text-6xl gradient-gold-text">${grossEarnings.toLocaleString()}</h2>
        {!hasRealData && (
          <p className="text-muted-foreground text-[11px] mt-2">Book loads and mark them delivered to track real earnings</p>
        )}
      </div>

      <div className="segmented-control w-fit animate-fade-up" style={{ animationDelay: "150ms" }}>
        {(["weekly", "monthly", "yearly"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`font-display ${view === v ? "active text-foreground" : "text-muted-foreground"}`}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis dataKey={dataKey} axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--glass-bg-heavy)", backdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", borderRadius: 12, fontFamily: "Geist Mono", fontSize: 11 }} />
              <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground text-[13px] py-16">Deliver loads to see earnings charts</div>
        )}
      </div>

      {hasRealData && (
        <div className="glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <h3 className="font-display text-base mb-4">Breakdown</h3>
          <div className="space-y-3">
            {breakdown.map(b => (
              <div key={b.label} className="flex justify-between items-center py-2 border-b border-[var(--table-border)] last:border-0">
                <span className="text-[13px]">{b.label}</span>
                <span className={`font-mono font-bold text-[13px] ${b.color}`}>{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
