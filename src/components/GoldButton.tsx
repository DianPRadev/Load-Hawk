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
    const base = "font-display tracking-wider rounded-md transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50";
    const sizes = {
      sm: "px-4 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3.5 text-lg",
    };
    const variants = {
      primary: "gradient-gold text-primary-foreground font-bold hover:brightness-110 shadow-lg",
      secondary: "border border-border-strong bg-transparent text-foreground hover:bg-card-elevated",
      ghost: "text-muted-foreground hover:text-foreground hover:bg-card",
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
            <Loader2 className="animate-spin" size={16} />
            {loadingText || "Loading..."}
          </>
        ) : children}
      </button>
    );
  }
);
GoldButton.displayName = "GoldButton";
