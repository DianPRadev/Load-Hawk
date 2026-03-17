import {
  LayoutDashboard, Search, Package, Bot, DollarSign, Star, Users, Settings, LogOut, Crown, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LoadHawkLogo } from "./LoadHawkLogo";
import { useAuth } from "@/store/AuthContext";
import { useProfile } from "@/hooks/useProfile";

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
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: dbProfile } = useProfile();
  const profile = {
    name: dbProfile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User",
    role: dbProfile?.role || "Owner-Operator",
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen glass-sidebar flex flex-col z-40 transition-all duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
    >
      {/* Traffic lights + Logo */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="traffic-lights traffic-lights-muted shrink-0">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        {!collapsed && <div className="cursor-pointer" onClick={() => navigate("/dashboard")}><LoadHawkLogo size="sm" /></div>}
      </div>

      <div className="macos-separator mx-3" />

      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 relative group",
                active
                  ? "bg-[var(--glass-active)] text-foreground shadow-[var(--glass-active-shadow)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-hover)]"
              )}
            >
              <item.icon
                size={17}
                className={cn(
                  "shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <>
                  <span className="font-medium">{item.title}</span>
                  {item.pro && (
                    <span className="ml-auto text-[9px] font-mono tracking-tight bg-premium/15 text-premium px-1.5 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="macos-separator mx-3" />

      {/* User + collapse */}
      <div className="p-3">
        {!collapsed && (
          <div className="mb-3 px-2">
            <div className="text-[13px] font-medium">{profile.name}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Crown size={10} className="text-primary" /> {profile.role}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={async () => { await signOut(); navigate("/login", { replace: true }); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive text-[13px] px-2 py-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-all"
          >
            <LogOut size={15} />
            {!collapsed && "Logout"}
          </button>
          <button
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-all"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
