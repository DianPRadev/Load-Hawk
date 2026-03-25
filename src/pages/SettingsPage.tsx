import { User, CreditCard, Bell, Gift } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/store/AuthContext";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { authFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [searchParams] = useSearchParams();
  const [upgrading, setUpgrading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);

  const isPro = profile?.subscriptionTier === "pro";

  // Show success toast if redirected from Stripe checkout
  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success("Welcome to LoadHawk Pro!");
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await authFetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } catch {
      toast.error("Request timed out. Please try again.");
    } finally {
      clearTimeout(timeout);
    }
    setUpgrading(false);
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setManagingBilling(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await authFetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "No billing account found");
      }
    } catch {
      toast.error("Failed to connect to billing service");
    } finally {
      clearTimeout(timeout);
    }
    setManagingBilling(false);
  };
  const { data: notifSettings } = useNotificationSettings();
  const updateNotifSettings = useUpdateNotificationSettings();

  const [tab, setTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", cdlClass: "", homeBase: "", preferredLanes: "", role: "",
  });
  const [localNotifSettings, setLocalNotifSettings] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        cdlClass: profile.cdlClass,
        homeBase: profile.homeBase,
        preferredLanes: profile.preferredLanes,
        role: profile.role,
      });
      setIsDirty(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  useEffect(() => {
    if (notifSettings) setLocalNotifSettings({ ...notifSettings });
  }, [notifSettings]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "referral", label: "Referral", icon: Gift },
  ];

  const inputClass = "w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1f1f1f] focus:border-[#f5a820] focus:ring-1 focus:ring-[#f5a820]/20 rounded-lg px-4 py-2.5 text-[13px] text-foreground focus:outline-none";

  const handleSaveProfile = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => { setIsDirty(false); toast.success("Profile saved successfully!"); },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to save"),
    });
  };

  const notifLabelMap: Record<string, string> = {
    load_alerts_email: "Load Alerts (Email)",
    load_alerts_sms: "Load Alerts (SMS)",
    payment_received: "Payment Received",
    rate_changes: "Rate Changes",
    negotiation_updates: "Negotiation Updates",
  };

  const handleToggleNotif = (key: string) => {
    const updated = { ...localNotifSettings, [key]: !localNotifSettings[key] };
    setLocalNotifSettings(updated);
    const label = notifLabelMap[key] || key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    updateNotifSettings.mutate(updated, {
      onSuccess: () => toast.success(`${label}: ${updated[key] ? "enabled" : "disabled"}`),
      onError: () => {
        setLocalNotifSettings(localNotifSettings); // revert
        toast.error(`Failed to update ${label}`);
      },
    });
  };

  const handleCopyLink = () => {
    const link = `loadhawk.ai/ref/${(profile?.name || "user").replace(/\s/g, "-").toUpperCase()}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Referral link copied to clipboard!");
    }).catch(() => {
      toast.info(`Referral link: ${link}`);
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  if (profileLoading) {
    return <div className="max-w-4xl mx-auto flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <PageMeta title="Settings" />
      <h1 className="font-display text-3xl tracking-tight animate-fade-up">Settings</h1>

      <div className="segmented-control animate-fade-up overflow-x-auto flex-nowrap" style={{ animationDelay: "100ms" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 font-display tracking-tight ${tab === t.id ? "active text-foreground" : "text-muted-foreground"}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {tab === "profile" && (
          <div className="space-y-4">
            <fieldset disabled={updateProfile.isPending} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="text-[11px] text-muted-foreground mb-1.5 block">Full Name</label>
                <input id="name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className="text-[11px] text-muted-foreground mb-1.5 block">Email</label>
                <input id="email" type="email" value={formData.email} readOnly className={`${inputClass} opacity-60 cursor-not-allowed`} />
                <p className="text-[10px] text-muted-foreground mt-1">Contact support@loadhawk.ai to change your email</p>
              </div>
              <div>
                <label htmlFor="phone" className="text-[11px] text-muted-foreground mb-1.5 block">Phone</label>
                <input id="phone" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="cdl" className="text-[11px] text-muted-foreground mb-1.5 block">CDL Class</label>
                <select id="cdl" value={formData.cdlClass} onChange={e => handleInputChange("cdlClass", e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  <option>Class A</option>
                  <option>Class B</option>
                  <option>Class C</option>
                </select>
              </div>
              <div>
                <label htmlFor="homebase" className="text-[11px] text-muted-foreground mb-1.5 block">Home Base</label>
                <input id="homebase" value={formData.homeBase} onChange={e => handleInputChange("homeBase", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="lanes" className="text-[11px] text-muted-foreground mb-1.5 block">Preferred Lanes</label>
                <input id="lanes" value={formData.preferredLanes} onChange={e => handleInputChange("preferredLanes", e.target.value)} className={inputClass} />
              </div>
            </fieldset>
            <GoldButton onClick={handleSaveProfile} loading={updateProfile.isPending} loadingText="Saving..." disabled={updateProfile.isPending}>Save Changes</GoldButton>
          </div>
        )}

        {tab === "subscription" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0c0c0c] rounded-xl border border-primary/15">
              <div>
                <div className="font-display text-xl tracking-tight">{isPro ? "Pro Plan" : "Free Plan"}</div>
                <p className="text-[13px] text-muted-foreground">{isPro ? "Full access to all LoadHawk features" : "Basic load board access"}</p>
              </div>
              {isPro ? (
                <GoldButton variant="secondary" onClick={handleManageBilling} loading={managingBilling} loadingText="Loading...">Manage Billing</GoldButton>
              ) : (
                <GoldButton onClick={handleUpgrade} loading={upgrading} loadingText="Loading...">Upgrade to Pro</GoldButton>
              )}
            </div>
            {!isPro && (
              <div className="p-4 bg-gray-50 dark:bg-[#0c0c0c] rounded-xl border border-gray-200 dark:border-[#1f1f1f]">
                <div className="font-display text-lg mb-2 gradient-gold-text">Pro — $49/mo</div>
                <ul className="text-[13px] text-muted-foreground space-y-1.5">
                  <li>Unlimited AI negotiations</li>
                  <li>Advanced profit analytics</li>
                  <li>Priority load alerts</li>
                  <li>Saved searches and lane watchlists</li>
                  <li>Fleet management tools</li>
                  <li>CSV export</li>
                  <li>Dedicated support</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-1">
            {Object.keys(localNotifSettings).length === 0 ? (
              <div className="text-center text-muted-foreground text-[13px] py-8">Loading notification settings...</div>
            ) : (
              Object.keys(localNotifSettings).map(n => {
                return (
                <div key={n} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-[#1f1f1f] last:border-0">
                  <span className="text-[13px]">{notifLabelMap[n] || n.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={localNotifSettings[n]} onChange={() => handleToggleNotif(n)} className="sr-only peer" aria-label={`Toggle ${n}`} />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-foreground after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
                );
              })
            )}
          </div>
        )}

        {tab === "referral" && (
          <div className="space-y-4 text-center">
            <h3 className="font-display text-2xl">Refer & Earn</h3>
            <p className="text-muted-foreground text-[13px]">Earn $25 for every trucker who signs up with your link</p>
            <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1f1f1f] rounded-xl px-4 py-3 font-mono text-[13px] text-primary inline-block">
              loadhawk.ai/ref/{(profile?.name || "user").replace(/\s/g, "-").toUpperCase()}
            </div>
            <div className="flex items-center justify-center gap-3">
              <GoldButton variant="secondary" onClick={handleCopyLink}>Copy Link</GoldButton>
            </div>
            <div className="bg-gray-50 dark:bg-[#0c0c0c] rounded-lg px-4 py-2.5 inline-block">
              <p className="text-[11px] text-muted-foreground">Referral tracking launching soon. Your link has been reserved.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-6">
        <h3 className="font-display text-lg mb-1">Data & Privacy</h3>
        <p className="text-sm text-muted-foreground mb-4">Manage your personal data in accordance with GDPR and CCPA.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (!user) return;
              const [profileRes, loadsRes, negotiationsRes] = await Promise.all([
                supabase.from("profiles").select("*").eq("id", user.id).single(),
                supabase.from("booked_loads").select("*").eq("user_id", user.id),
                supabase.from("negotiations").select("*").eq("user_id", user.id),
              ]);
              const exportData = {
                exportedAt: new Date().toISOString(),
                profile: profileRes.data,
                bookedLoads: loadsRes.data || [],
                negotiations: negotiationsRes.data || [],
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `loadhawk-export-${new Date().toISOString().split("T")[0]}.json`; a.click();
              URL.revokeObjectURL(url);
              toast.success("Data exported successfully");
            }}
            className="px-4 py-2 text-sm border border-gray-200 dark:border-[#1f1f1f] rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
          >
            Export My Data
          </button>
          <button
            onClick={async () => {
              if (!user) return;
              if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
              if (!confirm("This will permanently delete all your data including loads, earnings, and settings. Continue?")) return;
              try {
                // Delete user data from all tables (RLS ensures only own data)
                await Promise.all([
                  supabase.from("booked_loads").delete().eq("user_id", user.id),
                  supabase.from("negotiations").delete().eq("user_id", user.id),
                  supabase.from("chat_messages").delete().eq("user_id", user.id),
                  supabase.from("chat_sessions").delete().eq("user_id", user.id),
                  supabase.from("drivers").delete().eq("fleet_owner_id", user.id),
                  supabase.from("notifications").delete().eq("user_id", user.id),
                  supabase.from("notification_settings").delete().eq("user_id", user.id),
                  supabase.from("saved_searches").delete().eq("user_id", user.id),
                  supabase.from("broker_ratings").delete().eq("user_id", user.id),
                ]);
                // Clear profile data (keep the row for foreign key integrity)
                await supabase.from("profiles").update({
                  name: "[deleted]",
                  email: "",
                  phone: "",
                  cdl_class: "",
                  home_base: "",
                  preferred_lanes: "",
                  role: "",
                  subscription_tier: "free",
                }).eq("id", user.id);
                await supabase.auth.signOut();
                toast.success("Your account data has been deleted.");
              } catch (err) {
                toast.error("Failed to delete account. Please contact support@loadhawk.ai");
              }
            }}
            className="px-4 py-2 text-sm border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
