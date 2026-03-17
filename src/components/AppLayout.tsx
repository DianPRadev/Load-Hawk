import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { Menu } from "lucide-react";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden p-2 bg-card border border-border rounded-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu size={18} />
      </button>

      {/* Sidebar */}
      <div className={`hidden md:block`}>
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-background/80" />
          <div onClick={(e) => e.stopPropagation()}>
            <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <TopBar sidebarCollapsed={collapsed} />

      <main
        className="transition-all duration-200 p-6"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <Outlet />
      </main>
    </div>
  );
}
