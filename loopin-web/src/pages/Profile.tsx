import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Wallet,
  Copy,
  Check,
  MapPin,
  Trophy,
  TrendingUp,
  Settings,
  LogOut,
  Zap,
  Shield,
  Activity
} from 'lucide-react';

const Profile = () => {
  const [copied, setCopied] = React.useState(false);

  // Mock user data
  const user = {
    username: 'SPEEDRUNNER',
    walletAddress: 'ST1PQHQKBV3YX530PXHXSMXE7SXQ8D5X8AKQNMQM',
    balance: '245.3',
    joinedDate: 'DEC 2025',
  };

  const stats = {
    totalArea: '2.4 km²',
    gamesPlayed: 23,
    gamesWon: 7,
    winRate: '30%',
    totalEarnings: '156.8 STX',
    longestTrail: '4.2 km',
    biggestLoop: '0.15 km²',
    currentStreak: 2,
  };

  const recentGames = [
    { id: 1, date: 'Jan 4, 2026', area: '0.15 km²', rank: 2, players: 6, prize: null },
    { id: 2, date: 'Jan 3, 2026', area: '0.42 km²', rank: 1, players: 8, prize: '25 STX' },
    { id: 3, date: 'Jan 2, 2026', area: '0.08 km²', rank: 5, players: 5, prize: null },
    { id: 4, date: 'Jan 1, 2026', area: '0.22 km²', rank: 3, players: 7, prize: null },
    { id: 5, date: 'Dec 31, 2025', area: '0.31 km²', rank: 1, players: 4, prize: '18 STX' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-white text-[#09090B] selection:bg-[#D4FF00] selection:text-black">
      <Header />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">

            {/* 1. PROFILE HEADER */}
            <div className="flex flex-col md:flex-row gap-12 items-start mb-24">

              {/* Avatar Section */}
              <div className="relative group mx-auto md:mx-0">
                <div className="w-32 h-32 md:w-48 md:h-48 bg-[#09090B] rounded-full flex items-center justify-center border-[6px] md:border-[8px] border-[#D4FF00] shadow-[0_0_40px_rgba(212,255,0,0.3)]">
                  <span className="font-display text-6xl md:text-8xl font-black text-white">
                    {user.username.charAt(0)}
                  </span>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-gray-200 shadow-lg text-xs font-bold tracking-widest uppercase whitespace-nowrap">
                  Level 12 Runner
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-6 w-full text-center md:text-left">
                <div>
                  <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-4 break-words">
                    {user.username}
                  </h1>
                  <div className="flex flex-col md:flex-row gap-4 md:items-center justify-center md:justify-start">
                    <button
                      onClick={handleCopy}
                      className="group flex items-center justify-center md:justify-start space-x-3 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full pl-6 pr-4 py-3 transition-all w-full md:w-auto"
                    >
                      <Wallet size={20} className="text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
                      <span className="font-mono text-base md:text-lg font-bold text-gray-500 group-hover:text-black transition-colors truncate">
                        {truncateAddress(user.walletAddress)}
                      </span>
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        {copied ? <Check size={14} className="text-[#00C853]" /> : <Copy size={14} className="text-black" />}
                      </div>
                    </button>

                    <span className="text-gray-400 font-bold tracking-widest text-sm md:text-base">
                      JOINED {user.joinedDate}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 border-black text-black font-display font-bold text-lg hover:bg-black hover:text-white transition-all w-full md:w-auto">
                    <Settings className="w-5 h-5 mr-2" />
                    SETTINGS
                  </Button>
                  <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full text-red-500 font-display font-bold text-lg hover:bg-red-50 hover:text-red-600 w-full md:w-auto">
                    <LogOut className="w-5 h-5 mr-2" />
                    DISCONNECT
                  </Button>
                </div>
              </div>

              {/* Balance Card - Floating style */}
              <div className="w-full md:w-auto p-6 md:p-8 bg-[#09090B] text-white rounded-[32px] md:min-w-[300px] shadow-2xl relative overflow-hidden mt-6 md:mt-0">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Wallet size={120} className="text-[#D4FF00]" />
                </div>
                <div className="relative z-10">
                  <p className="text-gray-400 font-bold tracking-widest text-sm mb-2">TOTAL BALANCE</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl md:text-6xl font-black text-[#D4FF00] tracking-tighter">
                      {user.balance}
                    </span>
                    <span className="font-bold text-xl text-white">STX</span>
                  </div>
                  <div className="w-full h-px bg-white/10 my-6" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Lifetime Earnings</span>
                    <span className="font-mono text-[#D4FF00]">{stats.totalEarnings}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. STATS GRID */}
            <div className="mb-24">
              <div className="flex items-end gap-4 mb-12">
                <h2 className="font-display text-3xl md:text-5xl font-black tracking-tighter">PERFORMANCE</h2>
                <div className="h-1 flex-1 bg-[#F3F4F6] mb-4 rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Stat 1 */}
                <div className="p-6 md:p-8 bg-[#F3F4F6] rounded-[32px] hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-gray-500 font-bold text-sm tracking-widest mb-2">TOTAL AREA</p>
                  <p className="font-display text-3xl md:text-4xl font-black">{stats.totalArea}</p>
                </div>

                {/* Stat 2 */}
                <div className="p-6 md:p-8 bg-[#D4FF00] rounded-[32px] hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Trophy className="w-6 h-6 text-[#D4FF00]" />
                  </div>
                  <p className="text-black/60 font-bold text-sm tracking-widest mb-2">GAMES WON</p>
                  <p className="font-display text-3xl md:text-4xl font-black text-black">{stats.gamesWon}</p>
                </div>

                {/* Stat 3 */}
                <div className="p-6 md:p-8 bg-[#F3F4F6] rounded-[32px] hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Activity className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-gray-500 font-bold text-sm tracking-widest mb-2">WIN RATE</p>
                  <p className="font-display text-3xl md:text-4xl font-black">{stats.winRate}</p>
                </div>

                {/* Stat 4 */}
                <div className="p-6 md:p-8 bg-black text-white rounded-[32px] hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-[#D4FF00]" />
                  </div>
                  <p className="text-gray-400 font-bold text-sm tracking-widest mb-2">STREAK</p>
                  <p className="font-display text-3xl md:text-4xl font-black text-[#D4FF00]">{stats.currentStreak} <span className="text-lg md:text-xl text-gray-500">WINS</span></p>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'GAMES PLAYED', value: stats.gamesPlayed },
                  { label: 'LONGEST TRAIL', value: stats.longestTrail },
                  { label: 'BIGGEST LOOP', value: stats.biggestLoop },
                  { label: 'RANK', value: '#142' }
                ].map((stat, i) => (
                  <div key={i} className="p-6 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold text-gray-400 tracking-widest mb-1">{stat.label}</p>
                    <p className="font-display text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. GAME HISTORY */}
            <div>
              <div className="flex items-end gap-4 mb-12">
                <h2 className="font-display text-3xl md:text-5xl font-black tracking-tighter">HISTORY</h2>
                <div className="h-1 flex-1 bg-[#F3F4F6] mb-4 rounded-full" />
              </div>

              <div className="border border-gray-200 rounded-[32px] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-[#F8F9FA] text-xs font-black tracking-widest text-gray-400 uppercase hidden md:grid">
                  <div className="col-span-3">Date</div>
                  <div className="col-span-2 text-right">Area</div>
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-2 text-center">Players</div>
                  <div className="col-span-3 text-right">Prize</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {recentGames.map((game) => (
                    <div
                      key={game.id}
                      className="grid grid-cols-2 md:grid-cols-12 gap-4 px-4 py-4 md:px-8 md:py-6 items-center hover:bg-gray-50 transition-colors group"
                    >
                      <div className="col-span-2 md:col-span-3">
                        <div className="font-display text-lg font-bold">{game.date}</div>
                        <div className="text-xs text-gray-400 md:hidden">Details below</div>
                      </div>

                      <div className="col-span-1 md:col-span-2 md:text-right">
                        <span className="md:hidden text-xs text-gray-400 uppercase mr-2">Area:</span>
                        <span className="font-mono font-medium">{game.area}</span>
                      </div>

                      <div className={`col-span-1 md:col-span-2 md:text-center text-right ${game.rank === 1 ? 'text-[#00C853]' : ''}`}>
                        <span className="md:hidden text-xs text-gray-400 uppercase mr-2">Rank:</span>
                        <span className="font-display text-xl font-black">#{game.rank}</span>
                      </div>

                      <div className="hidden md:block col-span-2 text-center text-gray-400 font-mono">
                        {game.players}
                      </div>

                      <div className="col-span-2 md:col-span-3 text-right">
                        {game.prize ? (
                          <span className="inline-flex items-center px-3 py-1 bg-[#D4FF00]/20 text-black/80 rounded-full font-bold text-sm">
                            +{game.prize}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

