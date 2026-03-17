import { User, CreditCard, Bell, Gift } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { useState } from "react";

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const tabs = [
    { id: "profile", label: "PROFILE", icon: User },
    { id: "subscription", label: "SUBSCRIPTION", icon: CreditCard },
    { id: "notifications", label: "NOTIFICATIONS", icon: Bell },
    { id: "referral", label: "REFERRAL", icon: Gift },
  ];

  const inputClass = "w-full bg-input border border-border-strong rounded-md px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-3xl tracking-wide animate-fade-up">SETTINGS</h1>

      <div className="flex gap-1 bg-card rounded-md p-1 border border-border animate-fade-up" style={{animationDelay:"100ms"}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-display tracking-wider rounded transition-all ${tab === t.id ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6 animate-fade-up" style={{animationDelay:"200ms"}}>
        {tab === "profile" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Full Name</label><input defaultValue="Marcus Johnson" className={inputClass} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Email</label><input defaultValue="marcus@loadhawk.com" className={inputClass} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Phone</label><input defaultValue="(214) 555-0147" className={inputClass} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">CDL Class</label>
                <select className={inputClass}><option>Class A</option><option>Class B</option><option>Class C</option></select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Home Base</label><input defaultValue="Dallas, TX" className={inputClass} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Preferred Lanes</label><input defaultValue="Southeast, Midwest" className={inputClass} /></div>
            </div>
            <GoldButton>SAVE CHANGES</GoldButton>
          </div>
        )}

        {tab === "subscription" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card-elevated rounded-lg border border-primary/20">
              <div>
                <div className="font-display text-xl tracking-wide">FREE PLAN</div>
                <p className="text-sm text-muted-foreground">Basic load board access</p>
              </div>
              <GoldButton>UPGRADE TO PRO</GoldButton>
            </div>
            <div className="p-4 bg-card-elevated rounded-lg border border-border">
              <div className="font-display text-lg mb-2 gradient-gold-text">PRO — $49/MO</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ AI Negotiator unlimited access</li>
                <li>✓ Advanced analytics & earnings insights</li>
                <li>✓ Priority load alerts</li>
                <li>✓ Broker intelligence reports</li>
              </ul>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-4">
            {["Load Alerts (Email)", "Load Alerts (SMS)", "Payment Received", "Rate Changes", "Negotiation Updates"].map(n => (
              <div key={n} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{n}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted-strong rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-foreground after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        )}

        {tab === "referral" && (
          <div className="space-y-4 text-center">
            <h3 className="font-display text-2xl">REFER & EARN</h3>
            <p className="text-muted-foreground text-sm">Earn $25 for every trucker who signs up with your link</p>
            <div className="bg-input border border-border rounded-md px-4 py-3 font-mono text-sm text-primary">
              loadhawk.com/ref/MARCUS-2847
            </div>
            <div className="flex justify-center gap-8 text-center">
              <div><div className="font-display text-2xl text-primary">12</div><div className="text-xs text-muted-foreground">Referrals</div></div>
              <div><div className="font-display text-2xl text-success">$300</div><div className="text-xs text-muted-foreground">Earned</div></div>
            </div>
            <GoldButton variant="secondary">COPY LINK</GoldButton>
          </div>
        )}
      </div>
    </div>
  );
}
