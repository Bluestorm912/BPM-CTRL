import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useTrackPageVisit } from "@/hooks/useAnalytics";
import { RadioPlayerProvider } from "@/hooks/useRadio";
import GlobalNowPlayingBar from "@/components/GlobalNowPlayingBar";

const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Radio = lazy(() => import("./pages/Radio"));
const Shop = lazy(() => import("./pages/Shop"));
const Supporters = lazy(() => import("./pages/Supporters"));

const queryClient = new QueryClient();

const AppRoutes = () => {
  useTrackPageVisit();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/radio" element={<Radio />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/supporters" element={<Supporters />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RadioPlayerProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
          <GlobalNowPlayingBar />
        </BrowserRouter>
      </TooltipProvider>
    </RadioPlayerProvider>
  </QueryClientProvider>
);

export default App;
