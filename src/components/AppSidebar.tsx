import {
  LayoutDashboard, Search, Package, Bot, DollarSign, Star, Users, Settings, LogOut, Crown,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LoadHawkLogo } from "./LoadHawkLogo";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Find Loads", path: "/find-loads", icon: Search },
  { title: "My Loads", path: "/my-loads", icon: Package },
  { title: "AI Negotiator", path: "/ai-negotiator", icon: Bot, pro: true },
  { title: "Earnings", path: "/earnings", icon: DollarSign },
  { title: "Broker Ratings", path: "/broker-ratings", icon: Star },
  { title: "Fleet", path: "/fleet", icon: Users },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-background-secondary border-r border-border flex flex-col z-40 transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && <LoadHawkLogo size="sm" />}
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground p-1">
          <LayoutDashboard size={18} />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm transition-all duration-200 relative group",
                active
                  ? "text-primary bg-primary/10 border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              )}
            >
              <item.icon size={18} className={active ? "text-primary" : ""} />
              {!collapsed && (
                <>
                  <span>{item.title}</span>
                  {item.pro && (
                    <span className="ml-auto text-[10px] font-mono bg-premium/10 text-premium px-1.5 py-0.5 rounded">
                      PRO
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="mb-3">
            <div className="text-sm font-medium">Marcus Johnson</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Crown size={10} className="text-primary" /> Owner-Operator
            </div>
          </div>
        )}
        <button className="flex items-center gap-2 text-muted-foreground hover:text-destructive text-sm w-full">
          <LogOut size={16} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
