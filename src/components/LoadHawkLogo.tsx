export function LoadHawkLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { text: "text-lg", img: "w-8 h-8" },
    md: { text: "text-2xl", img: "w-10 h-10" },
    lg: { text: "text-4xl", img: "w-14 h-14" },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <img src="/loadhawk-logo.png" alt="LoadHawk" className={`${s.img} rounded-lg object-contain`} />
      <span className={`font-display font-bold ${s.text} gradient-gold-text tracking-tight`}>
        LoadHawk
      </span>
    </div>
  );
}
