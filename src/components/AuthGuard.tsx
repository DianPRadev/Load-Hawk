import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { useAuthModal } from "@/store/AuthModalContext";
import { useEffect } from "react";

export function AuthGuard() {
  const { user, loading } = useAuth();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal("login");
    }
  }, [loading, user, openAuthModal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
