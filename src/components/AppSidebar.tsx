import {
  LayoutDashboard, Search, Package, Bot, DollarSign, Star, Users, Settings, LogOut, LogIn, Crown, PanelLeftClose, PanelLeft, Lock,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { useAuthModal } from "@/store/AuthModalContext";
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
  const { openAuthModal } = useAuthModal();
  const { data: dbProfile } = useProfile();

  const isLoggedIn = !!user;
  const userName = dbProfile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";
  const userRole = dbProfile?.role || "";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-muted border-r border-border flex flex-col z-40 transition-all duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center justify-center cursor-pointer",
          collapsed ? "px-1 py-2" : "px-2 pt-2 pb-1"
        )}
        onClick={() => navigate("/dashboard")}
      >
        <img
          src="/loadhawk-logo.png"
          alt="LoadHawk"
          className={cn(
            "object-contain",
            collapsed ? "h-10 w-10" : "w-[85%] max-h-[90px]"
          )}
          style={collapsed ? undefined : { margin: "-12px 0" }}
        />
      </div>

      <div className="border-t border-border mx-3" />

      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const locked = item.requiresAuth && !isLoggedIn;
          return (
            <NavLink
              key={item.path}
              to={locked ? "#" : item.path}
              title={locked ? "Sign in to access" : collapsed ? item.title : undefined}
              onClick={locked ? (e) => { e.preventDefault(); openAuthModal("login"); } : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all duration-150 relative group",
                collapsed && "justify-center px-0",
                active && !locked
                  ? "text-foreground"
                  : locked
                  ? "text-muted-foreground/40 hover:text-muted-foreground/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              )}
            >
              {/* Active left border accent */}
              {active && !locked && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-sm bg-primary" />
              )}
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
                  {locked && <Lock size={12} className="ml-auto text-muted-foreground/40" />}
                  {item.pro && !locked && (
                    <span className="ml-auto text-[9px] font-mono tracking-tight bg-primary/10 text-primary px-1.5 py-0.5 rounded-full" title="Included with LoadHawk Pro ($49/mo)">
                      PRO
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border mx-3" />

      {/* User section */}
      <div className="p-3">
        {isLoggedIn ? (
          <>
            {!collapsed && (
              <div className="mb-2 px-2">
                <div className="text-[13px] font-medium truncate">{userName}</div>
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
                className="flex items-center gap-2 text-muted-foreground hover:text-destructive text-[13px] px-2 py-1.5 rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
              >
                <LogOut size={15} />
                {!collapsed && "Logout"}
              </button>
              <button
                onClick={onToggle}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-2 text-primary hover:text-primary/80 text-[13px] px-2 py-1.5 rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
            >
              <LogIn size={15} />
              {!collapsed && "Sign In"}
            </button>
            <button
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
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
