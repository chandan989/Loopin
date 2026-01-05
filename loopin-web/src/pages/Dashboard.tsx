import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  MapPin,
  Trophy,
  Clock,
  Users,
  TrendingUp,
  Play,
  ChevronRight,
  Zap,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  // Mock data
  const userStats = {
    totalArea: '2.4 km²',
    gamesPlayed: 23,
    gamesWon: 7,
    totalEarnings: '156.8 STX',
  };

  const activeSessions = [
    { id: '1', entryFee: '5 STX', players: 6, prizePool: '30 STX', timeRemaining: '12:45', type: 'BLITZ' },
    { id: '2', entryFee: '10 STX', players: 4, prizePool: '40 STX', timeRemaining: '08:22', type: 'ELITE' },
    { id: '3', entryFee: '2 STX', players: 8, prizePool: '16 STX', timeRemaining: '14:58', type: 'CASUAL' },
  ];

  const recentGames = [
    { date: 'Jan 4', area: '0.15 km²', rank: 2, prize: null },
    { date: 'Jan 3', area: '0.42 km²', rank: 1, prize: '25 STX' },
    { date: 'Jan 2', area: '0.08 km²', rank: 5, prize: null },
  ];

  return (
    <div className="min-h-screen bg-white text-[#09090B] selection:bg-[#D4FF00] selection:text-black font-sans">
      <Header />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header Section */}
          <div className="mb-16">
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-4">
              COMMAND <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">CENTER</span>
            </h1>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-8">
              <p className="text-xl text-gray-500 font-medium max-w-md">
                Welcome back, Runner. Your territory is waiting.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#09090B] text-white shadow-xl">
                  <Wallet className="w-5 h-5 text-[#D4FF00]" />
                  <span className="font-display font-bold text-lg tracking-wider">245.3 STX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - "Tactile Cards" Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {/* Stat 1 */}
            <div className="bg-[#F3F4F6] p-1 rounded-[32px] transition-transform hover:-translate-y-1 duration-300">
              <div className="bg-white rounded-[28px] p-6 h-full flex flex-col justify-between border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-display text-sm font-bold text-gray-400 tracking-widest uppercase">Total Area</span>
                  <div className="w-10 h-10 rounded-full bg-[#D4FF00]/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-black" />
                  </div>
                </div>
                <div className="font-display text-4xl font-black">{userStats.totalArea}</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#F3F4F6] p-1 rounded-[32px] transition-transform hover:-translate-y-1 duration-300">
              <div className="bg-white rounded-[28px] p-6 h-full flex flex-col justify-between border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-display text-sm font-bold text-gray-400 tracking-widest uppercase">Operations</span>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-black" />
                  </div>
                </div>
                <div className="font-display text-4xl font-black">{userStats.gamesPlayed}</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#F3F4F6] p-1 rounded-[32px] transition-transform hover:-translate-y-1 duration-300">
              <div className="bg-white rounded-[28px] p-6 h-full flex flex-col justify-between border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-display text-sm font-bold text-gray-400 tracking-widest uppercase">Victories</span>
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#D4FF00]" />
                  </div>
                </div>
                <div className="font-display text-4xl font-black">{userStats.gamesWon}</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-[#F3F4F6] p-1 rounded-[32px] transition-transform hover:-translate-y-1 duration-300">
              <div className="bg-white rounded-[28px] p-6 h-full flex flex-col justify-between border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-display text-sm font-bold text-gray-400 tracking-widest uppercase">Earnings</span>
                  <div className="w-10 h-10 rounded-full bg-[#0047FF]/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#0047FF]" />
                  </div>
                </div>
                <div className="font-display text-4xl font-black text-[#0047FF]">{userStats.totalEarnings}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Active Sessions */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Active Grids</h2>
                <div className="px-3 py-1 bg-[#D4FF00] rounded-full text-xs font-bold border border-black/10 animate-pulse">
                  LIVE: {activeSessions.length}
                </div>
              </div>

              <div className="space-y-6">
                {activeSessions.map((session) => (
                  <div key={session.id} className="group relative">
                    {/* Hover Effect Layer */}
                    <div className="absolute inset-0 bg-black rounded-[32px] translate-y-2 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                    <div className="relative bg-[#F8F9FA] rounded-[32px] p-8 border border-gray-200 group-hover:-translate-y-1 transition-transform duration-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                        {/* Info Side */}
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
                            <span className="font-display text-xs font-bold tracking-widest text-gray-400 uppercase">{session.type} PROTOCOL</span>
                          </div>
                          <div className="flex items-baseline gap-4">
                            <h3 className="font-display text-4xl font-black text-[#09090B]">{session.prizePool}</h3>
                            <span className="text-gray-500 font-medium">Prize Pool</span>
                          </div>

                          <div className="flex items-center gap-6 mt-4 text-sm font-medium text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span className="font-mono">{session.timeRemaining}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={16} />
                              <span>{session.players} Runners</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TicketIcon />
                              <span>Entry: {session.entryFee}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Side */}
                        <div>
                          <Link to={`/game/${session.id}`}>
                            <Button
                              className="h-14 px-8 rounded-full bg-[#09090B] text-white font-display font-bold text-lg hover:bg-[#D4FF00] hover:text-black transition-all shadow-lg hover:shadow-[#D4FF00]/50"
                            >
                              ENTER GRID <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Games Sidebar */}
            <div className="bg-[#09090B] rounded-[40px] p-8 text-white relative overflow-hidden">
              {/* Decorative Grid Background */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl font-bold">LOGS</h2>
                  <Link to="/profile" className="text-xs font-bold text-[#D4FF00] tracking-widest hover:underline">VIEW ALL</Link>
                </div>

                <div className="space-y-4">
                  {recentGames.map((game, index) => (
                    <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-gray-500 mb-1">{game.date.toUpperCase()}</div>
                        <div className="font-display text-xl font-bold">{game.area}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-display text-lg font-bold ${game.rank === 1 ? 'text-[#D4FF00]' : 'text-gray-400'}`}>
                          #{game.rank}
                        </div>
                        {game.prize && (
                          <div className="text-xs font-bold text-[#D4FF00] tracking-wide">+{game.prize}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 space-y-3">
                  <Link to="/leaderboard">
                    <Button className="w-full h-12 bg-transparent border border-white text-white hover:bg-white/10 rounded-xl justify-between font-bold text-sm">
                      GLOBAL RANKINGS <ChevronRight size={16} />
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button className="w-full h-12 bg-transparent border border-white text-white hover:bg-white/10 rounded-xl justify-between font-bold text-sm">
                      RUNNER SETTINGS <ChevronRight size={16} />
                    </Button>
                  </Link>
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

// Simple Ticket Icon Component for local use
const TicketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

export default Dashboard;
