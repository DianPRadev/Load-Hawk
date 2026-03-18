import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center glass-panel rounded-2xl p-12 max-w-md w-full window-chrome animate-fade-up">
        <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
          <MapPin size={28} className="text-primary-foreground" />
        </div>
        <h1 className="font-display text-6xl gradient-gold-text mb-3">404</h1>
        <p className="text-muted-foreground text-[14px] mb-6">
          This route doesn't exist. Looks like you took a wrong turn.
        </p>
        <GoldButton onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </GoldButton>
      </div>
    </div>
  );
};

export default NotFound;
