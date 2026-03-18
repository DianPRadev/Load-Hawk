import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "@/store/AuthModalContext";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";
import { authFetch } from "@/lib/api";
import { PageMeta } from "@/components/PageMeta";

const freeFeatures = [
  "Browse available loads",
  "Basic load search & filters",
  "Broker ratings & reviews",
  "Book loads",
  "Basic earnings tracking",
  "AI negotiation (limited)",
];

const proFeatures = [
  "Everything in Free, plus:",
  "Unlimited AI negotiations",
  "Advanced profit analytics",
  "Priority load alerts",
  "Saved searches & lane watchlists",
  "Fleet management tools",
  "CSV export",
  "Dedicated support",
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
    a: "We currently support Dry Van, Reefer, and Flatbed, with more equipment types coming soon.",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta title="Pricing" />
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-16 animate-fade-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-gold-text">Pricing</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Simple, transparent pricing. Start free, upgrade when you're ready.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {/* Free Tier */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col animate-fade-up">
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
              <span className="text-muted-foreground ml-1">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#f5a820] shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => openAuthModal("signup")}
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all gradient-gold text-black hover:opacity-90"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col animate-fade-up border-2 border-[#f5a820]/60 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="gradient-gold text-black text-xs font-bold px-4 py-1 rounded-full">
                RECOMMENDED
              </span>
            </div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                Pro
              </h2>
              <p className="text-muted-foreground text-sm">
                For serious operators
              </p>
            </div>
            <div className="mb-8">
              <span className="font-display text-5xl font-bold gradient-gold-text">
                $49
              </span>
              <span className="text-muted-foreground ml-1">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map((feature, i) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      i === 0 ? "text-muted-foreground" : "text-[#f5a820]"
                    }`}
                  />
                  <span
                    className={
                      i === 0
                        ? "text-muted-foreground italic"
                        : "text-muted-foreground"
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm gradient-gold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-60"
            >
              {upgrading ? "Loading..." : "Upgrade to Pro"}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-24 animate-fade-up">
          <h2 className="font-display text-3xl font-bold text-center mb-10">
            <span className="gradient-gold-text">
              Frequently Asked Questions
            </span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-panel rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 bg-transparent border-none cursor-pointer"
                >
                  <span className="font-semibold text-foreground">
                    {faq.q}
                  </span>
                  <span className="text-muted-foreground text-xl shrink-0">
                    {openFaq === i ? "\u2212" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center animate-fade-up">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to start?
          </h2>
          <button
            onClick={() => openAuthModal("signup")}
            className="py-3 px-8 rounded-xl font-semibold text-sm transition-all gradient-gold text-black hover:opacity-90"
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
}
