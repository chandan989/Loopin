import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { userSession } from "@/lib/stacks-auth";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GamePage from "./pages/GamePage";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import HowToPlay from "./pages/HowToPlay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // CRITICAL: Handle mobile wallet redirect on app load
  useEffect(() => {
    // Check if user just came back from wallet app (mobile redirect flow)
    if (userSession.isSignInPending()) {
      console.log('[Auth] Detected pending sign-in from mobile wallet redirect...');

      userSession.handlePendingSignIn()
        .then((userData) => {
          console.log('[Auth] Mobile wallet authentication successful!', userData);

          // Store wallet address
          const walletAddress = userData.profile.stxAddress.mainnet;
          localStorage.setItem('loopin_wallet', walletAddress);

          // Clean up URL (remove auth token)
          window.history.replaceState({}, document.title, "/");

          // Reload to update UI
          window.location.reload();
        })
        .catch((error) => {
          console.error('[Auth] Error handling pending sign-in:', error);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game/:sessionId" element={<GamePage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
