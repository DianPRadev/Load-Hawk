import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadHawkLogo } from "@/components/LoadHawkLogo";
import { GoldButton } from "@/components/GoldButton";
import { Apple, Chrome, Facebook, AlertTriangle, Truck, Radio, Building2, Check } from "lucide-react";

type Mode = "login" | "signup" | "role-select" | "success";
type Role = "driver" | "dispatcher" | "carrier";

const roles = [
  { id: "driver" as Role, title: "Driver", icon: Truck, desc: "Owner-operator finding and booking loads" },
  { id: "dispatcher" as Role, title: "Dispatcher", icon: Radio, desc: "Managing drivers and coordinating freight" },
  { id: "carrier" as Role, title: "Carrier", icon: Building2, desc: "Running a fleet and managing operations" },
];

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "signup") {
        setMode("role-select");
      } else {
        navigate("/dashboard");
      }
    }, 1500);
  };

  const handleRoleSelect = () => {
    if (selectedRole) setMode("success");
  };

  const handleEnterApp = () => navigate("/dashboard");

  const inputClass = "w-full bg-input border border-border-strong rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  if (mode === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full gold-glow opacity-30" />
        <div className="text-center z-10 animate-fade-up">
          <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-primary-foreground" />
          </div>
          <h1 className="font-display text-5xl gradient-gold-text mb-4">LET'S FLY</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your {selectedRole} dashboard is loading. Hot loads are waiting.
          </p>
          <GoldButton size="lg" onClick={handleEnterApp}>ENTER DASHBOARD</GoldButton>
        </div>
      </div>
    );
  }

  if (mode === "role-select") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full gold-glow opacity-20" />
        <div className="w-full max-w-lg z-10 p-6 animate-fade-up">
          <div className="text-center mb-8">
            <LoadHawkLogo size="md" />
            <h2 className="font-display text-3xl mt-4">SELECT YOUR ROLE</h2>
            <p className="text-muted-foreground text-sm mt-1">Choose how you'll use LoadHawk</p>
          </div>
          <div className="grid gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex items-center gap-4 p-5 rounded-lg border transition-all duration-200 text-left ${
                  selectedRole === role.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-border-strong"
                }`}
              >
                <div className={`p-3 rounded-md ${selectedRole === role.id ? "gradient-gold" : "bg-card-elevated"}`}>
                  <role.icon size={24} className={selectedRole === role.id ? "text-primary-foreground" : "text-muted-foreground"} />
                </div>
                <div>
                  <div className="font-display text-xl tracking-wide">{role.title.toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">{role.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <GoldButton className="w-full mt-6" size="lg" onClick={handleRoleSelect} disabled={!selectedRole}>
            CONTINUE
          </GoldButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full gold-glow opacity-20" />
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="w-full max-w-md z-10 p-6 animate-fade-up">
        <div className="text-center mb-8">
          <LoadHawkLogo size="lg" />
        </div>

        {/* Toggle */}
        <div className="flex mb-8 bg-card rounded-md p-1 border border-border">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-display tracking-wider rounded transition-all ${mode === "login" ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}
          >
            LOGIN
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm font-display tracking-wider rounded transition-all ${mode === "signup" ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}
          >
            SIGNUP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input type="text" placeholder="Full Name" className={inputClass} />
          )}
          <input type="email" placeholder="Email Address" className={inputClass} />
          {mode === "signup" && (
            <input type="tel" placeholder="Phone Number" className={inputClass} />
          )}
          <input type="password" placeholder="Password" className={inputClass} />
          {mode === "signup" && (
            <>
              <input type="password" placeholder="Confirm Password" className={inputClass} />
              <select className={inputClass}>
                <option value="">CDL Class</option>
                <option>Class A</option>
                <option>Class B</option>
                <option>Class C</option>
              </select>
            </>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border-strong accent-primary" />
                Remember Me
              </label>
              <button type="button" className="text-primary hover:text-primary-highlight">Forgot?</button>
            </div>
          )}

          <GoldButton className="w-full" size="lg" type="submit" loading={loading} loadingText="AUTHENTICATING...">
            {mode === "login" ? "LOGIN" : "CREATE ACCOUNT"}
          </GoldButton>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Apple, label: "Apple" },
            { icon: Chrome, label: "Google" },
            { icon: Facebook, label: "Meta" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center justify-center gap-2 py-2.5 border border-border-strong rounded-md text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
