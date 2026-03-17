import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import FindLoadsPage from "./pages/FindLoadsPage";
import MyLoadsPage from "./pages/MyLoadsPage";
import AINegotiatorPage from "./pages/AINegotiatorPage";
import EarningsPage from "./pages/EarningsPage";
import BrokerRatingsPage from "./pages/BrokerRatingsPage";
import FleetPage from "./pages/FleetPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/find-loads" element={<FindLoadsPage />} />
            <Route path="/my-loads" element={<MyLoadsPage />} />
            <Route path="/ai-negotiator" element={<AINegotiatorPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/broker-ratings" element={<BrokerRatingsPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
