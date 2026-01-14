import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api, Game } from '@/lib/api';

// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsOverview from '@/components/dashboard/StatsOverview';
import DashboardActionGrid from '@/components/dashboard/DashboardActionGrid';
import ActiveSessionsList from '@/components/dashboard/ActiveSessionsList';
import RecentActivitySidebar from '@/components/dashboard/RecentActivitySidebar';

const Dashboard = () => {
  // Real Data State
  const [activeSessions, setActiveSessions] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress] = useState(localStorage.getItem('loopin_wallet') || "mock_wallet_address_123");
  const [currentBalance, setCurrentBalance] = useState(245.3);

  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const games = await api.getLobby();
        setActiveSessions(games);
      } catch (e) {
        console.error("Failed to load lobby", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLobby();
  }, []);

  // Mock data for user stats (still mock for now as requested API was only lobby)
  const userStats = {
    totalArea: '2.4 km²',
    gamesPlayed: 23,
    gamesWon: 7,
    totalEarnings: '156.8 STX',
  };

  const recentGames = [
    { date: 'Jan 4', area: '0.15 km²', rank: 2, prize: null },
    { date: 'Jan 3', area: '0.42 km²', rank: 1, prize: '25 STX' },
    { date: 'Jan 2', area: '0.08 km²', rank: 5, prize: null },
  ];

  return (
    <div className="min-h-screen bg-white text-[#09090B] selection:bg-[#D4FF00] selection:text-black font-sans">
      <Header />

      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">

          <DashboardHeader currentBalance={currentBalance} />

          <StatsOverview stats={userStats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Main Content Area: Actions & Active Games */}
            <div className="lg:col-span-2 space-y-8">

              <DashboardActionGrid
                walletAddress={walletAddress}
                currentBalance={currentBalance}
                onBalanceUpdate={(newBalance) => setCurrentBalance(newBalance)}
                onRewardClaimed={(amount) => setCurrentBalance(prev => prev + amount)}
              />

              <ActiveSessionsList activeSessions={activeSessions} />

            </div>

            {/* Sidebar: Recent Activity */}
            <RecentActivitySidebar recentGames={recentGames} />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
