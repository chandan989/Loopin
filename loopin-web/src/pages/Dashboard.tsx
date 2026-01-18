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
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [userStats, setUserStats] = useState({
    totalArea: '0 km²',
    gamesPlayed: 0,
    gamesWon: 0,
    totalEarnings: '0 STX',
  });
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [recentGames, setRecentGames] = useState<any[]>([]);

  // Navigate fallback
  const navigate = (path: string) => { window.location.href = path };

  // Fetch real wallet address and balance
  useEffect(() => {
    const wallet = localStorage.getItem('loopin_wallet');
    const playerId = localStorage.getItem('playerId');

    setWalletAddress(wallet);

    if (!playerId) {
      if (wallet) {
        api.authenticate(wallet).then(p => {
          localStorage.setItem('playerId', p.id);
          // Continue...
        }).catch(() => {
          navigate('/register');
        });
      } else {
        navigate('/register');
      }
      return;
    }

    if (wallet) {
      // Fetch real balance
      import('@/lib/stacks-utils').then(({ getSTXBalance }) => {
        getSTXBalance(wallet).then(balanceData => {
          setCurrentBalance(balanceData.total);
        });
      });

      // Fetch player stats & inventory
      api.getPlayer(wallet).then(response => {
        if (response) {
          setUserStats({
            totalArea: `${(response.stats?.total_area || 0).toFixed(2)} km²`,
            gamesPlayed: response.stats?.games_played || 0,
            gamesWon: response.stats?.games_won || 0,
            totalEarnings: `${(response.stats?.total_earnings || 0).toFixed(1)} STX`,
          });
          setInventory(response.inventory || {});
        }
      }).catch(err => {
        console.log('[Dashboard] Player not registered yet', err);
      });
    }
  }, []);

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
                walletAddress={walletAddress || ''}
                currentBalance={currentBalance}
                onBalanceUpdate={(newBalance) => setCurrentBalance(newBalance)}
                onRewardClaimed={(amount) => setCurrentBalance(prev => prev + amount)}
                inventory={inventory}
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
