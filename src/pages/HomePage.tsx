import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthModal } from "@/store/AuthModalContext";
import { useAuth } from "@/store/AuthContext";
import { useTheme } from "next-themes";
import { PageMeta } from "@/components/PageMeta";
import {
  Search,
  Bot,
  TrendingUp,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  Truck,
  Users,
  BarChart3,
} from "lucide-react";

const PRODUCT_CARDS = [
  {
    icon: Search,
    title: "Smart Load Intelligence",
    description:
      "Filter by lane, equipment, rate, and deadhead. Sort by estimated profit, not just price. See broker trust scores inline so you never book blind.",
  },
  {
    icon: Bot,
    title: "AI Negotiation Assistant",
    description:
      "Get counter-offer strategies with specific dollar amounts. See call scripts, email templates, and broker intelligence before you pick up the phone.",
  },
  {
    icon: TrendingUp,
    title: "Earnings and Fleet Command",
    description:
      "Track gross revenue, fuel costs, tolls, and net profit per load. Manage your fleet, monitor driver status, and export settlement-ready reports.",
  },
];

const TRUST_POINTS = [
  "Free forever plan",
  "AI-powered negotiation",
  "Community broker ratings",
  "Real profit tracking",
];

const ROLE_PATHS = [
  {
    title: "Driver",
    tagline: "Find loads that actually pay",
    color: "border-[#f5a820]",
    bullets: [
      "See real profit after fuel, tolls, and fees",
      "AI-powered rate negotiation scripts",
      "Broker trust scores on every listing",
    ],
  },
  {
    title: "Dispatcher",
    tagline: "Manage loads at scale",
    color: "border-primary/60",
    bullets: [
      "Search and assign loads across drivers",
      "Track multiple shipments in real time",
      "Streamline communication with brokers",
    ],
  },
  {
    title: "Fleet Manager",
    tagline: "See the full picture",
    color: "border-primary/40",
    bullets: [
      "Monitor utilization and margins per truck",
      "Export settlement-ready financial reports",
      "Track driver compliance and performance",
    ],
  },
];

export default function HomePage() {
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to dashboard after login
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <PageMeta
        title="AI-Powered Freight Operating System"
        description="Find loads, negotiate smarter rates, and track real profit. The freight OS for owner-operators, dispatchers, and small fleets."
      />

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/loadhawk-logo.png"
              alt="LoadHawk"
              className="h-7 w-auto"
            />
            <span className="font-display text-lg font-semibold">
              LoadHawk
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#product"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Product
            </a>
            <Link
              to="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/compare"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Compare
            </Link>
            <Link
              to="/resources"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Resources
            </Link>
          </div>

          <div className="flex items-center gap-2">
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
              className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal("signup")}
              className="hidden md:inline-flex items-center rounded-lg px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg px-4 py-4 space-y-3">
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Product
            </a>
            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Compare
            </Link>
            <Link
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Resources
            </Link>
            <div className="pt-2 border-t border-border/40 flex flex-col gap-2">
              <button
                onClick={() => {
                  openAuthModal("login");
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  openAuthModal("signup");
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-12 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        {/* Radial gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,168,32,0.12)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="font-mono text-xs sm:text-sm tracking-[0.2em] uppercase text-[#f5a820] mb-6">
            The Freight Operating System
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-[1.1] font-bold">
            Find loads. Know your profit.
            <br />
            <span className="gradient-gold-text">Negotiate smarter.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The load board built for owner-operators who care about their bottom
            line. Search, analyze, negotiate, book, and track — all in one
            place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal("signup")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black hover:opacity-90 transition-opacity"
            >
              Start Free
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold border border-border hover:border-[#f5a820]/40 transition-colors"
            >
              See the Dashboard
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            No credit card required
          </p>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
            {TRUST_POINTS.map((point, i) => (
              <div
                key={point}
                className={`flex items-center justify-center gap-2 py-2 font-mono text-xs sm:text-sm text-muted-foreground ${
                  i < TRUST_POINTS.length - 1
                    ? "md:border-r md:border-border/30"
                    : ""
                }`}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f5a820] shrink-0" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Showcase ── */}
      <section
        id="product"
        className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Built for profit, not just search
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Every feature is designed to help you keep more money per mile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRODUCT_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl p-8 hover:border-[#f5a820]/40 transition-colors"
              >
                <card.icon className="h-8 w-8 text-[#f5a820] mb-5" />
                <h3 className="font-display text-xl font-semibold mb-3">
                  {card.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Paths ── */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              One platform. Every role.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLE_PATHS.map((role) => (
              <div
                key={role.title}
                className={`bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl p-8 border-t-4 ${role.color}`}
              >
                <h3 className="font-display text-xl font-semibold mb-2">
                  {role.title}
                </h3>
                <p className="text-muted-foreground mb-5">{role.tagline}</p>
                <ul className="space-y-3">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <ChevronRight className="h-4 w-4 text-[#f5a820] mt-0.5 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-8">
            Ready to earn more per mile?
          </h2>
          <button
            onClick={() => openAuthModal("signup")}
            className="inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg font-semibold bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black hover:opacity-90 transition-opacity"
          >
            Start Free
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="mt-5 text-sm text-muted-foreground">
            No credit card. No contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/loadhawk-logo.png"
                  alt="LoadHawk"
                  className="h-7 w-auto"
                />
                <span className="font-display text-lg font-semibold">
                  LoadHawk
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                The freight operating system
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/find-loads"
                    className="hover:text-foreground transition-colors"
                  >
                    Find Loads
                  </Link>
                </li>
                <li>
                  <Link
                    to="/broker-ratings"
                    className="hover:text-foreground transition-colors"
                  >
                    Broker Ratings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ai-negotiator"
                    className="hover:text-foreground transition-colors"
                  >
                    AI Negotiator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compare"
                    className="hover:text-foreground transition-colors"
                  >
                    Compare
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resources"
                    className="hover:text-foreground transition-colors"
                  >
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
            2026 LoadHawk. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
