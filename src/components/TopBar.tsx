import { Search, Bell, ChevronDown, Sun, Moon, LogIn } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useAuthModal } from "@/store/AuthModalContext";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications, useUnreadCount, useMarkNotificationRead, useClearNotifications } from "@/hooks/useNotifications";
import { useEarningsSummary } from "@/hooks/useEarnings";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

export function TopBar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const { user, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { data: dbProfile } = useProfile();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const clearAll = useClearNotifications();
  const { data: earnings } = useEarningsSummary();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isLoggedIn = !!user;
  const userName = dbProfile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";
  const userInitials = userName ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "";
  const todaysEarnings = earnings?.todayEarnings ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-loads?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className={`sticky top-0 z-30 h-12 glass-toolbar flex items-center pl-14 pr-5 md:px-5 gap-4 transition-all duration-300 ease-out ${sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[248px]"}`}>
      <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto hidden sm:block">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search loads..." aria-label="Search loads" className="w-full glass-input rounded-lg pl-9 pr-4 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
        </div>
      </form>

      <div className="flex items-center gap-2">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-all flex items-center gap-1.5" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span className="text-[10px] font-mono hidden lg:inline">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>

        {isLoggedIn ? (
          <>
            {/* Earnings pill */}
            {todaysEarnings > 0 && (
              <div className="font-mono text-[12px] bg-success/10 text-success px-3 py-1 rounded-full hidden sm:flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                ${todaysEarnings.toLocaleString()}
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-all" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}>
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-gold flex items-center justify-center text-[9px] text-primary-foreground font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-xl overflow-hidden z-50">
                    <div className="p-3 flex items-center justify-between">
                      <span className="font-display text-sm tracking-tight">Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={() => clearAll.mutate()} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Mark all read</button>
                      )}
                    </div>
                    <div className="macos-separator" />
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-[13px] text-muted-foreground">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <button key={n.id} onClick={() => markRead.mutate(n.id)} className={`w-full text-left px-3 py-2.5 hover:bg-[var(--glass-hover)] transition-colors ${!n.read ? "bg-primary/[0.04]" : ""}`}>
                            <div className="text-[13px]">{n.text}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{n.time}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User avatar + dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 hover:bg-[var(--glass-hover)] rounded-lg px-1.5 py-1 transition-all" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="w-7 h-7 rounded-full gradient-gold flex items-center justify-center font-display text-primary-foreground text-[11px]">{userInitials}</div>
                <ChevronDown size={12} className={`text-muted-foreground hidden sm:block transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl overflow-hidden z-50">
                    <div className="px-3 py-3">
                      <div className="font-medium text-[13px]">{userName}</div>
                      <div className="text-[11px] text-muted-foreground">{user?.email}</div>
                    </div>
                    <div className="macos-separator" />
                    <button onClick={() => { setShowUserMenu(false); navigate("/settings"); }} className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--glass-hover)] transition-colors">Settings</button>
                    <button onClick={() => { setShowUserMenu(false); navigate("/earnings"); }} className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--glass-hover)] transition-colors">Earnings</button>
                    <div className="macos-separator" />
                    <button onClick={async () => { setShowUserMenu(false); await signOut(); navigate("/dashboard", { replace: true }); }} className="w-full text-left px-3 py-2 text-[13px] text-destructive hover:bg-[var(--glass-hover)] transition-colors">Log Out</button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <button onClick={() => openAuthModal("login")} className="flex items-center gap-2 gradient-gold text-primary-foreground font-display text-[12px] tracking-normal px-4 py-1.5 rounded-full hover:brightness-110 transition-all">
            <LogIn size={14} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
