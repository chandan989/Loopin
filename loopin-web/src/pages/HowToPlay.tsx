
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DesignCard from '@/components/landing/DesignCard';
import {
  Wallet,
  MapPin,
  Crosshair,
  Shield,
  Eye,
  Trophy,
  ChevronDown,
  ChevronUp,
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const HowToPlay = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const faqs = [
    {
      question: 'How is territory calculated?',
      answer: 'Territory is calculated by the area enclosed when you close a loop. The more loops you close and the bigger they are, the more territory you capture. Overlapping areas count only once.',
    },
    {
      question: 'What happens if my trail gets severed?',
      answer: 'If another player crosses your open trail, it gets severed from that point. You lose any unclosed loop progress and must start a new trail from your current position.',
    },
    {
      question: 'How long do game sessions last?',
      answer: 'Standard game sessions last 15 minutes. Special events may have different durations. The timer is displayed on the HUD.',
    },
    {
      question: 'What are STX nodes / beacons?',
      answer: 'STX beacons appear randomly. Running through a beacon adds bonus STX to your potential winnings, even if you don\'t win the session.',
    },
    {
      question: 'Is GPS required at all times?',
      answer: 'Yes. We recommend playing in open areas. Indoor or underground play is not supported due to GPS signal loss.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#09090B] selection:bg-[#D4FF00] selection:text-black">
      <Header />

      {/* 1. HERO: The Protocol */}
      <main className="pt-32 pb-16">
        <div className="px-6 mb-8 text-center md:px-24 md:mb-12 max-w-7xl mx-auto">
          <div className="inline-block px-4 py-1 rounded-full border border-black/10 bg-gray-50 text-gray-500 font-display text-xs font-bold tracking-widest mb-6">
            OPERATIONAL MANUAL v1.0
          </div>
          <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            MASTER THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4FF00] to-black">GRID</span>
          </h1>
          <p className="text-lg text-gray-500 md:max-w-xl mx-auto leading-relaxed">
            Loopin is not just running. It is a high-speed territory control protocol.
            Learn the rules. Control the map. Secure the bag.
          </p>
        </div>
      </main>

      {/* 2. CORE MECHANICS: The Tactile Steps */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative Track Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-100 hidden md:block" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {/* Step 1: Connect */}
            <div className="relative group">
              <div className="absolute -top-12 -left-4 font-display text-[120px] font-bold text-gray-50 transition-colors group-hover:text-[#0047FF]/5 select-none z-0">
                1
              </div>
              <div className="relative z-10 bg-[#F3F4F6] p-1 rounded-[40px] transition-transform duration-300 group-hover:-translate-y-2 h-full">
                <div className="bg-white rounded-[36px] p-8 border border-gray-200 h-full flex flex-col relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-[#0047FF] flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
                    <Wallet size={24} className="text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">Connect & Load</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">
                    Link your Hiro Wallet. You need STX to pay entry fees and buy power-ups.
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <div className="font-bold text-[#0047FF] text-sm tracking-wide">REQUIRED: 1 STX</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Run & Loop */}
            <div className="relative group md:mt-12">
              <div className="absolute -top-12 -left-4 font-display text-[120px] font-bold text-gray-50 transition-colors group-hover:text-[#D4FF00]/10 select-none z-0">
                2
              </div>
              <div className="relative z-10 bg-[#F3F4F6] p-1 rounded-[40px] transition-transform duration-300 group-hover:-translate-y-2 h-full">
                <div className="bg-white rounded-[36px] p-8 border border-gray-200 h-full flex flex-col relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-[#D4FF00] flex items-center justify-center mb-6 shadow-xl shadow-lime-200 border-4 border-white">
                    <MapPin size={24} className="text-black" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">Run & Loop</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">
                    Move physically. Close loops to capture territory. The bigger the loop, the more you own.
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <span className="font-display text-2xl font-bold text-black">1km² = 100 PTS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Win */}
            <div className="relative group md:mt-24">
              <div className="absolute -top-12 -left-4 font-display text-[120px] font-bold text-gray-50 transition-colors group-hover:text-[#09090B]/5 select-none z-0">
                3
              </div>
              <div className="relative z-10 bg-[#F3F4F6] p-1 rounded-[40px] transition-transform duration-300 group-hover:-translate-y-2 h-full">
                <div className="bg-white rounded-[36px] p-8 border border-gray-200 h-full flex flex-col relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-[#09090B] flex items-center justify-center mb-6 shadow-2xl">
                    <Trophy size={24} className="text-[#D4FF00]" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">Dominate</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">
                    When the 15-minute timer ends, the player with the most territory takes the pot.
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">Winner Takes All</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TACTICS & ARSENAL */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 uppercase">Tactical Arsenal</h2>
            <div className="h-1 w-24 bg-[#09090B]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <DesignCard title="Defensive Shield" subtitle="Protects your trail from being severed by enemies. Auto-deploys on contact.">
              <div className="mt-4 flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
                <Shield className="text-[#0047FF]" size={32} />
                <span className="font-display text-xl font-bold text-[#0047FF]">2 STX</span>
              </div>
            </DesignCard>

            <DesignCard title="Ghost Mode" subtitle="Become invisible on the map for 60 seconds. Perfect for sneak attacks.">
              <div className="mt-4 flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
                <Eye className="text-gray-600" size={32} />
                <span className="font-display text-xl font-bold text-gray-600">5 STX</span>
              </div>
            </DesignCard>

            <DesignCard title="Severing Trails" subtitle="Run across an enemy's active trail to cut it. They lose all un-looped progress.">
              <div className="mt-4 flex items-center space-x-2 text-[#FF2E00] font-bold font-display text-sm tracking-widest">
                <Crosshair size={16} /> <span>OFFENSIVE MOVE</span>
              </div>
            </DesignCard>

            <DesignCard title="STX Beacons" subtitle="Random high-value nodes that drop cash instantly when collected.">
              <div className="mt-4 flex items-center space-x-2 text-[#D4FF00] font-bold font-display text-sm tracking-widest bg-black inline-block px-3 py-1 rounded">
                <Zap size={16} /> <span>BONUS DROPS</span>
              </div>
            </DesignCard>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="font-display text-3xl font-bold mb-12 text-center">SYSTEM FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group border border-gray-200 rounded-2xl overflow-hidden hover:border-black transition-colors"
              >
                <button
                  className="w-full p-6 flex items-center justify-between text-left bg-white"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-display text-lg font-bold pr-8">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0 text-black" />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MISSION CONTROL (CTA) */}
      <section className="py-32 bg-[#09090B] text-white relative overflow-hidden border-t-4 border-[#D4FF00]">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="mb-12">
            <h2 className="font-display text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
              READY TO <span className="text-[#D4FF00]">RUN?</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              The grid is waiting. The prize pool is live.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Button
              variant="default"
              size="xl"
              className="h-20 px-12 text-xl bg-[#D4FF00] text-black hover:bg-[#b8dd00] font-display font-bold rounded-full shadow-[0_0_40px_rgba(212,255,0,0.3)] transition-transform hover:scale-105"
            >
              CONNECT WALLET
            </Button>
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="xl"
                className="h-20 px-12 text-xl border-white/20 text-white hover:bg-white/10 font-display font-bold rounded-full"
              >
                BROWSE SESSIONS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowToPlay;
