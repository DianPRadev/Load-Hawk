export function LoadHawkLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-10",
    md: "h-16",
    lg: "h-24",
  };
  return (
    <div className="flex items-center justify-center">
      <img src="/loadhawk-logo.png" alt="LoadHawk" className={`${sizes[size]} object-contain`} width={120} height={48} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    </div>
  );
}
