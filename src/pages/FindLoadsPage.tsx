import { MapPin, Sparkles, ChevronLeft, ChevronRight, Save, X, Bell, BellOff, ChevronDown, ChevronUp } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { LoadCard } from "@/components/LoadCard";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { useAvailableLoads, useAvailableLoadsCount, useBookLoad, useBookedLoads } from "@/hooks/useLoads";
import { useSavedSearches, useSaveSearch, useDeleteSavedSearch, useToggleSearchAlerts } from "@/hooks/useSavedSearches";
import { useAuthModal } from "@/store/AuthModalContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageMeta } from "@/components/PageMeta";

const PAGE_SIZE = 20;

export default function FindLoadsPage() {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [aiHighlight, setAiHighlight] = useState(false);
  const [origin, setOrigin] = useState(searchParams.get("q") || "");
  const [destination, setDestination] = useState("");
  const [equipment, setEquipment] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxDH, setMaxDH] = useState("");
  const [page, setPage] = useState(1);

  // Saved search state
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(true);

  // Saved search hooks
  const { data: savedSearches = [] } = useSavedSearches();
  const saveSearchMutation = useSaveSearch();
  const deleteSearchMutation = useDeleteSavedSearch();
  const toggleAlertsMutation = useToggleSearchAlerts();

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [origin, destination, equipment, minRate, maxDH, aiHighlight]);

  const filterParams = {
    origin: origin || undefined,
    destination: destination || undefined,
    equipment: equipment || undefined,
    minRate: minRate ? Number(minRate) : undefined,
    maxMiles: maxDH ? Number(maxDH) : undefined,
  };

  const { data: allLoads = [] } = useAvailableLoads({ ...filterParams, page });
  const { data: totalCount = 0 } = useAvailableLoadsCount(filterParams);
  const { data: bookedLoads = [] } = useBookedLoads();
  const bookMutation = useBookLoad();

  const displayLoads = useMemo(() => {
    if (aiHighlight) return [...allLoads].sort((a, b) => b.ratePerMile - a.ratePerMile);
    return allLoads;
  }, [allLoads, aiHighlight]);

  const handleClearFilters = () => { setOrigin(""); setDestination(""); setEquipment(""); setMinRate(""); setMaxDH(""); };

  const handleBook = (loadId: string) => {
    if (!user) { openAuthModal("login"); return; }
    const load = allLoads.find(l => l.id === loadId);
    if (!load) return;
    bookMutation.mutate(loadId, {
      onSuccess: () => toast.success(`Load booked: ${load.origin} → ${load.destination}`, { description: `$${load.rate.toLocaleString()}` }),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to book"),
    });
  };

  const handleSaveSearch = () => {
    const trimmed = searchName.trim();
    if (!trimmed) { toast.error("Please enter a name for this search"); return; }
    saveSearchMutation.mutate(
      {
        name: trimmed,
        origin: origin || undefined,
        destination: destination || undefined,
        equipment: equipment || undefined,
        min_rate: minRate ? Number(minRate) : undefined,
        max_miles: maxDH ? Number(maxDH) : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Search saved");
          setSearchName("");
          setShowSaveForm(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to save search"),
      }
    );
  };

  const handleApplySavedSearch = (search: typeof savedSearches[0]) => {
    setOrigin(search.origin || "");
    setDestination(search.destination || "");
    setEquipment(search.equipment || "");
    setMinRate(search.min_rate ? String(search.min_rate) : "");
    setMaxDH(search.max_miles ? String(search.max_miles) : "");
    toast.success(`Applied: ${search.name}`);
  };

  const handleDeleteSearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSearchMutation.mutate(id, {
      onSuccess: () => toast.success("Search deleted"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete"),
    });
  };

  const handleToggleAlerts = (e: React.MouseEvent, id: string, currentValue: boolean) => {
    e.stopPropagation();
    toggleAlertsMutation.mutate(
      { id, currentValue },
      {
        onSuccess: () => toast.success(currentValue ? "Alerts disabled" : "Alerts enabled"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to toggle alerts"),
      }
    );
  };

  const isBooked = (loadId: string) => bookedLoads.some(b => b.id === loadId);
  const hasFilters = origin || destination || equipment || minRate || maxDH;
  const inputClass = "bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#f5a820] transition-colors";

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedLoads = displayLoads;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <PageMeta title="Find Loads" />
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-4 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={15} className="text-[#f5a820]" />
          <span className="font-display text-base tracking-tight">Top Lanes</span>
          <span className="text-[11px] font-mono text-muted-foreground ml-auto">{totalCount} loads</span>
        </div>
        {displayLoads.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {[...new Map(displayLoads.slice(0, 12).map(l => [`${l.origin}-${l.destination}`, l])).values()].slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#1f1f1f] rounded-full px-3 py-1.5 text-[12px]">
                <span>{l.origin}</span>
                <span className="text-muted-foreground">&rarr;</span>
                <span>{l.destination}</span>
                <span className="font-mono text-[#f5a820] text-[11px] ml-1">${l.ratePerMile.toFixed(2)}/mi</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-[13px] py-4">No lanes match your filters</div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center animate-fade-up" style={{ animationDelay: "100ms" }}>
        <input placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} aria-label="Filter by origin" className={`${inputClass} w-full sm:w-36`} />
        <input placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} aria-label="Filter by destination" className={`${inputClass} w-full sm:w-36`} />
        <select value={equipment} onChange={e => setEquipment(e.target.value)} aria-label="Filter by equipment type" className={`${inputClass} w-full sm:w-auto`}>
          <option value="">All Equipment</option>
          <option value="Dry Van">Dry Van</option>
          <option value="Reefer">Reefer</option>
          <option value="Flatbed">Flatbed</option>
        </select>
        <input placeholder="Min Rate ($)" value={minRate} onChange={e => setMinRate(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Minimum rate" className={`${inputClass} w-[calc(50%-4px)] sm:w-28`} />
        <input placeholder="Max Miles" value={maxDH} onChange={e => setMaxDH(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Maximum miles" className={`${inputClass} w-[calc(50%-4px)] sm:w-28`} />
        {hasFilters && <GoldButton size="sm" variant="ghost" onClick={handleClearFilters}>Clear</GoldButton>}
        <GoldButton size="sm" variant={aiHighlight ? "primary" : "secondary"} onClick={() => setAiHighlight(!aiHighlight)}>
          <Sparkles size={13} /> {aiHighlight ? "AI Sorted" : "AI Recommend"}
        </GoldButton>
        {user && (
          <>
            {showSaveForm ? (
              <div className="flex items-center gap-1.5">
                <input
                  placeholder="Search name"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveSearch(); if (e.key === "Escape") { setShowSaveForm(false); setSearchName(""); } }}
                  autoFocus
                  className={`${inputClass} w-36`}
                />
                <GoldButton size="sm" onClick={handleSaveSearch} loading={saveSearchMutation.isPending}>
                  Save
                </GoldButton>
                <GoldButton size="sm" variant="ghost" onClick={() => { setShowSaveForm(false); setSearchName(""); }}>
                  <X size={13} />
                </GoldButton>
              </div>
            ) : (
              <GoldButton size="sm" variant="secondary" onClick={() => setShowSaveForm(true)}>
                <Save size={13} /> Save Search
              </GoldButton>
            )}
          </>
        )}
      </div>

      {/* Saved Searches */}
      {user && savedSearches.length > 0 && (
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <button
            onClick={() => setSavedSearchesOpen(!savedSearchesOpen)}
            className="flex items-center gap-2 w-full text-left"
          >
            <Save size={14} className="text-[#f5a820]" />
            <span className="font-display text-[13px] tracking-tight">Saved Searches</span>
            <span className="text-[11px] font-mono text-muted-foreground">({savedSearches.length})</span>
            {savedSearchesOpen ? <ChevronUp size={14} className="ml-auto text-muted-foreground" /> : <ChevronDown size={14} className="ml-auto text-muted-foreground" />}
          </button>
          {savedSearchesOpen && (
            <div className="flex flex-wrap gap-2 mt-3">
              {savedSearches.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleApplySavedSearch(s)}
                  className="group flex items-center gap-1.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#1f1f1f] rounded-full px-3 py-1.5 text-[12px] cursor-pointer hover:border-[#f5a820]/40 transition-colors"
                >
                  <span className="font-display">{s.name}</span>
                  {(s.origin || s.destination) && (
                    <span className="text-muted-foreground">
                      {s.origin || "*"} &rarr; {s.destination || "*"}
                    </span>
                  )}
                  {s.equipment && (
                    <span className="text-[#f5a820]/70 text-[10px]">{s.equipment}</span>
                  )}
                  <button
                    onClick={(e) => handleToggleAlerts(e, s.id, s.alerts_enabled)}
                    className="ml-1 text-muted-foreground hover:text-[#f5a820] transition-colors"
                    title={s.alerts_enabled ? "Disable alerts" : "Enable alerts"}
                  >
                    {s.alerts_enabled ? <Bell size={12} className="text-[#f5a820]" /> : <BellOff size={12} />}
                  </button>
                  <button
                    onClick={(e) => handleDeleteSearch(e, s.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Delete saved search"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-[12px] text-muted-foreground font-mono">
        Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalCount)}&ndash;{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} loads{aiHighlight && " -- sorted by best $/mile"}
      </div>

      {/* Top pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <GoldButton size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={14} /> Prev
          </GoldButton>
          <span className="text-[13px] font-mono text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <GoldButton size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next <ChevronRight size={14} />
          </GoldButton>
        </div>
      )}

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {paginatedLoads.length === 0 ? (
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-8 text-center text-muted-foreground text-[13px]">No loads match your filters.</div>
        ) : (
          paginatedLoads.map((l, i) => (
            <LoadCard key={l.id} {...l} delay={200 + i * 50} />
          ))
        )}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1f1f1f]">
                {["Origin", "Destination", "Miles", "Rate", "$/Mile", "Equipment", "Broker", "Rating", "Posted", "Action"].map(h => (
                  <th key={h} scope="col" className="text-left px-4 py-3 font-display text-muted-foreground tracking-tight text-[11px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedLoads.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground text-[13px]">No loads match your filters.</td></tr>
              ) : (
                paginatedLoads.map((l) => {
                  const booked = isBooked(l.id);
                  return (
                    <tr key={l.id} className={`border-b border-gray-100 dark:border-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors ${aiHighlight && l.ratePerMile > 4 ? "bg-[#f5a820]/[0.03]" : ""}`}>
                      <td className="px-4 py-3">{l.origin}</td>
                      <td className="px-4 py-3">{l.destination}</td>
                      <td className="px-4 py-3 font-mono text-[12px]">{l.miles}</td>
                      <td className="px-4 py-3 font-mono text-lg text-[#f5a820] font-semibold">${l.rate.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-success">${l.ratePerMile.toFixed(2)}</td>
                      <td className="px-4 py-3"><span className="bg-gray-100 dark:bg-[#1f1f1f] text-[10px] px-2 py-0.5 rounded-full">{l.equipment}</span></td>
                      <td className="px-4 py-3">{l.broker}</td>
                      <td className="px-4 py-3 font-mono text-[12px]">{l.brokerRating}</td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px]">{l.postedAgo}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {booked ? (
                            <GoldButton size="sm" variant="secondary" disabled>Booked</GoldButton>
                          ) : (
                            <>
                              <GoldButton size="sm" onClick={() => handleBook(l.id)}>Book</GoldButton>
                              <GoldButton size="sm" variant="secondary" onClick={() => { if (!user) { navigate("/login"); return; } navigate("/ai-negotiator", { state: { loadId: l.id } }); }}>Negotiate</GoldButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <GoldButton size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={14} /> Prev
          </GoldButton>
          <span className="text-[13px] font-mono text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <GoldButton size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next <ChevronRight size={14} />
          </GoldButton>
        </div>
      )}
    </div>
  );
}
