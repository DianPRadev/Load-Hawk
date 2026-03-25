import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { GoldButton } from "@/components/GoldButton";
import { PageMeta } from "@/components/PageMeta";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <PageMeta title="Page Not Found" />
      <div className="text-center bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-12 max-w-md w-full animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <MapPin size={28} className="text-muted-foreground" />
        </div>
        <h1 className="font-display text-6xl text-muted-foreground mb-3">404</h1>
        <p className="text-muted-foreground text-[14px] mb-6">
          This route doesn't exist. Looks like you took a wrong turn.
        </p>
        <GoldButton onClick={() => navigate("/")}>
          Back to Home
        </GoldButton>
      </div>
    </div>
  );
};

export default NotFound;
