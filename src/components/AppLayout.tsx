import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { Menu, X } from "lucide-react";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("lh-sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

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
        className="fixed top-3 left-3 z-50 md:hidden p-2 glass-panel rounded-xl"
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
        className={`transition-all duration-300 ease-out px-4 py-5 md:px-8 md:py-6 ${
          collapsed ? "md:ml-[68px]" : "md:ml-[248px]"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
