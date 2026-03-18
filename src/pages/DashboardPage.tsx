import { DollarSign, Package, MapPin, TrendingUp, Clock, Star, Activity, Zap, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { LoadCard } from "@/components/LoadCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/store/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAvailableLoads, useBookedLoads } from "@/hooks/useLoads";
import { useBrokers } from "@/hooks/useBrokers";
import { useNotifications } from "@/hooks/useNotifications";
import { useEarningsSummary } from "@/hooks/useEarnings";
import { useMemo } from "react";
import { PageMeta } from "@/components/PageMeta";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dbProfile, isLoading: profileLoading } = useProfile();
  const { data: availableLoads = [], isLoading: loadsLoading } = useAvailableLoads();
  const { data: bookedLoads = [] } = useBookedLoads();
  const { data: brokers = [] } = useBrokers();
  const { data: notifications = [] } = useNotifications();
  const { data: earnings, isLoading: earningsLoading } = useEarningsSummary();

  const isInitialLoad = profileLoading && loadsLoading && earningsLoading;

  const isLoggedIn = !!user;
  const userName = dbProfile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";
  const firstName = userName ? userName.split(" ")[0] : "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const todaysEarnings = earnings?.todayEarnings ?? 0;
  const activeLoadCount = earnings?.activeCount ?? 0;
  const totalMilesThisWeek = earnings?.totalMiles ?? 0;
  const avgRatePerMile = earnings?.avgRatePerMile ?? 0;

  const earningsData = useMemo(() => {
    const delivered = bookedLoads.filter(l => l.status === "Delivered");
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const data = days.map(day => ({ day, earnings: 0 }));
    delivered.forEach(l => {
      const dayIndex = new Date(l.bookedAt).getDay();
      data[dayIndex].earnings += l.rate;
    });
    if (data.every(d => d.earnings === 0)) return [];
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
    if (!isLoggedIn) {
      return [
        { text: `${availableLoads.length} loads available now`, time: "Live", icon: Package },
        { text: `${brokers.length} brokers rated & reviewed`, time: "Live", icon: Star },
        { text: "Sign up to book loads and track earnings", time: "Free", icon: Activity },
      ];
    }
    return [
      { text: "Welcome to LoadHawk!", time: "Just now", icon: Activity },
      { text: "Browse loads in Find Loads", time: "Tip", icon: Package },
      { text: "Book a load to get started", time: "Tip", icon: DollarSign },
    ];
  }, [notifications, isLoggedIn, availableLoads.length, brokers.length]);

  if (isInitialLoad) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-[var(--glass-hover)] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 h-24 animate-pulse">
              <div className="h-3 w-20 bg-[var(--glass-hover)] rounded mb-3" />
              <div className="h-8 w-24 bg-[var(--glass-hover)] rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 h-28 animate-pulse">
                <div className="h-4 w-48 bg-[var(--glass-hover)] rounded mb-3" />
                <div className="h-3 w-32 bg-[var(--glass-hover)] rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageMeta title="Dashboard" />
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl sm:text-4xl tracking-tight">
          {isLoggedIn
            ? <>{greeting}{firstName ? <>, <span className="gradient-gold-text">{firstName}</span></> : ""}</>
            : <>Find Your Next <span className="gradient-gold-text">Load</span></>
          }
        </h1>
        {!isLoggedIn && (
          <p className="text-muted-foreground text-[13px] mt-1">
            Browse available freight, check broker ratings, and book loads faster
          </p>
        )}
        {isLoggedIn && dbProfile?.homeBase && (
          <p className="text-muted-foreground text-[13px] mt-1">{dbProfile.homeBase}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoggedIn ? (
          <>
            <StatCard label="Today's Earnings" value={`$${todaysEarnings.toLocaleString()}`} change={todaysEarnings > 0 ? "+today" : undefined} positive={todaysEarnings > 0} icon={<DollarSign size={16} />} delay={100} />
            <StatCard label="Active Loads" value={String(activeLoadCount)} change={activeLoadCount > 0 ? `${activeLoadCount} active` : undefined} positive={activeLoadCount > 0} icon={<Package size={16} />} delay={200} />
            <StatCard label="Miles This Week" value={totalMilesThisWeek.toLocaleString()} icon={<MapPin size={16} />} delay={300} />
            <StatCard label="Avg Rate/Mile" value={avgRatePerMile > 0 ? `$${avgRatePerMile.toFixed(2)}` : "\u2014"} icon={<TrendingUp size={16} />} delay={400} />
          </>
        ) : (
          <>
            <StatCard label="Available Loads" value={String(availableLoads.length)} change={`${availableLoads.length} posted`} positive={availableLoads.length > 0} icon={<Package size={16} />} delay={100} />
            <StatCard label="Rated Brokers" value={String(brokers.length)} change="rated & reviewed" positive icon={<Star size={16} />} delay={200} />
            <StatCard label="Avg Rate/Mile" value={availableLoads.length > 0 ? `$${(availableLoads.reduce((s, l) => s + l.ratePerMile, 0) / availableLoads.length).toFixed(2)}` : "\u2014"} icon={<TrendingUp size={16} />} delay={300} />
            <StatCard label="Top Lane" value={availableLoads.length > 0 ? `${availableLoads[0].origin.split(",")[0]}` : "\u2014"} icon={<MapPin size={16} />} delay={400} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl tracking-tight">Available Loads</h2>
            <span className="text-[11px] font-mono text-muted-foreground bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-full px-2.5 py-0.5">
              {hotLoads.length}
            </span>
          </div>
          {hotLoads.length === 0 ? (
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-8 text-center text-muted-foreground text-[13px]">No loads available right now.</div>
          ) : (
            <div className="space-y-3">
              {hotLoads.map((load, i) => (
                <LoadCard key={load.id} {...load} delay={500 + i * 100} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 animate-fade-up" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={14} className="text-[#f5a820]" />
              <h3 className="font-display text-base tracking-tight">{isLoggedIn ? "Weekly Earnings" : "Why LoadHawk?"}</h3>
            </div>
            {!isLoggedIn ? (
              <div className="space-y-3 text-[13px]">
                <div className="flex items-start gap-3"><DollarSign size={14} className="text-[#f5a820] shrink-0 mt-0.5" /><span className="text-muted-foreground">See true profit per load -- not just rate</span></div>
                <div className="flex items-start gap-3"><Star size={14} className="text-[#f5a820] shrink-0 mt-0.5" /><span className="text-muted-foreground">Community broker ratings and reviews</span></div>
                <div className="flex items-start gap-3"><Zap size={14} className="text-[#f5a820] shrink-0 mt-0.5" /><span className="text-muted-foreground">AI-powered negotiation assistant</span></div>
                <div className="flex items-start gap-3"><TrendingUp size={14} className="text-[#f5a820] shrink-0 mt-0.5" /><span className="text-muted-foreground">Track earnings, miles, and performance</span></div>
              </div>
            ) : earningsData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={earningsData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: "var(--glass-bg-heavy)", backdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", borderRadius: 12, fontFamily: "Geist Mono", fontSize: 11 }}
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
              </>
            ) : (
              <div className="text-center text-muted-foreground text-[13px] py-8">Deliver loads to see earnings data</div>
            )}
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 animate-fade-up" style={{ animationDelay: "700ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Star size={14} className="text-[#f5a820]" />
              <h3 className="font-display text-base tracking-tight">Top Brokers</h3>
            </div>
            <div className="space-y-3">
              {topBrokers.map((b) => (
                <div key={b.mc} className="flex items-center justify-between">
                  <span className="text-[13px]">{b.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[11px] ${b.rating >= 3.5 ? "text-success" : "text-destructive"}`}>
                      <Star size={10} className="inline-block mb-0.5 mr-0.5" />{b.rating}
                    </span>
                    <span className="text-[11px] text-muted-foreground">({b.reviews})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 animate-fade-up" style={{ animationDelay: "800ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-[#f5a820]" />
              <h3 className="font-display text-base tracking-tight">Recent Activity</h3>
            </div>
            <div className="space-y-3.5">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-1.5 bg-gray-100 dark:bg-[#1f1f1f] rounded-lg">
                    <a.icon size={13} className="text-[#f5a820]" />
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
