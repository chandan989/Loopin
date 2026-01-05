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
  ChevronRight,
  Activity,
  Zap,
  ArrowUpRight
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

      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header Section */}
          <div className="mb-12 md:mb-24">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8 md:mb-12">
              <div>
                <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-4 md:mb-6 uppercase">
                  Command <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-400">Center</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 font-medium max-w-md leading-relaxed">
                  Welcome back, Runner. Your territory is waiting.
                </p>
              </div>

              <div className="bg-[#09090B] p-1.5 rounded-3xl md:rounded-full w-full md:w-auto">
                <div className="px-6 md:px-8 py-4 rounded-3xl md:rounded-full bg-[#09090B] border border-white/10 flex items-center justify-between md:justify-start gap-5 shadow-2xl">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#D4FF00] flex items-center justify-center animate-pulse shrink-0">
                      <Wallet className="w-5 h-5 md:w-6 md:h-6 text-black" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">Available Balance</div>
                      <div className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">245.3 STX</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-gray-200" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-24">
            {/* Stat 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gray-100 rounded-[24px] md:rounded-[32px] transform group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300 -z-10" />
              <div className="bg-white border border-black rounded-[24px] md:rounded-[32px] p-6 md:p-8 transition-transform duration-300 h-full flex flex-col justify-between hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#D4FF00] transition-colors duration-300">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-black" />
                  </div>
                  <span className="font-display text-4xl md:text-5xl font-black text-gray-100 group-hover:text-black/5 transition-colors">01</span>
                </div>
                <div>
                  <div className="font-display text-3xl md:text-4xl font-black mb-1">{userStats.totalArea}</div>
                  <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">Total Area</div>
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gray-100 rounded-[24px] md:rounded-[32px] transform group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300 -z-10" />
              <div className="bg-white border border-gray-200 group-hover:border-black rounded-[24px] md:rounded-[32px] p-6 md:p-8 transition-all duration-300 h-full flex flex-col justify-between hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <Activity className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="font-display text-4xl md:text-5xl font-black text-gray-100 group-hover:text-black/5 transition-colors">02</span>
                </div>
                <div>
                  <div className="font-display text-3xl md:text-4xl font-black mb-1">{userStats.gamesPlayed}</div>
                  <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">Operations</div>
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gray-100 rounded-[24px] md:rounded-[32px] transform group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300 -z-10" />
              <div className="bg-white border border-gray-200 group-hover:border-black rounded-[24px] md:rounded-[32px] p-6 md:p-8 transition-all duration-300 h-full flex flex-col justify-between hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#D4FF00] transition-colors duration-300">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-black" />
                  </div>
                  <span className="font-display text-4xl md:text-5xl font-black text-gray-100 group-hover:text-black/5 transition-colors">03</span>
                </div>
                <div>
                  <div className="font-display text-3xl md:text-4xl font-black mb-1">{userStats.gamesWon}</div>
                  <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">Victories</div>
                </div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gray-100 rounded-[24px] md:rounded-[32px] transform group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300 -z-10" />
              <div className="bg-[#09090B] border border-black rounded-[24px] md:rounded-[32px] p-6 md:p-8 transition-transform duration-300 h-full flex flex-col justify-between text-white hover:-translate-y-1 shadow-2xl">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 md:w-6 md:h-6 text-[#D4FF00]" />
                  </div>
                  <span className="font-display text-4xl md:text-5xl font-black text-white/10">04</span>
                </div>
                <div>
                  <div className="font-display text-3xl md:text-4xl font-black mb-1 text-[#D4FF00]">{userStats.totalEarnings}</div>
                  <div className="text-xs font-bold text-gray-500 tracking-widest uppercase">Earnings</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Active Sessions */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8 md:mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">Active Grids</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#D4FF00] rounded-full border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="relative flex h-2 w-2 md:h-3 md:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-black"></span>
                  </span>
                  <span className="font-display text-[10px] md:text-xs font-bold tracking-wider">LIVE: {activeSessions.length}</span>
                </div>
              </div>

              <div className="space-y-4">
                {activeSessions.map((session, idx) => (
                  <div key={session.id} className="group relative">
                    <div className="absolute inset-0 bg-black rounded-[24px] translate-y-2 translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-white border border-gray-200 group-hover:border-black rounded-[24px] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3">
                            <span className="font-display text-sm md:text-lg font-bold bg-black text-white px-3 py-1 rounded-md">{session.type}</span>
                            <div className="flex items-center gap-2 text-gray-500 text-[10px] md:text-xs font-bold tracking-widest uppercase border-l-2 border-gray-200 pl-3 md:pl-4">
                              <Users size={12} className="md:w-[14px] md:h-[14px]" /> {session.players} Runners
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-[10px] md:text-xs font-bold tracking-widest uppercase border-l-2 border-gray-200 pl-3 md:pl-4">
                              <Clock size={12} className="md:w-[14px] md:h-[14px]" /> {session.timeRemaining}
                            </div>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-3xl md:text-4xl font-black">{session.prizePool}</span>
                            <span className="text-gray-400 font-medium text-sm md:text-base">Prize Pool</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                          <div className="text-left md:text-right">
                            <div className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">ENTRY FEE</div>
                            <div className="font-display text-lg md:text-xl font-bold">{session.entryFee}</div>
                          </div>

                          <Link to={`/game/${session.id}`} className="block">
                            <Button className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#09090B] hover:bg-[#D4FF00] hover:text-black p-0 flex items-center justify-center transition-colors">
                              <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-[#D4FF00]" />
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
            <div className="mt-8 lg:mt-0">
              <div className="flex items-center justify-between mb-8 md:mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">Logs</h2>
                <Link to="/profile" className="text-xs font-bold text-gray-400 hover:text-black tracking-widest uppercase border-b border-gray-200 hover:border-black transition-colors pb-0.5">View All</Link>
              </div>

              <div className="bg-[#F8F9FA] rounded-[32px] p-6 border border-gray-100 relative overflow-hidden">
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />

                <div className="relative z-10 space-y-3">
                  {recentGames.map((game, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-black transition-colors duration-300">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">{game.date.toUpperCase()}</div>
                        <div className="font-display text-lg font-bold">{game.area}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-display text-lg font-black ${game.rank === 1 ? 'text-[#0047FF]' : 'text-gray-300'}`}>
                          #{game.rank}
                        </div>
                        {game.prize && (
                          <div className="text-[10px] font-bold text-[#D4FF00] bg-black px-1.5 py-0.5 rounded mt-1">+{game.prize}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <Link to="/leaderboard">
                    <Button className="w-full h-12 bg-white border border-black text-black hover:bg-[#D4FF00] rounded-xl justify-between font-bold text-sm shadow-sm hover:shadow-md transition-all">
                      GLOBAL RANKINGS <ChevronRight size={16} />
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button className="w-full h-12 bg-transparent border border-gray-300 text-gray-500 hover:text-black hover:border-black rounded-xl justify-between font-bold text-sm hover:bg-white transition-all">
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
