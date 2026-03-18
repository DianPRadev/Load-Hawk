import { ArrowLeft, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "@/store/AuthModalContext";
import { PageMeta } from "@/components/PageMeta";

const comparisons = [
  {
    competitor: "DAT",
    strengths:
      "Industry-standard rate data, large broker network, CarrierWatch add-on",
    difference:
      "Free plan available, built-in AI negotiation, profit calculator on every load, community broker ratings included",
  },
  {
    competitor: "Truckstop",
    strengths:
      "Load alerts, Book It Now, rate insights, factoring",
    difference:
      "Free to start, AI-powered counter-offer strategies, real net profit tracking, fleet management included",
  },
  {
    competitor: "TruckSmarter",
    strengths:
      "Free load board, fuel savings, AI dispatch",
    difference:
      "Deeper AI negotiation with call scripts, community broker trust scores, earnings P&L tracking, fleet tools",
  },
];

const differentiators = [
  "Free forever plan",
  "AI negotiation assistant",
  "Net profit per load",
  "Community broker ratings",
];

export default function ComparePage() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta title="Compare Load Boards" />

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
            How LoadHawk compares
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            An honest look at how we stack up against the major load boards.
          </p>
        </div>
      </div>

      {/* Competitor Comparison Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="space-y-6 mb-20 sm:mb-24">
          {comparisons.map((comp) => (
            <div
              key={comp.competitor}
              className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl p-8"
            >
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">
                LoadHawk vs {comp.competitor}
              </h3>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* Their strengths */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Their strengths
                  </p>
                  <ul className="space-y-2.5">
                    {comp.strengths.split(", ").map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Our difference */}
                <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-[#1f1f1f] pt-6 md:pt-0 md:pl-8">
                  <p className="text-sm font-semibold text-[#f5a820] uppercase tracking-wide mb-3">
                    Our difference
                  </p>
                  <ul className="space-y-2.5">
                    {comp.difference.split(", ").map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-[#f5a820] shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Strip */}
        <div className="py-6 sm:py-8 mb-20 sm:mb-24 bg-gray-50 dark:bg-[#0a0a0a] rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 px-4 sm:px-6">
            {differentiators.map((point, i) => (
              <div
                key={point}
                className={`flex items-center justify-center gap-2 py-2 font-mono text-xs sm:text-sm text-muted-foreground ${
                  i < differentiators.length - 1
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

        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={() => openAuthModal("signup")}
            className="inline-flex items-center rounded-xl px-10 py-4 text-base font-semibold bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black hover:opacity-90 transition-opacity"
          >
            Try LoadHawk free
          </button>
          <p className="mt-5 text-sm text-muted-foreground">
            No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
