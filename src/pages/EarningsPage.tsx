import { useState } from "react";
import { DollarSign, Download, Share2 } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const monthlyData = [
  { week: "W1", earnings: 2840 }, { week: "W2", earnings: 3120 },
  { week: "W3", earnings: 3560 }, { week: "W4", earnings: 3327 },
];

const weeklyData = [
  { day: "Mon", earnings: 420 }, { day: "Tue", earnings: 680 },
  { day: "Wed", earnings: 590 }, { day: "Thu", earnings: 810 },
  { day: "Fri", earnings: 1100 }, { day: "Sat", earnings: 450 }, { day: "Sun", earnings: 200 },
];

const breakdown = [
  { label: "Gross Earnings", value: "$12,847", color: "text-primary" },
  { label: "Fuel Costs", value: "-$3,240", color: "text-destructive" },
  { label: "Tolls & Fees", value: "-$420", color: "text-destructive" },
  { label: "Net Profit", value: "$9,187", color: "text-success" },
];

export default function EarningsPage() {
  const [view, setView] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const data = view === "weekly" ? weeklyData : monthlyData;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-display text-3xl tracking-wide">EARNINGS</h1>
          <p className="text-muted-foreground text-sm">Track your revenue and expenses</p>
        </div>
        <div className="flex gap-2">
          <GoldButton size="sm" variant="secondary"><Download size={14} /> EXPORT CSV</GoldButton>
          <GoldButton size="sm" variant="secondary"><Share2 size={14} /> SHARE</GoldButton>
        </div>
      </div>

      {/* Big number */}
      <div className="bg-card border border-border rounded-lg p-8 text-center animate-fade-up" style={{animationDelay:"100ms"}}>
        <p className="text-muted-foreground text-sm mb-2">This Month</p>
        <h2 className="font-display text-6xl gradient-gold-text">$12,847</h2>
        <p className="text-success text-sm font-mono mt-2">+18.3% vs last month</p>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 bg-card rounded-md p-1 border border-border w-fit animate-fade-up" style={{animationDelay:"150ms"}}>
        {(["weekly", "monthly", "yearly"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 text-sm font-display tracking-wider rounded transition-all ${view === v ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}>
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-6 animate-fade-up" style={{animationDelay:"200ms"}}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
            <XAxis dataKey={view === "weekly" ? "day" : "week"} axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12 }} />
            <Line type="monotone" dataKey="earnings" stroke="#f5a820" strokeWidth={2} dot={{ fill: "#f5a820", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6 animate-fade-up" style={{animationDelay:"300ms"}}>
        <h3 className="font-display text-lg mb-4">BREAKDOWN</h3>
        <div className="space-y-3">
          {breakdown.map(b => (
            <div key={b.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-sm">{b.label}</span>
              <span className={`font-mono font-bold ${b.color}`}>{b.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
