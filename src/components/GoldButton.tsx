import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = "primary", loading, loadingText, size = "md", children, disabled, ...props }, ref) => {
    const base = "font-display tracking-normal rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none";
    const sizes = {
      sm: "px-4 py-1.5 text-[12px]",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3 text-base",
    };
    const variants = {
      primary: "gradient-gold text-primary-foreground font-bold hover:brightness-110 shadow-[0_2px_8px_hsla(38,91%,54%,0.25)] hover:shadow-[0_4px_16px_hsla(38,91%,54%,0.35)]",
      secondary: "border border-[var(--glass-input-border)] bg-[var(--glass-input-bg)] text-foreground hover:bg-[var(--glass-active)] backdrop-blur-sm",
      ghost: "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-hover)]",
    };
    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={14} />
            {loadingText || "Loading..."}
          </>
        ) : children}
      </button>
    );
  }
);
GoldButton.displayName = "GoldButton";
