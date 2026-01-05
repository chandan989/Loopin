import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import LobbyWeb3 from "./pages/LobbyWeb3";
import Game from "./pages/Game";
import FullGame from "./pages/FullGame";
import NotFound from "./pages/NotFound";
import { ENABLE_WEB3 } from "./lib/stacksConfig";

const queryClient = new QueryClient();

const App = () => {
  // Log Web3 status on startup
  console.log('🔗 Web3 Enabled:', ENABLE_WEB3);
  console.log('🎮 Contract Address:', import.meta.env.VITE_CONTRACT_ADDRESS);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/lobby" element={ENABLE_WEB3 ? <LobbyWeb3 /> : <Lobby />} />
            <Route path="/game/:sessionId" element={<FullGame />} />
            <Route path="/old-game/:sessionId" element={<Game />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
