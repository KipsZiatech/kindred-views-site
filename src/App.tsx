import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { OneSignalSetup } from "@/components/OneSignalSetup";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Homepage from "./components/Homepage";
import LoanEligibilityForm from "./components/LoanEligibilityForm";
import Payment from "./pages/Payment";
import ProcessingFeePayment from "./pages/ProcessingFeePayment";
import LoanDisbursementSuccessPage from "./pages/LoanDisbursementSuccessPage";
import Savings from "./pages/Savings";
import { AuthProvider } from "./components/AuthWrapper";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first-ever visit
    return !localStorage.getItem('splashShown');
  });

  const handleSplashComplete = () => {
    localStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ServiceWorkerRegistration />
          <OneSignalSetup />
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/apply" element={<LoanEligibilityForm />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/processing-fee-payment" element={<ProcessingFeePayment />} />
              <Route path="/loan-disbursement-success" element={<LoanDisbursementSuccessPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
