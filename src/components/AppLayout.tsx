import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { Menu, X, LayoutDashboard, Search, Package, Bot } from "lucide-react";

const bottomNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Find Loads", path: "/find-loads", icon: Search },
  { label: "My Loads", path: "/my-loads", icon: Package },
  { label: "AI", path: "/ai-negotiator", icon: Bot },
] as const;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("lh-sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem("lh-sidebar-collapsed", String(next)); } catch { /* localStorage unavailable */ }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center bg-card border border-border rounded-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar - desktop */}
      <div className="hidden md:block">
        <AppSidebar collapsed={collapsed} onToggle={handleToggleCollapse} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <TopBar sidebarCollapsed={collapsed} />

      <main
        className={`transition-all duration-300 ease-out px-4 py-5 md:px-8 md:py-6 max-w-[1600px] pb-20 md:pb-0 ${
          collapsed ? "md:ml-[68px]" : "md:ml-[248px]"
        }`}
      >
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around">
          {bottomNavItems.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center py-2 px-1 flex-1 min-w-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="text-[11px] mt-0.5 truncate">{label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className={`flex flex-col items-center py-2 px-1 flex-1 min-w-0 transition-colors ${
              mobileOpen ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Menu size={20} />
            <span className="text-[11px] mt-0.5">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
