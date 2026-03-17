import { DollarSign, Package, MapPin, TrendingUp, Clock, Star, Activity } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { LoadCard } from "@/components/LoadCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const earningsData = [
  { day: "Mon", earnings: 420 },
  { day: "Tue", earnings: 680 },
  { day: "Wed", earnings: 590 },
  { day: "Thu", earnings: 810 },
  { day: "Fri", earnings: 1100 },
  { day: "Sat", earnings: 450 },
  { day: "Sun", earnings: 200 },
];

const hotLoads = [
  { origin: "Dallas, TX", destination: "Atlanta, GA", miles: 781, weight: "42,000 lbs", rate: 2890, ratePerMile: 3.70, broker: "XPO Logistics", equipment: "Dry Van", postedAgo: "12 min ago" },
  { origin: "Chicago, IL", destination: "Nashville, TN", miles: 473, weight: "38,500 lbs", rate: 1950, ratePerMile: 4.12, broker: "CH Robinson", equipment: "Reefer", postedAgo: "25 min ago" },
  { origin: "Houston, TX", destination: "Memphis, TN", miles: 586, weight: "44,000 lbs", rate: 2340, ratePerMile: 3.99, broker: "TQL", equipment: "Flatbed", postedAgo: "38 min ago" },
  { origin: "Phoenix, AZ", destination: "Denver, CO", miles: 602, weight: "35,000 lbs", rate: 2480, ratePerMile: 4.12, broker: "Coyote Logistics", equipment: "Dry Van", postedAgo: "1 hr ago" },
  { origin: "Miami, FL", destination: "Charlotte, NC", miles: 651, weight: "40,000 lbs", rate: 2670, ratePerMile: 4.10, broker: "Echo Global", equipment: "Reefer", postedAgo: "1 hr ago" },
];

const topBrokers = [
  { name: "CH Robinson", rating: 4.8, reviews: 1247, good: true },
  { name: "TQL", rating: 4.5, reviews: 983, good: true },
  { name: "Echo Global", rating: 4.2, reviews: 756, good: true },
  { name: "Landstar", rating: 3.9, reviews: 612, good: true },
  { name: "USA Truck", rating: 2.1, reviews: 89, good: false },
];

const recentActivity = [
  { text: "Load booked: Dallas → Atlanta", time: "2 hrs ago", icon: Package },
  { text: "Payment received: $2,340", time: "5 hrs ago", icon: DollarSign },
  { text: "Negotiation won: +$180", time: "Yesterday", icon: TrendingUp },
  { text: "Broker rated: CH Robinson ★★★★★", time: "Yesterday", icon: Star },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl tracking-wide">
          GOOD MORNING, <span className="gradient-gold-text">MARCUS</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">March 17, 2026 · Dallas, TX · 72°F Sunny</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Earnings" value="$1,247" change="+12.3%" positive icon={<DollarSign size={18} />} delay={100} />
        <StatCard label="Active Loads" value="3" change="+1" positive icon={<Package size={18} />} delay={200} />
        <StatCard label="Miles This Week" value="2,847" change="+8.7%" positive icon={<MapPin size={18} />} delay={300} />
        <StatCard label="Avg Rate/Mile" value="$3.92" change="-2.1%" positive={false} icon={<TrendingUp size={18} />} delay={400} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot loads - 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-2xl tracking-wide flex items-center gap-2">
            <span className="text-primary">🔥</span> HOT LOADS NEAR YOU
          </h2>
          <div className="space-y-3">
            {hotLoads.map((load, i) => (
              <LoadCard key={i} {...load} delay={500 + i * 100} />
            ))}
          </div>
        </div>

        {/* Right column - 1/3 */}
        <div className="space-y-6">
          {/* Earnings chart */}
          <div className="bg-card border border-border rounded-lg p-5 animate-fade-up" style={{ animationDelay: "600ms" }}>
            <h3 className="font-display text-lg tracking-wide mb-4">WEEKLY EARNINGS</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={earningsData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#777", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12 }}
                  labelStyle={{ color: "#f0ece4" }}
                  itemStyle={{ color: "#f5a820" }}
                  cursor={{ fill: "rgba(245,168,32,0.05)" }}
                />
                <Bar dataKey="earnings" fill="#f5a820" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono text-primary">$4,250</span>
            </div>
          </div>

          {/* Top Brokers */}
          <div className="bg-card border border-border rounded-lg p-5 animate-fade-up" style={{ animationDelay: "700ms" }}>
            <h3 className="font-display text-lg tracking-wide mb-4">TOP BROKERS</h3>
            <div className="space-y-3">
              {topBrokers.map((b) => (
                <div key={b.name} className="flex items-center justify-between">
                  <span className="text-sm">{b.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs ${b.good ? "text-success" : "text-destructive"}`}>
                      ★ {b.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">({b.reviews})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-5 animate-fade-up" style={{ animationDelay: "800ms" }}>
            <h3 className="font-display text-lg tracking-wide mb-4">RECENT ACTIVITY</h3>
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-1.5 bg-card-elevated rounded">
                    <a.icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm">{a.text}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />{a.time}
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
