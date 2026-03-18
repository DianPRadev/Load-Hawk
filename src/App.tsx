import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/store/AuthContext";
import { AuthModalProvider } from "@/store/AuthModalContext";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthModal } from "@/components/AuthModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const FindLoadsPage = lazy(() => import("./pages/FindLoadsPage"));
const MyLoadsPage = lazy(() => import("./pages/MyLoadsPage"));
const AINegotiatorPage = lazy(() => import("./pages/AINegotiatorPage"));
const EarningsPage = lazy(() => import("./pages/EarningsPage"));
const BrokerRatingsPage = lazy(() => import("./pages/BrokerRatingsPage"));
const FleetPage = lazy(() => import("./pages/FleetPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthModalProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthModal />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                {/* Public pages */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/find-loads" element={<FindLoadsPage />} />
                  <Route path="/broker-ratings" element={<BrokerRatingsPage />} />
                </Route>
                {/* Protected pages */}
                <Route element={<AuthGuard />}>
                  <Route element={<AppLayout />}>
                    <Route path="/my-loads" element={<MyLoadsPage />} />
                    <Route path="/ai-negotiator" element={<AINegotiatorPage />} />
                    <Route path="/earnings" element={<EarningsPage />} />
                    <Route path="/fleet" element={<FleetPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
        </AuthModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </ErrorBoundary>
);

export default App;
