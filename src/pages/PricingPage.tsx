import { useState } from "react";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "@/store/AuthModalContext";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";
import { authFetch } from "@/lib/api";
import { PageMeta } from "@/components/PageMeta";

const freeFeatures = [
  "Browse and search available loads",
  "Basic load filters (lane, equipment, rate)",
  "Community broker ratings",
  "Book loads and track status",
  "Basic earnings overview",
  "AI negotiation (5 per day)",
];

const proFeatures = [
  "Unlimited AI negotiations",
  "Advanced profit analytics per load",
  "Saved searches and lane alerts",
  "Fleet management dashboard",
  "CSV export for settlements",
  "Priority support",
];

const fleetFeatures = [
  "Everything in Pro",
  "Unlimited team members",
  "Fleet analytics dashboard",
  "Priority support",
  "Custom integrations",
  "Dedicated account manager",
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, no contracts. You can cancel your subscription at any time and continue using the Free plan.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, we use enterprise-grade encryption via Supabase to keep your data safe and secure at all times.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No, the Free plan requires no payment information. Just create an account and start finding loads.",
  },
  {
    q: "What equipment types are supported?",
    a: "We currently support Dry Van, Reefer, and Flatbed, with more equipment types on the roadmap.",
  },
  {
    q: "How does AI negotiation work?",
    a: "Our AI analyzes lane rates, broker history, and your cost profile to suggest optimal counter-offers, helping you negotiate better rates with confidence.",
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [annual, setAnnual] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      openAuthModal("signup");
      return;
    }
    setUpgrading(true);
    try {
      const res = await authFetch("/api/create-checkout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } catch {
      toast.error("Failed to connect to billing service");
    }
    setUpgrading(false);
  };

  const proPrice = annual ? 39 : 49;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta title="Pricing" />

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-12 sm:mb-16">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free. Upgrade when LoadHawk is making you money.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Annual/Monthly Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center bg-gray-100 dark:bg-[#1a1a1a] rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !annual
                  ? "bg-white dark:bg-[#282828] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                annual
                  ? "bg-white dark:bg-[#282828] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[11px] font-bold px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-20 sm:mb-24">
          {/* Free Tier */}
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                Free
              </h2>
              <p className="text-muted-foreground text-sm">Free forever</p>
            </div>
            <div className="mb-8">
              <span className="font-display text-5xl font-bold text-foreground">
                $0
              </span>
              <span className="text-muted-foreground ml-1 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => openAuthModal("signup")}
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-opacity bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black hover:opacity-90"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-white dark:bg-[#141414] border border-primary/30 ring-1 ring-primary/20 rounded-2xl p-8 flex flex-col relative">
            {/* Most Popular Badge */}
            <div className="flex justify-center mb-4">
              <span className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                Pro
              </h2>
              <p className="text-muted-foreground text-sm">For serious operators</p>
            </div>
            <div className="mb-8">
              <span className="font-display text-5xl font-bold text-foreground">
                ${proPrice}
              </span>
              <span className="text-muted-foreground ml-1 text-sm">/month</span>
              {annual && (
                <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-semibold">
                  billed annually
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground italic mb-4">
              Everything in Free, plus:
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#f5a820] shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-opacity bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black hover:opacity-90 disabled:opacity-60"
            >
              {upgrading ? "Loading..." : "Upgrade to Pro"}
            </button>
          </div>

          {/* Fleet Tier */}
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                Fleet
              </h2>
              <p className="text-muted-foreground text-sm">For companies with 5+ trucks</p>
            </div>
            <div className="mb-8">
              <span className="font-display text-5xl font-bold text-foreground">
                Custom
              </span>
            </div>
            <p className="text-sm text-muted-foreground italic mb-4">
              Everything in Pro, plus:
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {fleetFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#f5a820] shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="mailto:sales@loadhawk.ai"
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-center transition-colors border border-gray-300 dark:border-[#333] text-foreground hover:bg-gray-50 dark:hover:bg-[#1a1a1a] block"
            >
              Contact Sales
            </a>
          </div>
        </div>

        {/* Social Proof Strip */}
        <div className="text-center mb-20 sm:mb-24">
          <p className="font-display text-lg sm:text-xl font-bold text-foreground mb-6">
            Trusted by 2,500+ owner-operators nationwide
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-muted-foreground">
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-foreground">15K+</span>
              <span>Loads Matched</span>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200 dark:bg-[#1f1f1f]" />
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-foreground">98%</span>
              <span>Uptime</span>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200 dark:bg-[#1f1f1f]" />
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-foreground">$2.3M+</span>
              <span>Negotiated Savings</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20 sm:mb-24">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-10">
            Frequently asked questions
          </h2>
          <div>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={
                  i < faqs.length - 1
                    ? "border-b border-gray-200 dark:border-[#1f1f1f]"
                    : ""
                }
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4 bg-transparent border-none cursor-pointer"
                >
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="pb-5 text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Questions? Reach out at{" "}
            <a
              href="mailto:support@loadhawk.ai"
              className="text-foreground hover:text-[#f5a820] transition-colors underline underline-offset-4"
            >
              support@loadhawk.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
