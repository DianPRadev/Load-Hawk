import { useState, useMemo } from "react";
import { DollarSign, Download } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useApp } from "@/store/AppContext";
import { toast } from "sonner";

export default function EarningsPage() {
  const { bookedLoads, totalEarnings } = useApp();
  const [view, setView] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const deliveredLoads = bookedLoads.filter(l => l.status === "Delivered");
  const grossEarnings = deliveredLoads.reduce((s, l) => s + l.rate, 0);
  const totalMiles = deliveredLoads.reduce((s, l) => s + l.miles, 0);

  const fuelCosts = Math.round(totalMiles * 0.60);
  const tollsFees = Math.round(grossEarnings * 0.033);
  const netProfit = grossEarnings - fuelCosts - tollsFees;

  const hasRealData = deliveredLoads.length > 0;

  const weeklyData = useMemo(() => {
    if (!hasRealData) {
      return [
        { day: "Mon", earnings: 420 }, { day: "Tue", earnings: 680 },
        { day: "Wed", earnings: 590 }, { day: "Thu", earnings: 810 },
        { day: "Fri", earnings: 1100 }, { day: "Sat", earnings: 450 },
        { day: "Sun", earnings: 200 },
      ];
    }
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => {
      const dayLoads = deliveredLoads.filter(l => {
        const d = new Date(l.bookedAt).getDay();
        return d === (i + 1) % 7;
      });
      return { day, earnings: dayLoads.reduce((s, l) => s + l.rate, 0) };
    });
  }, [deliveredLoads, hasRealData]);

  const monthlyData = useMemo(() => {
    if (!hasRealData) {
      return [
        { week: "W1", earnings: 2840 }, { week: "W2", earnings: 3120 },
        { week: "W3", earnings: 3560 }, { week: "W4", earnings: 3327 },
      ];
    }
    return [
      { week: "W1", earnings: Math.round(grossEarnings * 0.22) },
      { week: "W2", earnings: Math.round(grossEarnings * 0.24) },
      { week: "W3", earnings: Math.round(grossEarnings * 0.28) },
      { week: "W4", earnings: Math.round(grossEarnings * 0.26) },
    ];
  }, [grossEarnings, hasRealData]);

  const data = view === "weekly" ? weeklyData : monthlyData;
  const displayEarnings = hasRealData ? grossEarnings : 12847;

  const breakdown = [
    { label: "Gross Earnings", value: `$${displayEarnings.toLocaleString()}`, color: "text-primary" },
    { label: "Fuel Costs", value: `-$${(hasRealData ? fuelCosts : 3240).toLocaleString()}`, color: "text-destructive" },
    { label: "Tolls & Fees", value: `-$${(hasRealData ? tollsFees : 420).toLocaleString()}`, color: "text-destructive" },
    { label: "Net Profit", value: `$${(hasRealData ? netProfit : 9187).toLocaleString()}`, color: "text-success" },
  ];

  const handleExport = () => {
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

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Earnings</h1>
          <p className="text-muted-foreground text-[13px]">
            {hasRealData
              ? `Based on ${deliveredLoads.length} delivered load${deliveredLoads.length !== 1 ? "s" : ""}`
              : "Book and deliver loads to see real earnings"
            }
          </p>
        </div>
        <GoldButton size="sm" variant="secondary" onClick={handleExport} disabled={bookedLoads.length === 0}>
          <Download size={13} /> Export CSV
        </GoldButton>
      </div>

      {/* Big number */}
      <div className="glass-panel rounded-2xl p-8 text-center window-chrome animate-fade-up" style={{ animationDelay: "100ms" }}>
        <p className="text-muted-foreground text-[12px] mb-2">{hasRealData ? "Total Earnings" : "Sample Data"}</p>
        <h2 className="font-display text-6xl gradient-gold-text">${displayEarnings.toLocaleString()}</h2>
        {!hasRealData && (
          <p className="text-muted-foreground text-[11px] mt-2">Book loads and mark them delivered to track real earnings</p>
        )}
      </div>

      {/* Segmented control */}
      <div className="segmented-control w-fit animate-fade-up" style={{ animationDelay: "150ms" }}>
        {(["weekly", "monthly", "yearly"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`font-display ${view === v ? "active text-foreground" : "text-muted-foreground"}`}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis dataKey={view === "weekly" ? "day" : "week"} axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--glass-bg-heavy)", backdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", borderRadius: 12, fontFamily: "JetBrains Mono", fontSize: 11 }} />
            <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown */}
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
    </div>
  );
}
