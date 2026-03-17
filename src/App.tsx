import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AppProvider } from "@/store/AppContext";
import { AuthProvider } from "@/store/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const FindLoadsPage = lazy(() => import("./pages/FindLoadsPage"));
const MyLoadsPage = lazy(() => import("./pages/MyLoadsPage"));
const AINegotiatorPage = lazy(() => import("./pages/AINegotiatorPage"));
const EarningsPage = lazy(() => import("./pages/EarningsPage"));
const BrokerRatingsPage = lazy(() => import("./pages/BrokerRatingsPage"));
const FleetPage = lazy(() => import("./pages/FleetPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
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
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/login" element={<LoginPage />} />
                  {/* Public pages — viewable without login */}
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/find-loads" element={<FindLoadsPage />} />
                    <Route path="/broker-ratings" element={<BrokerRatingsPage />} />
                  </Route>
                  {/* Protected pages — require login */}
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
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
