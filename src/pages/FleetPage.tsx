import { MapPin, Truck, User, DollarSign, Package, Plus, X } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { GoldButton } from "@/components/GoldButton";
import { useDrivers, useAddDriver, useUpdateDriverStatus, useRemoveDriver } from "@/hooks/useFleet";
import type { Driver } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  "On Load": "bg-primary/15 text-primary",
  "Available": "bg-success/15 text-success",
  "Off Duty": "bg-[var(--glass-hover)] text-muted-foreground",
};

export default function FleetPage() {
  const { data: drivers = [], isLoading } = useDrivers();
  const addDriver = useAddDriver();
  const updateStatus = useUpdateDriverStatus();
  const removeDriver = useRemoveDriver();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingDriver, setEditingDriver] = useState<string | null>(null);

  const totalRevenue = drivers.reduce((s, d) => s + d.earnings, 0);
  const activeDrivers = drivers.filter(d => d.status !== "Off Duty").length;
  const onLoadCount = drivers.filter(d => d.status === "On Load").length;
  const topPerformer = [...drivers].sort((a, b) => b.earnings - a.earnings)[0];

  const handleAddDriver = () => {
    if (!newName.trim()) return;
    addDriver.mutate(
      { name: newName.trim(), status: "Available", route: "—", earnings: 0 },
      {
        onSuccess: () => {
          toast.success(`${newName.trim()} added to fleet`);
          setNewName("");
          setShowAddForm(false);
        },
      }
    );
  };

  const handleStatusChange = (id: string, status: Driver["status"]) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => { toast.success("Driver status updated"); setEditingDriver(null); },
    });
  };

  const handleRemoveDriver = (id: string, name: string) => {
    removeDriver.mutate(id, {
      onSuccess: () => toast.success(`${name} removed from fleet`),
    });
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="font-display text-3xl tracking-tight">Fleet Management</h1>
        <GoldButton size="sm" onClick={() => setShowAddForm(true)}>
          <Plus size={13} /> Add Driver
        </GoldButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Fleet Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign size={16} />} delay={100} />
        <StatCard label="Active Drivers" value={String(activeDrivers)} change={`${drivers.length} total`} positive icon={<User size={16} />} delay={200} />
        <StatCard label="On Load" value={String(onLoadCount)} icon={<Package size={16} />} delay={300} />
        <StatCard label="Top Performer" value={topPerformer?.name.split(" ").map(n => n[0]).join("") + "." || "—"} icon={<Truck size={16} />} delay={400} />
      </div>

      <div className="glass-panel rounded-2xl h-44 flex items-center justify-center relative overflow-hidden animate-fade-up" style={{ animationDelay: "500ms" }}>
        <MapPin size={18} className="text-muted-foreground mr-2" />
        <span className="font-display text-lg text-muted-foreground tracking-tight">Live Fleet Map</span>
        {drivers.filter(d => d.status === "On Load").map((_, i) => (
          <div key={i} className="absolute w-3 h-3 rounded-full gradient-gold animate-pulse shadow-[0_0_8px_hsla(38,91%,54%,0.4)]" style={{ left: `${20 + i * 15}%`, top: `${30 + Math.sin(i) * 20}%`, animationDelay: `${i * 300}ms` }} />
        ))}
      </div>

      {showAddForm && (
        <div className="glass-panel rounded-2xl p-4 animate-fade-up flex items-center gap-3 border-primary/20">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Driver full name" aria-label="New driver name" className="flex-1 glass-input rounded-lg px-4 py-2 text-[13px] focus:outline-none" onKeyDown={e => e.key === "Enter" && handleAddDriver()} autoFocus />
          <GoldButton size="sm" onClick={handleAddDriver} disabled={!newName.trim()} loading={addDriver.isPending}>Add</GoldButton>
          <GoldButton size="sm" variant="ghost" onClick={() => setShowAddForm(false)}><X size={14} /></GoldButton>
        </div>
      )}

      {drivers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-muted-foreground text-[13px]">No drivers yet. Add your first driver above.</div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: "600ms" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--table-border)]">
                {["Driver", "Status", "Current Route", "Monthly Earnings", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-display text-primary/80 tracking-tight text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3">
                    {editingDriver === d.id ? (
                      <select value={d.status} onChange={e => handleStatusChange(d.id, e.target.value as Driver["status"])} className="glass-input rounded-lg px-2 py-1 text-[12px] focus:outline-none" autoFocus onBlur={() => setEditingDriver(null)}>
                        <option value="Available">Available</option>
                        <option value="On Load">On Load</option>
                        <option value="Off Duty">Off Duty</option>
                      </select>
                    ) : (
                      <button onClick={() => setEditingDriver(d.id)} className={`pill-badge text-[11px] cursor-pointer hover:opacity-80 ${statusColors[d.status]}`}>{d.status}</button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.route}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-primary">${d.earnings.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <GoldButton size="sm" variant="ghost" onClick={() => handleRemoveDriver(d.id, d.name)}><X size={13} /></GoldButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
