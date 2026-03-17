import {
  LayoutDashboard, Search, Package, Bot, DollarSign, Star, Users, Settings, LogOut, LogIn, Crown, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LoadHawkLogo } from "./LoadHawkLogo";
import { useAuth } from "@/store/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Find Loads", path: "/find-loads", icon: Search },
  { title: "My Loads", path: "/my-loads", icon: Package, requiresAuth: true },
  { title: "AI Negotiator", path: "/ai-negotiator", icon: Bot, pro: true, requiresAuth: true },
  { title: "Earnings", path: "/earnings", icon: DollarSign, requiresAuth: true },
  { title: "Broker Ratings", path: "/broker-ratings", icon: Star },
  { title: "Fleet", path: "/fleet", icon: Users, requiresAuth: true },
  { title: "Settings", path: "/settings", icon: Settings, requiresAuth: true },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: dbProfile } = useProfile();

  const isLoggedIn = !!user;
  const userName = dbProfile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";
  const userRole = dbProfile?.role || "";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen glass-sidebar flex flex-col z-40 transition-all duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
    >
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 flex items-center">
        {!collapsed ? (
          <div className="cursor-pointer" onClick={() => navigate("/dashboard")}><LoadHawkLogo size="md" /></div>
        ) : (
          <div className="cursor-pointer mx-auto" onClick={() => navigate("/dashboard")}>
            <img src="/loadhawk-logo.png" alt="LoadHawk" className="w-9 h-9 rounded-lg object-contain" />
          </div>
        )}
      </div>

      <div className="macos-separator mx-3" />

      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          // Show auth-required items as dimmed when not logged in
          const locked = item.requiresAuth && !isLoggedIn;
          return (
            <NavLink
              key={item.path}
              to={locked ? "/login" : item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 relative group",
                active && !locked
                  ? "bg-[var(--glass-active)] text-foreground shadow-[var(--glass-active-shadow)]"
                  : locked
                  ? "text-muted-foreground/40 hover:text-muted-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-hover)]"
              )}
            >
              <item.icon
                size={17}
                className={cn(
                  "shrink-0 transition-colors",
                  active && !locked ? "text-primary" : locked ? "text-muted-foreground/40" : "text-muted-foreground group-hover:text-foreground"
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

      {/* User section */}
      <div className="p-3">
        {isLoggedIn ? (
          <>
            {!collapsed && (
              <div className="mb-3 px-2">
                <div className="text-[13px] font-medium">{userName}</div>
                {userRole && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Crown size={10} className="text-primary" /> {userRole}
                  </div>
                )}
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
          </>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-primary hover:text-primary-highlight text-[13px] px-2 py-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-all"
            >
              <LogIn size={15} />
              {!collapsed && "Sign In"}
            </button>
            <button
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-all"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
