import { MapPin, Truck, User, DollarSign, Package } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const drivers = [
  { name: "James Wilson", status: "On Load", route: "Dallas → Atlanta", earnings: 8240 },
  { name: "Carlos Ramirez", status: "Available", route: "—", earnings: 6780 },
  { name: "Mike Thompson", status: "On Load", route: "Chicago → Nashville", earnings: 9120 },
  { name: "David Chen", status: "Off Duty", route: "—", earnings: 5430 },
  { name: "Robert Brown", status: "Available", route: "—", earnings: 7650 },
];

const statusColors: Record<string, string> = {
  "On Load": "bg-primary/10 text-primary",
  "Available": "bg-success/10 text-success",
  "Off Duty": "bg-muted-foreground/10 text-muted-foreground",
};

export default function FleetPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="font-display text-3xl tracking-wide animate-fade-up">FLEET MANAGEMENT</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Fleet Revenue" value="$37,220" change="+14%" positive icon={<DollarSign size={18} />} delay={100} />
        <StatCard label="Active Drivers" value="5" icon={<User size={18} />} delay={200} />
        <StatCard label="Loads Completed" value="23" change="+3" positive icon={<Package size={18} />} delay={300} />
        <StatCard label="Top Performer" value="Mike T." icon={<Truck size={18} />} delay={400} />
      </div>

      {/* Map placeholder */}
      <div className="bg-card border border-border rounded-lg h-48 flex items-center justify-center relative overflow-hidden animate-fade-up" style={{animationDelay:"500ms"}}>
        <MapPin size={20} className="text-muted-foreground mr-2" />
        <span className="font-display text-xl text-muted-foreground tracking-wide">LIVE FLEET MAP</span>
        {drivers.map((_, i) => (
          <div key={i} className="absolute w-3 h-3 rounded-full gradient-gold animate-pulse" style={{left:`${20+i*15}%`, top:`${30+Math.sin(i)*20}%`, animationDelay:`${i*300}ms`}} />
        ))}
      </div>

      {/* Driver list */}
      <div className="bg-card border border-border rounded-lg overflow-hidden animate-fade-up" style={{animationDelay:"600ms"}}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Driver", "Status", "Current Route", "Monthly Earnings"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-display text-primary tracking-wide text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, i) => (
              <tr key={d.name} className={`border-b border-border ${i % 2 === 0 ? "bg-card" : "bg-background-secondary"}`}>
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${statusColors[d.status]}`}>{d.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{d.route}</td>
                <td className="px-4 py-3 font-mono text-primary">${d.earnings.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
