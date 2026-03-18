import { Search, Star, Clock } from "lucide-react";
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

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageMeta title="Broker Ratings" />
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="font-display text-3xl tracking-tight">Broker Ratings</h1>
        <GoldButton size="sm" onClick={() => {
          if (!user) { openAuthModal("login"); return; }
          setRatingModal("pick");
          setUserRating(5);
          setUserComment("");
        }}>Rate a Broker</GoldButton>
      </div>

      <div className="relative animate-fade-up" style={{ animationDelay: "100ms" }}>
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Search by name or MC number..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search brokers" className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-[13px] focus:outline-none" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : brokers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-[13px]">No brokers match your search.</div>
      ) : (
        <div className="space-y-3">
          {brokers.map((b, i) => (
            <div key={b.id} className="glass-panel rounded-2xl p-5 card-hover animate-fade-up" style={{ animationDelay: `${150 + i * 80}ms` }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-xl tracking-tight">{b.name}</h3>
                    <span className="font-mono text-[11px] text-muted-foreground">{b.mc}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {b.badges.map(badge => (
                      <span key={badge} className={`pill-badge text-[10px] ${badge === "Avoid" ? "bg-destructive/15 text-destructive" : badge === "Fast Pay" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>{badge}</span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={11} /> Avg {b.daysToPay} days to pay</span>
                    <span>Lanes: {b.lanes}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-0.5 justify-end">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={15} className={s < Math.round(b.rating) ? "text-primary fill-primary" : "text-muted-foreground/30"} />
                      ))}
                    </div>
                    <div className="font-mono text-lg text-primary mt-1">{b.rating}</div>
                    <div className="text-[11px] text-muted-foreground">{b.reviews} reviews</div>
                  </div>
                  <GoldButton size="sm" variant="secondary" onClick={() => {
                    if (!user) { openAuthModal("login"); return; }
                    setRatingModal(b.id);
                    setUserRating(5);
                    setUserComment("");
                  }}>Rate</GoldButton>
                </div>
              </div>

              {b.userRatings.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[var(--table-border)] space-y-2">
                  <p className="text-[11px] text-muted-foreground font-display tracking-tight">Your Reviews</p>
                  {b.userRatings.map((r, ri) => (
                    <div key={ri} className="text-[12px] bg-[var(--glass-highlight)] rounded-xl p-3 flex justify-between items-start">
                      <div>
                        <div className="flex gap-0.5 mb-1">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={10} className={s < r.rating ? "text-primary fill-primary" : "text-muted-foreground/30"} />
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

      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setRatingModal(null)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
          <div className="relative glass-panel-heavy rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 window-chrome" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-xl mb-2">Rate Broker</h3>
            <p className="text-[13px] text-muted-foreground">{ratingModal !== "pick" ? brokers.find(b => b.id === ratingModal)?.name : "Select a broker below"}</p>

            <select value={ratingModal === "pick" ? "" : ratingModal} onChange={e => setRatingModal(e.target.value)} aria-label="Select broker to rate" className="w-full glass-input rounded-lg px-3 py-2 text-[13px] focus:outline-none">
              <option value="" disabled>Select a broker...</option>
              {brokers.map(b => (<option key={b.id} value={b.id}>{b.name} ({b.mc})</option>))}
            </select>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setUserRating(s)} aria-label={`Rate ${s} stars`} className="hover:scale-110 transition-transform">
                    <Star size={24} className={s <= userRating ? "text-primary fill-primary" : "text-muted-foreground/30"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Comment (optional)</label>
              <textarea value={userComment} onChange={e => setUserComment(e.target.value)} placeholder="How was your experience?" className="w-full glass-input rounded-xl px-4 py-2.5 text-[13px] focus:outline-none resize-none h-20" />
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
