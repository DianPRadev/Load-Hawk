import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Shield,
  TrendingUp,
  Calculator,
  Star,
  Bot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";

interface Guide {
  title: string;
  icon: React.ReactNode;
  tips: string[];
}

const guides: Guide[] = [
  {
    title: "Rate Negotiation: The Complete Guide",
    icon: <BookOpen className="w-5 h-5 text-[#f5a820]" />,
    tips: [
      "Always know your cost per mile before calling (fuel + tolls + maintenance + insurance = your floor)",
      "Research the lane: check average rates for your origin-destination pair",
      "Lead with value: mention your on-time delivery rate, equipment condition, and availability",
      "Start 10-15% above your target — leave room to negotiate down",
      "Know your walk-away number and stick to it",
      "Ask about quick-pay options — some brokers offer 2-5 day pay for a small fee",
      "Get everything in writing: rate confirmation before you dispatch",
    ],
  },
  {
    title: "Understanding Broker Risk",
    icon: <Shield className="w-5 h-5 text-[#f5a820]" />,
    tips: [
      "Check the broker's MC number on FMCSA SaferSys",
      "Look at days-to-pay history — anything over 30 days is a yellow flag",
      "Ask for references from other carriers who've hauled for them",
      "Check if they have a surety bond or trust fund (required $75K minimum)",
      "Watch for red flags: pressure to book immediately, rates far above market, new MC numbers",
      "Use LoadHawk's broker ratings to see verified community reviews",
      "Consider factoring for new broker relationships to reduce payment risk",
    ],
  },
  {
    title: "Maximizing Trip Profitability",
    icon: <TrendingUp className="w-5 h-5 text-[#f5a820]" />,
    tips: [
      "Calculate true cost per mile: fuel ($0.55-0.65/mi) + tolls + maintenance ($0.15/mi) + insurance ($0.05/mi) + truck payment",
      "Minimize deadhead: plan your backhaul before accepting the first load",
      "Consider fuel stops strategically — prices vary by $0.50+/gallon between stations",
      "Track every expense: detention, lumper fees, scale tickets, tolls",
      "Review your lanes monthly — some lanes are consistently more profitable",
      "Use LoadHawk's earnings tracker to see real net profit per load",
      "Aim for $2.50+/mi net after all costs for profitable operations",
    ],
  },
];

const quickTools = [
  {
    title: "Cost Per Mile Calculator",
    description: "See profit estimates on every load",
    link: "/find-loads",
    icon: <Calculator className="w-6 h-6 text-[#f5a820]" />,
  },
  {
    title: "Broker Lookup",
    description: "Check ratings before you book",
    link: "/broker-ratings",
    icon: <Star className="w-6 h-6 text-[#f5a820]" />,
  },
  {
    title: "AI Rate Advisor",
    description: "Get counter-offer strategies",
    link: "/ai-negotiator",
    icon: <Bot className="w-6 h-6 text-[#f5a820]" />,
  },
];

export default function ResourcesPage() {
  const navigate = useNavigate();
  const [openGuide, setOpenGuide] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Freight Resources"
        description="Guides, tips, and tools to help owner-operators and small fleets earn more per mile."
      />

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
            <span className="gradient-gold-text">Freight Resources</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Guides and tools to help you earn more per mile
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">
        {/* Guide Cards */}
        <div className="space-y-4 mb-24 animate-fade-up">
          {guides.map((guide, i) => (
            <div key={i} className="glass-panel rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenGuide(openGuide === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 bg-transparent border-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {guide.icon}
                  <span className="font-display font-semibold text-lg text-foreground">
                    {guide.title}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    openGuide === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openGuide === i && (
                <div className="px-6 pb-6">
                  <ul className="space-y-3">
                    {guide.tips.map((tip, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="text-[#f5a820] font-bold mt-0.5 shrink-0">
                          {j + 1}.
                        </span>
                        <span className="text-muted-foreground text-sm leading-relaxed">
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Tools */}
        <div className="mb-24 animate-fade-up">
          <h2 className="font-display text-3xl font-bold text-center mb-10">
            <span className="gradient-gold-text">Quick Tools</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {quickTools.map((tool) => (
              <button
                key={tool.title}
                onClick={() => navigate(tool.link)}
                className="glass-panel rounded-2xl p-6 text-left hover:border-[#f5a820]/40 transition-colors cursor-pointer border border-transparent"
              >
                <div className="mb-3">{tool.icon}</div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {tool.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {tool.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center animate-fade-up">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Start finding profitable loads
          </h2>
          <button
            onClick={() => navigate("/find-loads")}
            className="py-3 px-8 rounded-xl font-semibold text-sm transition-all gradient-gold text-black hover:opacity-90"
          >
            Find Loads
          </button>
        </div>
      </div>
    </div>
  );
}
