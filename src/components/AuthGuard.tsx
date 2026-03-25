import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { useAuthModal } from "@/store/AuthModalContext";
import { useEffect } from "react";
import { PageLoader } from "@/components/Skeleton";

export function AuthGuard() {
  const { user, loading } = useAuth();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal("login");
    }
  }, [loading, user, openAuthModal]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
