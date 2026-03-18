import { Search, Star, Clock, MessageSquare, MapPin } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { useAuth } from "@/store/AuthContext";
import { useAuthModal } from "@/store/AuthModalContext";
import { useBrokers, useRateBroker } from "@/hooks/useBrokers";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";

export default function BrokerRatingsPage() {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const { data: brokers = [], isLoading } = useBrokers(debouncedSearch || undefined);
  const rateMutation = useRateBroker();
  const [ratingModal, setRatingModal] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  const handleRate = () => {
    if (!ratingModal || ratingModal === "pick" || !user) return;
    rateMutation.mutate(
      { brokerId: ratingModal, rating: userRating, comment: userComment },
      {
        onSuccess: () => {
          toast.success("Rating submitted!");
          setRatingModal(null);
          setUserRating(5);
          setUserComment("");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to submit rating"),
      }
    );
  };

  const daysToPayColor = (days: number) => {
    if (days <= 25) return "text-green-500";
    if (days <= 35) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageMeta title="Broker Ratings" />

      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight">Broker Ratings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Community-driven broker intelligence for smarter booking decisions.
            </p>
          </div>
          <GoldButton size="sm" onClick={() => {
            if (!user) { openAuthModal("login"); return; }
            setRatingModal("pick");
            setUserRating(5);
            setUserComment("");
          }}>Rate a Broker</GoldButton>
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-fade-up" style={{ animationDelay: "100ms" }}>
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by name or MC number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search brokers"
          className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-lg pl-10 pr-4 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/40 transition-shadow"
        />
      </div>

      {/* Broker list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : brokers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-[13px]">No brokers match your search.</div>
      ) : (
        <div className="space-y-3">
          {brokers.map((b, i) => (
            <div
              key={b.id}
              className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 hover:border-primary/30 transition-colors animate-fade-up"
              style={{ animationDelay: `${150 + i * 80}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Left: name + MC + badges */}
                <div className="sm:w-1/3">
                  <h3 className="font-display text-lg font-bold tracking-tight">{b.name}</h3>
                  <span className="font-mono text-[11px] text-muted-foreground block mt-0.5">MC# {b.mc}</span>
                  {b.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {b.badges.map(badge => (
                        <span
                          key={badge}
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            badge === "Avoid"
                              ? "bg-red-500/10 text-red-500"
                              : badge === "Fast Pay"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Center: metrics row */}
                <div className="flex-1 flex items-center gap-6 sm:justify-center">
                  {/* Rating */}
                  <div className="text-center">
                    <span className="font-mono text-2xl font-bold text-amber-500 leading-none">{b.rating}</span>
                    <div className="flex items-center gap-0.5 mt-1 justify-center" aria-label={`Rating: ${b.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={12} className={s < Math.round(b.rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"} />
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-gray-200 dark:bg-[#1f1f1f] hidden sm:block" />

                  {/* Reviews */}
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center text-muted-foreground">
                      <MessageSquare size={12} />
                      <span className="font-mono text-sm font-semibold text-foreground">{b.reviews}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">reviews</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-gray-200 dark:bg-[#1f1f1f] hidden sm:block" />

                  {/* Days to pay */}
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className={`font-mono text-sm font-semibold ${daysToPayColor(b.daysToPay)}`}>{b.daysToPay}d</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">to pay</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-gray-200 dark:bg-[#1f1f1f] hidden sm:block" />

                  {/* Lanes */}
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center text-muted-foreground">
                      <MapPin size={12} />
                      <span className="font-mono text-sm font-semibold text-foreground">{b.lanes}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">lanes</span>
                  </div>
                </div>

                {/* Right: Rate button */}
                <div className="sm:w-auto shrink-0">
                  <GoldButton size="sm" variant="secondary" onClick={() => {
                    if (!user) { openAuthModal("login"); return; }
                    setRatingModal(b.id);
                    setUserRating(5);
                    setUserComment("");
                  }}>Rate</GoldButton>
                </div>
              </div>

              {/* User reviews */}
              {b.userRatings.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#1f1f1f] space-y-2">
                  <p className="text-[11px] text-muted-foreground font-display tracking-tight">Your Reviews</p>
                  {b.userRatings.map((r, ri) => (
                    <div key={ri} className="text-[12px] bg-gray-50 dark:bg-[#0c0c0c] border border-gray-100 dark:border-[#1a1a1a] rounded-lg p-3 flex justify-between items-start">
                      <div>
                        <div className="flex gap-0.5 mb-1" aria-label={`Rating: ${r.rating} out of 5`}>
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={10} className={s < r.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"} />
                          ))}
                        </div>
                        {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
                      </div>
                      <span className="text-muted-foreground text-[11px]">{r.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setRatingModal(null)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
          <div
            className="relative bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-6 max-w-md w-full mx-4 space-y-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-xl mb-2">Rate Broker</h3>
            <p className="text-[13px] text-muted-foreground">
              {ratingModal !== "pick" ? brokers.find(b => b.id === ratingModal)?.name : "Select a broker below"}
            </p>

            <select
              value={ratingModal === "pick" ? "" : ratingModal}
              onChange={e => setRatingModal(e.target.value)}
              aria-label="Select broker to rate"
              className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="" disabled>Select a broker...</option>
              {brokers.map(b => (<option key={b.id} value={b.id}>{b.name} ({b.mc})</option>))}
            </select>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-2">Rating</label>
              <div className="flex gap-1" role="radiogroup" aria-label="Select rating">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setUserRating(s)} aria-label={`Rate ${s} stars`} className="hover:scale-110 transition-transform">
                    <Star size={24} className={s <= userRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Comment (optional)</label>
              <textarea
                value={userComment}
                onChange={e => setUserComment(e.target.value)}
                placeholder="How was your experience?"
                className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none h-20"
              />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <GoldButton variant="secondary" onClick={() => setRatingModal(null)}>Cancel</GoldButton>
              <GoldButton onClick={handleRate} loading={rateMutation.isPending} disabled={ratingModal === "pick"}>Submit Rating</GoldButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
