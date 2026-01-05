import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Zap, Shield, ChevronRight } from 'lucide-react';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = React.useState<'all-time' | 'weekly' | 'session'>('all-time');

  // Mock data
  const leaderboardData = [
    { rank: 1, player: 'ST1PQHQK...V3JP', area: '45.2 km²', gamesWon: 34, earnings: '1,250 STX' },
    { rank: 2, player: 'ST2BQ4K...M8NP', area: '38.7 km²', gamesWon: 28, earnings: '980 STX' },
    { rank: 3, player: 'ST3CRV5...Q2LK', area: '32.1 km²', gamesWon: 22, earnings: '720 STX' },
    { rank: 4, player: 'ST4DZX8...N5RJ', area: '28.4 km²', gamesWon: 19, earnings: '540 STX' },
    { rank: 5, player: 'ST5EYW9...P3TH', area: '24.8 km²', gamesWon: 16, earnings: '380 STX' },
    { rank: 6, player: 'ST6FUV1...K7WM', area: '21.3 km²', gamesWon: 14, earnings: '290 STX' },
    { rank: 7, player: 'ST7GTR2...J9XL', area: '18.9 km²', gamesWon: 12, earnings: '220 STX' },
    { rank: 8, player: 'ST8HSQ3...H2YK', area: '16.5 km²', gamesWon: 10, earnings: '180 STX' },
    { rank: 9, player: 'ST9IPP4...G5ZJ', area: '14.2 km²', gamesWon: 8, earnings: '140 STX' },
    { rank: 10, player: 'ST0JON5...F8AI', area: '12.8 km²', gamesWon: 7, earnings: '110 STX' },
  ];

  return (
    <div className="min-h-screen bg-white text-[#09090B] selection:bg-[#D4FF00] selection:text-black">
      <Header />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Hero Section */}
          <div className="mb-16 md:mb-24">
            <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-400">Rankings</span>
            </h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <p className="text-lg text-gray-500 max-w-md leading-relaxed">
                The elite tier of the Loopin network.
                Top territory holders earning meaningful yield.
              </p>

              {/* Tabs */}
              <div className="flex bg-[#F3F4F6] p-1 rounded-full">
                {(['all-time', 'weekly', 'session'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 py-2 rounded-full font-display font-bold text-sm tracking-wide transition-all uppercase",
                      activeTab === tab
                        ? "bg-[#09090B] text-[#D4FF00] shadow-lg"
                        : "text-gray-400 hover:text-black"
                    )}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Podium Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 items-end">
            {/* 2nd Place */}
            <div className="order-2 md:order-1 relative group">
              <div className="absolute -top-12 -left-4 font-display text-[100px] font-bold text-gray-100 select-none -z-10">2</div>
              <div className="bg-white border border-gray-200 rounded-[32px] p-8 h-[320px] flex flex-col items-center justify-between text-center shadow-lg relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Medal className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-2 truncate max-w-[150px] mx-auto">{leaderboardData[1].player}</div>
                  <div className="font-display text-4xl font-bold mb-1">{leaderboardData[1].area}</div>
                  <div className="font-bold text-gray-400 text-sm">CAPTURED</div>
                </div>
                <div className="w-full pt-4 border-t border-gray-100">
                  <div className="font-display text-xl font-bold text-[#09090B]">{leaderboardData[1].earnings}</div>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="order-1 md:order-2 relative group">
              <div className="absolute -top-16 -left-4 font-display text-[120px] font-bold text-[#D4FF00]/20 select-none -z-10">1</div>
              <div className="bg-[#09090B] border border-black rounded-[32px] p-8 h-[380px] flex flex-col items-center justify-between text-center shadow-2xl relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4FF00]" />
                <div className="w-24 h-24 rounded-full bg-[#D4FF00] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,255,0,0.3)]">
                  <Trophy className="w-10 h-10 text-black" />
                </div>
                <div>
                  <div className="font-mono text-xs text-[#D4FF00] mb-2 truncate max-w-[150px] mx-auto">{leaderboardData[0].player}</div>
                  <div className="font-display text-5xl font-bold text-white mb-2">{leaderboardData[0].area}</div>
                  <div className="font-bold text-gray-500 text-sm tracking-widest">DOMINANCE LEADER</div>
                </div>
                <div className="w-full pt-6 border-t border-white/10">
                  <div className="font-display text-3xl font-bold text-[#D4FF00]">{leaderboardData[0].earnings}</div>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 md:order-3 relative group">
              <div className="absolute -top-12 -left-4 font-display text-[100px] font-bold text-gray-100 select-none -z-10">3</div>
              <div className="bg-white border border-gray-200 rounded-[32px] p-8 h-[280px] flex flex-col items-center justify-between text-center shadow-lg relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-2 truncate max-w-[150px] mx-auto">{leaderboardData[2].player}</div>
                  <div className="font-display text-3xl font-bold mb-1">{leaderboardData[2].area}</div>
                  <div className="font-bold text-gray-400 text-sm">CAPTURED</div>
                </div>
                <div className="w-full pt-4 border-t border-gray-100">
                  <div className="font-display text-xl font-bold text-[#09090B]">{leaderboardData[2].earnings}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold uppercase">Runners List</h2>
              <div className="h-1 flex-1 mx-8 bg-gray-100 rounded-full" />
              <div className="text-xs font-bold text-gray-400 tracking-widest">TOP 100 LISTED</div>
            </div>

            <div className="space-y-4">
              {leaderboardData.slice(3).map((entry, index) => (
                <div
                  key={entry.rank}
                  className="group relative bg-white border border-gray-100 hover:border-black rounded-2xl p-4 md:p-6 flex items-center transition-all duration-300 hover:shadow-xl"
                >
                  <div className="font-display text-2xl font-bold text-gray-300 w-12 group-hover:text-black transition-colors">
                    {entry.rank}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        <Zap size={16} className="text-gray-400 group-hover:text-[#D4FF00] transition-colors" />
                      </div>
                      <span className="font-mono text-sm text-gray-600 font-medium">{entry.player}</span>
                    </div>

                    <div className="flex flex-col md:items-center">
                      <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Territory</span>
                      <span className="font-display text-xl font-bold">{entry.area}</span>
                    </div>

                    <div className="flex flex-col md:items-end">
                      <span className="text-xs font-bold text-[#D4FF00] bg-black px-2 py-0.5 rounded tracking-widest uppercase mb-1">Yield</span>
                      <span className="font-display text-xl font-bold">{entry.earnings}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex w-12 justify-end">
                    <ChevronRight className="text-gray-300 group-hover:text-black transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" className="font-display font-bold rounded-full px-8 border-gray-200 hover:bg-black hover:text-[#D4FF00] transition-colors">
                LOAD MORE RUNNERS
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
