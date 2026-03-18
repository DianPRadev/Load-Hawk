import { Link } from "react-router-dom";
import { useAuthModal } from "@/store/AuthModalContext";
import { useTheme } from "next-themes";
import { PageMeta } from "@/components/PageMeta";
import {
  Search,
  Bot,
  Star,
  DollarSign,
  Truck,
  Bell,
  Sun,
  Moon,
  LogIn,
  Users,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Smart Load Search",
    description:
      "Filter by lane, equipment, rate, and deadhead. Sort by profit, not just price.",
  },
  {
    icon: Bot,
    title: "AI Negotiation",
    description:
      "Get counter-offer strategies, call scripts, and broker intelligence before you call.",
  },
  {
    icon: Star,
    title: "Broker Ratings",
    description:
      "Community reviews, payment history, and trust scores on every broker.",
  },
  {
    icon: DollarSign,
    title: "Earnings Tracking",
    description:
      "See gross, fuel, tolls, and net profit per load. Export to CSV.",
  },
  {
    icon: Truck,
    title: "Fleet Management",
    description:
      "Add drivers, assign loads, track status, and monitor fleet performance.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description:
      "Get notified when loads match your lanes, equipment, and rate preferences.",
  },
];

const ROLES = [
  {
    icon: Truck,
    title: "Driver",
    description:
      "Find loads that actually pay. See real profit after fuel, tolls, and fees. Negotiate better rates with AI.",
  },
  {
    icon: Users,
    title: "Dispatcher",
    description:
      "Search at scale, assign loads, track multiple drivers, and keep operations moving.",
  },
  {
    icon: BarChart3,
    title: "Fleet Manager",
    description:
      "Monitor utilization, margins, compliance, and driver performance in one dashboard.",
  },
];

export default function HomePage() {
  const { openAuthModal } = useAuthModal();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <PageMeta title="AI-Powered Freight Operating System" description="Find loads, negotiate smarter rates, and track real profit. The freight OS for owner-operators, dispatchers, and small fleets." />
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-border/40">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/loadhawk-logo.png"
              alt="LoadHawk"
              className="h-8 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/find-loads"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/broker-ratings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Broker Ratings
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium gradient-gold text-white hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
            The Freight{" "}
            <span className="gradient-gold-text">Operating System</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Find loads, negotiate smarter rates, track real profit, and
            grow your business — all in one platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal("signup")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-base font-semibold gradient-gold text-white hover:opacity-90 transition-opacity"
            >
              Get Started Free
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              to="/find-loads"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-base font-semibold glass-panel border border-border hover:border-primary/40 transition-colors"
            >
              Browse Loads
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required. Free forever for basic access.
          </p>
        </div>
      </section>

      {/* ── Role Paths ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14 animate-fade-up">
            <h2 className="font-display text-3xl sm:text-4xl">
              Built for every role in freight
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map((role, i) => (
              <div
                key={role.title}
                className="glass-panel rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl gradient-gold mb-5">
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-xl mb-3">{role.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14 animate-fade-up">
            <h2 className="font-display text-3xl sm:text-4xl">
              Everything you need to move freight profitably
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-panel rounded-2xl p-7 border border-border/50 hover:border-primary/30 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg gradient-gold mb-4">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <h2 className="font-display text-3xl sm:text-4xl mb-6">
            Ready to earn more per mile?
          </h2>
          <button
            onClick={() => openAuthModal("signup")}
            className="inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg font-semibold gradient-gold text-white hover:opacity-90 transition-opacity"
          >
            Join LoadHawk Free
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img
              src="/loadhawk-logo.png"
              alt="LoadHawk"
              className="h-7 w-auto"
            />
            <span className="text-sm text-muted-foreground">
              The freight operating system
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/find-loads"
              className="hover:text-foreground transition-colors"
            >
              Find Loads
            </Link>
            <Link
              to="/broker-ratings"
              className="hover:text-foreground transition-colors"
            >
              Broker Ratings
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            2026 LoadHawk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
