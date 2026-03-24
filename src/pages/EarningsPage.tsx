import { useState } from "react";
import { Download, DollarSign, Info } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useEarningsSummary, useEarningsChart } from "@/hooks/useEarnings";
import { useBookedLoads } from "@/hooks/useLoads";
import { toast } from "sonner";
import { PageMeta } from "@/components/PageMeta";

export default function EarningsPage() {
  const [view, setView] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const { data: earnings } = useEarningsSummary();
  const { data: chartData = [] } = useEarningsChart(view);
  const { data: bookedLoads = [] } = useBookedLoads();

  const grossEarnings = earnings?.totalEarnings ?? 0;
  const totalMiles = earnings?.totalMiles ?? 0;
  const deliveredCount = earnings?.deliveredCount ?? 0;
  const hasRealData = deliveredCount > 0;

  // Cost estimates — national averages (diesel ~$3.89/gal at 6.5 MPG = ~$0.60/mi; tolls avg ~3.3% of gross)
  const FUEL_COST_PER_MILE = 0.60;
  const TOLLS_FEE_RATE = 0.033;
  const fuelCosts = Math.round(totalMiles * FUEL_COST_PER_MILE);
  const tollsFees = Math.round(grossEarnings * TOLLS_FEE_RATE);
  const netProfit = grossEarnings - fuelCosts - tollsFees;

  const breakdown = [
    { label: "Gross Earnings", value: `$${grossEarnings.toLocaleString()}`, color: "text-primary" },
    { label: "Fuel Costs (est.)", value: `-$${fuelCosts.toLocaleString()}`, color: "text-destructive" },
    { label: "Tolls & Fees (est.)", value: `-$${tollsFees.toLocaleString()}`, color: "text-destructive" },
    { label: "Net Profit (est.)", value: `$${netProfit.toLocaleString()}`, color: "text-success" },
  ];

  const handleExport = () => {
    if (bookedLoads.length === 0) return;
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv = ["Route,Rate,Rate/Mile,Miles,Equipment,Broker,Status,Booked Date"];
    bookedLoads.forEach(l => {
      csv.push(`${esc(l.origin + " → " + l.destination)},${l.rate},${l.ratePerMile.toFixed(2)},${l.miles},${esc(l.equipment)},${esc(l.broker)},${l.status},${new Date(l.bookedAt).toLocaleDateString()}`);
    });
    csv.push("");
    csv.push("Summary");
    csv.push(`Gross Earnings,$${grossEarnings.toLocaleString()}`);
    csv.push(`Fuel Costs (est.),-$${fuelCosts.toLocaleString()}`);
    csv.push(`Tolls & Fees (est.),-$${tollsFees.toLocaleString()}`);
    csv.push(`Net Profit,$${netProfit.toLocaleString()}`);
    csv.push(`Total Miles,${totalMiles.toLocaleString()}`);
    csv.push(`Delivered Loads,${deliveredCount}`);
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loadhawk-earnings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported with full breakdown!");
  };

  const dataKey = view === "weekly" ? "day" : view === "monthly" ? "week" : "month";

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageMeta title="Earnings" />
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

      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-8 text-center animate-fade-up" style={{ animationDelay: "100ms" }}>
        {hasRealData ? (
          <>
            <p className="text-muted-foreground text-[12px] mb-2">Total Earnings</p>
            <h2 className="font-display text-6xl gradient-gold-text">${grossEarnings.toLocaleString()}</h2>
          </>
        ) : (
          <>
            <DollarSign size={36} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-display text-xl text-muted-foreground mb-1">No earnings yet</p>
            <p className="text-muted-foreground text-[13px]">Book loads and mark them delivered to start tracking earnings</p>
          </>
        )}
      </div>

      <div className="segmented-control w-fit animate-fade-up" style={{ animationDelay: "150ms" }}>
        {(["weekly", "monthly", "yearly"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`font-display ${view === v ? "active text-foreground" : "text-muted-foreground"}`}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={dataKey} axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontFamily: "Geist Mono", fontSize: 11 }} />
              <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground text-[13px] py-16">Deliver loads to see earnings charts</div>
        )}
      </div>

      {hasRealData && (
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <h3 className="font-display text-base mb-4">Breakdown</h3>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground bg-gray-50 dark:bg-[#0c0c0c] rounded-lg px-3 py-2 mb-3">
            <Info size={14} className="shrink-0" />
            <span>Costs are estimated using national averages. Customize your cost profile in Settings for accurate numbers.</span>
          </div>
          <div className="space-y-3">
            {breakdown.map(b => (
              <div key={b.label} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#1f1f1f] last:border-0">
                <span className="text-[13px]">{b.label}</span>
                <span className={`font-mono font-bold text-[13px] ${b.color}`}>{b.value}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-gray-200 dark:border-[#1f1f1f]">
            Fuel and toll estimates use national averages (~$0.60/mi fuel, ~3.3% tolls). Actual costs may vary based on your equipment, route, and fuel prices.
          </p>
        </div>
      )}
    </div>
  );
}
