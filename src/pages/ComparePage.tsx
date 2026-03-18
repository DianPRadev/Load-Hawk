import { ArrowLeft, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "@/store/AuthModalContext";
import { PageMeta } from "@/components/PageMeta";

type CellValue = true | false | string;

interface FeatureRow {
  feature: string;
  loadhawk: CellValue;
  dat: CellValue;
  truckstop: CellValue;
  trucksmarter: CellValue;
}

const comparisonData: FeatureRow[] = [
  {
    feature: "Free Plan",
    loadhawk: true,
    dat: false,
    truckstop: false,
    trucksmarter: true,
  },
  {
    feature: "Starting Price",
    loadhawk: "$0/mo",
    dat: "~$45/mo",
    truckstop: "~$39/mo",
    trucksmarter: "$0/mo",
  },
  {
    feature: "AI Negotiation",
    loadhawk: true,
    dat: false,
    truckstop: false,
    trucksmarter: "Basic",
  },
  {
    feature: "Broker Ratings",
    loadhawk: "Community-rated",
    dat: "CarrierWatch (add-on)",
    truckstop: "Basic",
    trucksmarter: "Limited",
  },
  {
    feature: "Profit Calculator",
    loadhawk: "Built-in per load",
    dat: "Separate tool",
    truckstop: false,
    trucksmarter: "Basic",
  },
  {
    feature: "Real-time Alerts",
    loadhawk: true,
    dat: "Paid",
    truckstop: "Paid",
    trucksmarter: true,
  },
  {
    feature: "Fleet Management",
    loadhawk: "Included",
    dat: "Separate product",
    truckstop: "Limited",
    trucksmarter: false,
  },
  {
    feature: "Mobile Optimized",
    loadhawk: "Mobile web",
    dat: "App required",
    truckstop: "App required",
    trucksmarter: true,
  },
  {
    feature: "Earnings Tracking",
    loadhawk: "Full P&L",
    dat: false,
    truckstop: false,
    trucksmarter: "Basic",
  },
  {
    feature: "Saved Searches",
    loadhawk: "Unlimited",
    dat: "Limited",
    truckstop: "Limited",
    trucksmarter: "Limited",
  },
];

const whyCards = [
  {
    title: "Built for Profit, Not Just Search",
    description:
      "LoadHawk shows net profit per load after fuel, tolls, and fees. Competitors show rate only.",
  },
  {
    title: "AI That Negotiates For You",
    description:
      "Get counter-offer strategies, call scripts, and broker intelligence before you call. Not just rate data.",
  },
  {
    title: "Free Forever Plan",
    description:
      "Unlike DAT and Truckstop, basic access is always free. Pro adds power features at $49/mo.",
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-[#f5a820] mx-auto" />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-red-400/70 mx-auto" />;
  }
  return (
    <span className="text-sm text-muted-foreground">{value}</span>
  );
}

export default function ComparePage() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta title="Compare Load Boards" />

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-16 animate-fade-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-gold-text">How LoadHawk Compares</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how LoadHawk stacks up against the leading load boards on the
            features that matter most to owner-operators and small fleets.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="glass-panel rounded-2xl overflow-hidden animate-fade-up mb-24">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-6 py-4 font-bold text-center border-x border-[#f5a820]/20 bg-[#f5a820]/5">
                    <span className="gradient-gold-text font-display text-base">
                      LoadHawk
                    </span>
                  </th>
                  <th className="px-6 py-4 font-semibold text-center text-muted-foreground">
                    DAT
                  </th>
                  <th className="px-6 py-4 font-semibold text-center text-muted-foreground">
                    Truckstop
                  </th>
                  <th className="px-6 py-4 font-semibold text-center text-muted-foreground">
                    TruckSmarter
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i < comparisonData.length - 1
                        ? "border-b border-white/5"
                        : ""
                    }
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center border-x border-[#f5a820]/20 bg-[#f5a820]/5">
                      <CellContent value={row.loadhawk} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellContent value={row.dat} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellContent value={row.truckstop} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellContent value={row.trucksmarter} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why LoadHawk Cards */}
        <div className="mb-24 animate-fade-up">
          <h2 className="font-display text-3xl font-bold text-center mb-10">
            <span className="gradient-gold-text">Why LoadHawk</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((card) => (
              <div
                key={card.title}
                className="glass-panel rounded-2xl p-8 flex flex-col"
              >
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center animate-fade-up">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to switch?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Find better loads and keep more profit with LoadHawk.
            Free to start, no credit card required.
          </p>
          <button
            onClick={() => openAuthModal("signup")}
            className="py-3 px-8 rounded-xl font-semibold text-sm transition-all gradient-gold text-black hover:opacity-90"
          >
            Try LoadHawk Free
          </button>
        </div>
      </div>
    </div>
  );
}
