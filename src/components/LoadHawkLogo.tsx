import { Zap } from "lucide-react";

export function LoadHawkLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { text: "text-xl", icon: 16 },
    md: { text: "text-3xl", icon: 24 },
    lg: { text: "text-5xl", icon: 36 },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <div className="gradient-gold rounded-md p-1.5">
        <Zap size={s.icon} className="text-primary-foreground fill-primary-foreground" />
      </div>
      <span className={`font-display ${s.text} gradient-gold-text tracking-wider`}>
        LOADHAWK
      </span>
    </div>
  );
}
