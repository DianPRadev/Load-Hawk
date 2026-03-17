import { DollarSign, Package, MapPin, TrendingUp, Clock, Star, Activity } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { LoadCard } from "@/components/LoadCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useMemo } from "react";

export default function DashboardPage() {
  const {
    availableLoads, bookedLoads, brokers, notifications,
    todaysEarnings, activeLoadCount, totalMilesThisWeek, avgRatePerMile,
  } = useApp();
  const { user } = useAuth();
  const { data: dbProfile } = useProfile();

  const userName = dbProfile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";
  const firstName = userName ? userName.split(" ")[0] : "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const earningsData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const data = days.map(day => ({ day, earnings: 0 }));
    bookedLoads.filter(l => l.status === "Delivered").forEach(l => {
      const dayIndex = new Date(l.bookedAt).getDay();
      data[dayIndex].earnings += l.rate;
    });
    if (data.every(d => d.earnings === 0)) {
      return [
        { day: "Mon", earnings: 420 }, { day: "Tue", earnings: 680 },
        { day: "Wed", earnings: 590 }, { day: "Thu", earnings: 810 },
        { day: "Fri", earnings: 1100 }, { day: "Sat", earnings: 450 },
        { day: "Sun", earnings: 200 },
      ];
    }
    return data;
  }, [bookedLoads]);

  const weeklyTotal = earningsData.reduce((s, d) => s + d.earnings, 0);

  const topBrokers = useMemo(() =>
    [...brokers].sort((a, b) => b.rating - a.rating).slice(0, 5),
    [brokers]
  );

  const hotLoads = availableLoads.slice(0, 5);

  const recentActivity = useMemo(() => {
    if (notifications.length > 0) {
      return notifications.slice(0, 4).map(n => ({
        text: n.text,
        time: n.time,
        icon: n.type === "load" ? Package :
          n.type === "payment" ? DollarSign :
          n.type === "negotiation" ? TrendingUp : Star,
      }));
    }
    return [
      { text: "Welcome to LoadHawk!", time: "Just now", icon: Activity },
      { text: "Browse loads in Find Loads", time: "Tip", icon: Package },
      { text: "Book a load to get started", time: "Tip", icon: DollarSign },
    ];
  }, [notifications]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl tracking-tight">
          {greeting}{firstName ? <>, <span className="gradient-gold-text">{firstName}</span></> : ""}
        </h1>
        <p className="text-muted-foreground text-[13px] mt-1">{today}{dbProfile?.homeBase ? ` · ${dbProfile.homeBase}` : ""}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Earnings" value={`$${todaysEarnings.toLocaleString()}`} change={todaysEarnings > 0 ? "+today" : "—"} positive={todaysEarnings > 0} icon={<DollarSign size={16} />} delay={100} />
        <StatCard label="Active Loads" value={String(activeLoadCount)} change={activeLoadCount > 0 ? `${activeLoadCount} active` : "—"} positive={activeLoadCount > 0} icon={<Package size={16} />} delay={200} />
        <StatCard label="Miles This Week" value={totalMilesThisWeek.toLocaleString()} icon={<MapPin size={16} />} delay={300} />
        <StatCard label="Avg Rate/Mile" value={avgRatePerMile > 0 ? `$${avgRatePerMile.toFixed(2)}` : "—"} icon={<TrendingUp size={16} />} delay={400} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot loads */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-2xl tracking-tight flex items-center gap-2">
            <span className="text-primary" role="img" aria-label="fire">🔥</span> Hot Loads Near You
          </h2>
          <div className="space-y-3">
            {hotLoads.map((load, i) => (
              <LoadCard key={load.id} {...load} delay={500 + i * 100} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Earnings chart */}
          <div className="glass-panel rounded-2xl p-5 window-chrome animate-fade-up" style={{ animationDelay: "600ms" }}>
            <h3 className="font-display text-base tracking-tight mb-4">Weekly Earnings</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={earningsData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "var(--glass-bg-heavy)", backdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", borderRadius: 12, fontFamily: "JetBrains Mono", fontSize: 11 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  cursor={{ fill: "hsla(var(--primary), 0.04)" }}
                />
                <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-[11px] mt-2">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono text-primary">${weeklyTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Top Brokers */}
          <div className="glass-panel rounded-2xl p-5 window-chrome animate-fade-up" style={{ animationDelay: "700ms" }}>
            <h3 className="font-display text-base tracking-tight mb-4">Top Brokers</h3>
            <div className="space-y-3">
              {topBrokers.map((b) => (
                <div key={b.mc} className="flex items-center justify-between">
                  <span className="text-[13px]">{b.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[11px] ${b.rating >= 3.5 ? "text-success" : "text-destructive"}`}>
                      ★ {b.rating}
                    </span>
                    <span className="text-[11px] text-muted-foreground">({b.reviews})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel rounded-2xl p-5 window-chrome animate-fade-up" style={{ animationDelay: "800ms" }}>
            <h3 className="font-display text-base tracking-tight mb-4">Recent Activity</h3>
            <div className="space-y-3.5">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-1.5 bg-[var(--glass-hover)] rounded-lg">
                    <a.icon size={13} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-[13px]">{a.text}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock size={9} />{a.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
