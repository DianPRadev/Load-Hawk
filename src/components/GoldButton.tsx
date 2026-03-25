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
    const base = "font-display tracking-normal rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none min-w-[120px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
    const sizes = {
      sm: "px-4 py-1.5 text-[12px]",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3 text-base",
    };
    const variants = {
      primary: "gradient-gold text-primary-foreground font-bold hover:brightness-110 shadow-[0_2px_8px_hsla(38,91%,54%,0.25)] hover:shadow-[0_4px_16px_hsla(38,91%,54%,0.35)]",
      secondary: "border border-border bg-muted text-foreground hover:bg-accent",
      ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
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
