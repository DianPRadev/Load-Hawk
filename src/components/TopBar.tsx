import { Search, Bell, ChevronDown } from "lucide-react";
import { LoadHawkLogo } from "./LoadHawkLogo";

export function TopBar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  return (
    <header
      className="sticky top-0 z-30 h-14 bg-background-secondary border-b border-border flex items-center px-4 gap-4"
      style={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
    >
      <div className="hidden md:block">
        <LoadHawkLogo size="sm" />
      </div>

      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search loads: origin → destination"
            className="w-full bg-input border border-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="font-mono text-sm bg-success/10 text-success px-3 py-1 rounded-md">
          $1,247
        </div>
        <button className="relative text-muted-foreground hover:text-foreground">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full gradient-gold" />
        </button>
        <button className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center font-display text-primary-foreground text-sm">
            MJ
          </div>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
