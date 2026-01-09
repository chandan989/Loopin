
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AppSimulation from '@/components/landing/AppSimulation';
import DesignCard from '@/components/landing/DesignCard';
import {
  Zap,
  Wallet,
  ChevronRight,
  Shield,
  Trophy,
  Users,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { SlideUp, StaggerContainer, ScaleIn } from '@/components/animation/MotionWrapper';

const Index = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingText, setLoadingText] = React.useState('INITIALIZING GRID PROTOCOL...');

  React.useEffect(() => {
    const timer1 = setTimeout(() => setLoadingText('ESTABLISHING SATELLITE LINK...'), 800);
    const timer2 = setTimeout(() => setLoadingText('CALIBRATING SENSORS...'), 1600);
    const timer3 = setTimeout(() => setIsLoading(false), 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#09090B] z-50 flex flex-col items-center justify-center font-display">
        <div className="w-64 space-y-4">
          <div className="flex justify-between items-end border-b-2 border-[#D4FF00] pb-2 mb-4">
            <span className="text-[#D4FF00] text-xl font-bold tracking-widest">SYSTEM BOOT</span>
            <span className="text-white text-xs animate-pulse">v2.0.4</span>
          </div>

          <div className="font-mono text-sm text-gray-400 h-6">
            {'>'} {loadingText}
          </div>

          <div className="w-full bg-white/10 h-1 mt-8 overflow-hidden">
            <div className="h-full bg-[#D4FF00] animate-[loading_2.4s_ease-in-out_forwards]" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#09090B] selection:bg-[#D4FF00] selection:text-black animate-in fade-in duration-700">
      <Header />

      {/* Hero Section */}
      <main className="pt-32 pb-16">
        <div className="px-6 mb-8 text-center md:text-left md:px-24 md:mb-12 max-w-7xl mx-auto">
          <SlideUp delay={0.2}>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
              WHERE REALITY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">BECOMES TERRITORY</span>
            </h1>
          </SlideUp>
          <SlideUp delay={0.4}>
            <p className="text-lg text-gray-500 md:max-w-md leading-relaxed">
              You are a <span className="text-black font-bold">Grid Runner</span>—manifesting digital constructs in physical space through pure movement.
              Your body is the interface. Your path is the code. Your goal: capture more territory than anyone else to win the prize.
            </p>
          </SlideUp>
        </div>

        {/* The Live Demo Component */}
        <div className="w-full max-w-md mx-auto md:max-w-7xl md:grid md:grid-cols-2 md:gap-12 md:px-24 items-center">
          <ScaleIn delay={0.6} className="relative shadow-2xl rounded-[40px] overflow-hidden border-8 border-black mx-auto md:mx-0 bg-black aspect-[9/19.5] md:aspect-[9/19] h-[80vh] max-h-[850px]">
            <AppSimulation />
          </ScaleIn>

          {/* Desktop Feature List */}
          <div className="hidden md:block space-y-12 pl-12">
            <StaggerContainer staggerChildren={0.2} delay={0.8}>
              <SlideUp className="space-y-4">
                <div className="w-12 h-12 bg-[#D4FF00] rounded-full flex items-center justify-center mb-4">
                  <Zap size={24} strokeWidth={3} className="text-black" />
                </div>
                <h3 className="font-display text-3xl font-bold">Real-Time Trail Warfare</h3>
                <p className="text-gray-500 leading-relaxed text-lg">
                  Watch your <span className="text-black font-bold">Quantum Trail</span> materialize in real-time as you move.
                  See opponents closing in. Spot opportunities to sever their loops.
                  Every second counts when territory equals victory.
                </p>
              </SlideUp>

              <SlideUp className="space-y-4">
                <div className="w-12 h-12 bg-[#09090B] rounded-full flex items-center justify-center mb-4">
                  <div className="w-6 h-1 bg-white rounded-full" />
                </div>
                <h3 className="font-display text-3xl font-bold">Built for Movement</h3>
                <p className="text-gray-500 leading-relaxed text-lg">
                  Designed for <span className="text-black font-bold">sprinting Grid Runners</span>, not desk jockeys.
                  Critical intel at eye level. One-thumb tactical controls.
                  Deploy shields, activate stealth, capture territory—all without breaking stride.
                </p>
              </SlideUp>
            </StaggerContainer>
          </div>
        </div>
      </main>


      {/* 2. HOW IT WORKS: The Tactile Steps */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Decorative Track Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-100 hidden md:block" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-24 text-center">
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter mb-6">
              SYSTEM <span className="text-[#D4FF00] drop-shadow-md">OPERATIONS</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Three physical actions to convert caloric energy into digital assets.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {/* Step 1: Connect */}
            <SlideUp className="relative group">
              <div className="absolute -top-12 -left-4 font-display text-[120px] font-bold text-gray-50 transition-colors group-hover:text-[#0047FF]/5 select-none z-0">
                1
              </div>
              <div className="relative z-10 bg-[#F3F4F6] p-1 rounded-[40px] transition-transform duration-300 group-hover:-translate-y-2">
                <div className="bg-white rounded-[36px] p-8 border border-gray-200 h-full flex flex-col items-center text-center relative overflow-hidden">
                  <div className="w-full h-1 bg-gray-100 absolute top-0 left-0" />
                  <div className="w-20 h-20 rounded-full bg-[#0047FF] flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
                    <Wallet size={32} className="text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">Connect & Load</h3>
                  <p className="text-gray-500 leading-relaxed mb-8">
                    Link your Hiro Wallet. Load STX for session fees.
                    <br /><span className="font-bold text-[#0047FF]">Entry Fee: 1 STX</span>
                  </p>
                  <div className="mt-auto w-full h-12 bg-[#F3F4F6] rounded-full flex items-center px-1">
                    <div className="h-10 w-10 bg-[#0047FF] rounded-full flex items-center justify-center">
                      <ChevronRight className="text-white" size={20} />
                    </div>
                    <span className="ml-4 font-display text-[10px] font-bold tracking-widest text-gray-400">READY</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            {/* Step 2: Run */}
            <SlideUp className="relative group md:mt-24">
              <div className="absolute -top-12 -left-4 font-display text-[120px] font-bold text-gray-50 transition-colors group-hover:text-[#D4FF00]/10 select-none z-0">
                2
              </div>
              <div className="relative z-10 bg-[#F3F4F6] p-1 rounded-[40px] transition-transform duration-300 group-hover:-translate-y-2">
                <div className="bg-white rounded-[36px] p-8 border border-gray-200 h-full flex flex-col items-center text-center relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-[#D4FF00] flex items-center justify-center mb-8 shadow-xl shadow-lime-200 border-4 border-white">
                    <MapPin size={32} className="text-black" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">Run & Capture</h3>
                  <p className="text-gray-500 leading-relaxed mb-8">
                    Emit your <span className="font-bold text-black">Quantum Trail</span>. Physically sprint to close loops on the map.
                    <span className="font-bold text-black"> Larger loop = More territory.</span>
                  </p>
                  {/* Decorative 'Active' Badge */}
                  <div className="mt-auto inline-flex items-center space-x-2 px-3 py-1 bg-[#D4FF00]/20 rounded-full">
                    <div className="w-2 h-2 bg-[#D4FF00] rounded-full animate-pulse" />
                    <span className="font-display text-[10px] font-bold text-black tracking-widest">GPS ACTIVE</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            {/* Step 3: Win */}
            <SlideUp className="relative group">
              <div className="absolute -top-12 -left-4 font-display text-[120px] font-bold text-gray-50 transition-colors group-hover:text-[#09090B]/5 select-none z-0">
                3
              </div>
              <div className="relative z-10 bg-[#F3F4F6] p-1 rounded-[40px] transition-transform duration-300 group-hover:-translate-y-2">
                <div className="bg-white rounded-[36px] p-8 border border-gray-200 h-full flex flex-col items-center text-center relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-[#09090B] flex items-center justify-center mb-8 shadow-2xl">
                    <Trophy size={32} className="text-[#D4FF00]" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">Claim The Pot</h3>
                  <p className="text-gray-500 leading-relaxed mb-8">
                    When the 15-minute timer hits zero, the largest territory holder takes the pot.
                  </p>
                  <div className="mt-auto w-full text-center">
                    <span className="font-display text-3xl font-bold text-[#09090B] block">125.5 STX</span>
                    <span className="text-xs text-gray-400 font-bold tracking-widest">LAST PAYOUT</span>
                  </div>
                </div>
              </div>
            </SlideUp>
          </StaggerContainer>
        </div>
      </section>

      {/* 3. FEATURES GRID: The Arsenal */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 uppercase">The Arsenal</h2>
            <div className="h-1 w-24 bg-[#09090B]" />
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <ScaleIn>
              <DesignCard title="Real-Time GPS" subtitle="High-frequency location polling for sub-meter accuracy during sprints.">
                <div className="flex items-center space-x-2 mt-4 text-[#D4FF00] font-bold font-display text-sm tracking-widest">
                  <Zap size={16} /> <span>1Hz UPDATES</span>
                </div>
              </DesignCard>
            </ScaleIn>

            {/* Feature 2 */}
            <ScaleIn className="md:col-span-2">
              <div className="h-full p-8 border border-gray-200 bg-white rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield size={120} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Trail Warfare</h3>
                <p className="text-gray-500 max-w-md">
                  Cross an enemy's trail to sever their loop. Deploy shields to protect your territory. This isn't just running; it's improved territory control.
                </p>
                <div className="mt-8 flex gap-4">
                  <div className="px-4 py-2 bg-red-50 text-[#FF2E00] rounded-lg font-display text-xs font-bold border border-red-100">
                    OFFENSE: SEVER
                  </div>
                  <div className="px-4 py-2 bg-blue-50 text-[#0047FF] rounded-lg font-display text-xs font-bold border border-blue-100">
                    DEFENSE: SHIELD
                  </div>
                </div>
              </div>
            </ScaleIn>

            {/* Feature 3 */}
            <ScaleIn>
              <DesignCard title="Session Based" subtitle="15-minute blitz rounds. No endless grinding. Win in minutes.">
                <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-[#09090B] w-2/3 h-full rounded-full" />
                </div>
                <div className="flex justify-between mt-2 text-xs font-bold text-gray-400">
                  <span>00:00</span>
                  <span>15:00</span>
                </div>
              </DesignCard>
            </ScaleIn>

            {/* Feature 4 */}
            <ScaleIn>
              <DesignCard title="Stacks Economy" subtitle="Powered by Bitcoin. Secured by running.">
                <div className="flex items-center justify-between mt-4">
                  <div className="font-display text-2xl font-bold text-[#09090B]">STX</div>
                  <div className="text-sm font-medium text-gray-400">Bitcoin L2</div>
                </div>
              </DesignCard>
            </ScaleIn>

            {/* Feature 5 */}
            <ScaleIn>
              <DesignCard title="Global Leaderboard" subtitle="Compete locally, rank globally.">
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">1. @speedrunner</span>
                    <span className="font-display text-[#D4FF00] bg-black px-2 rounded">940</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>2. @blockchaser</span>
                    <span>820</span>
                  </div>
                </div>
              </DesignCard>
            </ScaleIn>
          </StaggerContainer>
        </div>
      </section>

      {/* 5. THE ECOSYSTEM: Sustainable Economics */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 uppercase">The Ecosystem</h2>
            <div className="h-1 w-24 bg-[#D4FF00]" />
            <p className="mt-6 text-gray-500 max-w-2xl text-lg">
              A thriving digital economy overlaid on the physical world. Built on Real Yield, not inflation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* B2B / Partner Checkpoints */}
            <div className="group">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#D4FF00] transition-colors duration-300">
                <MapPin size={32} className="text-black" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">Partner Checkpoints</h3>
              <p className="text-gray-500 leading-relaxed">
                Local businesses become <span className="font-bold text-black">Sync Nodes</span>.
                They pay to drive physical footfall to their location.
                Runners visit to recharge and secure trails.
                <br /><br />
                <span className="text-[#0047FF] font-bold text-sm">REVENUE → PRIZE POOL</span>
              </p>
            </div>

            {/* Grid Ads */}
            <div className="group">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0047FF] transition-colors duration-300">
                <Zap size={32} className="text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">Grid Ads</h3>
              <p className="text-gray-500 leading-relaxed">
                The map is valuable real estate. Brands sponsor specific territories or boost zones.
                Non-intrusive, tactical integrations that increase the stakes.
                <br /><br />
                <span className="text-[#0047FF] font-bold text-sm">REVENUE → PRIZE POOL</span>
              </p>
            </div>

            {/* Real Yield */}
            <div className="group">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#09090B] transition-colors duration-300">
                <Wallet size={32} className="text-black group-hover:text-[#D4FF00] transition-colors" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">Sustainable Rewards</h3>
              <p className="text-gray-500 leading-relaxed">
                No inflationary tokens. We don't print money; we redistribute real value.
                <span className="font-bold text-black"> Entry Fees + B2B + Ads</span> = The Pot.
                <br /><br />
                <span className="text-[#09090B] font-bold text-sm">ZERO PONZENOMICS</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EVOLUTION PROTOCOL (Roadmap) */}
      <section className="py-24 bg-[#09090B] text-white">
        <div className="container mx-auto px-6">
          <div className="mb-16 md:flex md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-4xl font-bold mb-4 uppercase">Evolution Protocol</h2>
              <div className="h-1 w-24 bg-[#D4FF00]" />
            </div>
            <div className="mt-6 md:mt-0 font-display text-[#D4FF00] tracking-widest text-sm font-bold">
              CURRENT PHASE: ALPHA
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Phase Alpha */}
            <div className="border border-white/10 p-8 rounded-2xl bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-white select-none">1</div>
              <h3 className="font-display text-xl font-bold mb-2 text-[#D4FF00]">PHASE ALPHA</h3>
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-6">FOUNDATION</div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2 text-sm text-gray-300">
                  <div className="min-w-[16px] text-[#D4FF00]">✓</div>
                  <span>Core Gameplay Loop</span>
                </li>
                <li className="flex items-start space-x-2 text-sm text-gray-300">
                  <div className="min-w-[16px] text-[#D4FF00]">✓</div>
                  <span>Stacks Payments</span>
                </li>
                <li className="flex items-start space-x-2 text-sm text-gray-300">
                  <div className="min-w-[16px] text-[#D4FF00]">✓</div>
                  <span>GPS Trail Mechanics</span>
                </li>
              </ul>
            </div>

            {/* Phase Beta */}
            <div className="border border-white/10 p-8 rounded-2xl bg-white/5 opacity-50 hover:opacity-100 transition-opacity">
              <h3 className="font-display text-xl font-bold mb-2">PHASE BETA</h3>
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-6">WARFARE</div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2 text-sm text-gray-400">
                  <div className="min-w-[16px] border border-gray-600 w-4 h-4 rounded-full mt-0.5"></div>
                  <span>PvP Trail Combat</span>
                </li>
                <li className="flex items-start space-x-2 text-sm text-gray-400">
                  <div className="min-w-[16px] border border-gray-600 w-4 h-4 rounded-full mt-0.5"></div>
                  <span>Squad Formation</span>
                </li>
                <li className="flex items-start space-x-2 text-sm text-gray-400">
                  <div className="min-w-[16px] border border-gray-600 w-4 h-4 rounded-full mt-0.5"></div>
                  <span>Dynamic Sync Nodes</span>
                </li>
              </ul>
            </div>

            {/* Phase Gamma */}
            <div className="border border-white/10 p-8 rounded-2xl bg-white/5 opacity-30 hover:opacity-100 transition-opacity">
              <h3 className="font-display text-xl font-bold mb-2">PHASE GAMMA</h3>
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-6">EXPANSION</div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2 text-sm text-gray-500">
                  <div className="min-w-[16px] border border-gray-700 w-4 h-4 rounded-full mt-0.5"></div>
                  <span>Bitcoin Lightning</span>
                </li>
                <li className="flex items-start space-x-2 text-sm text-gray-500">
                  <div className="min-w-[16px] border border-gray-700 w-4 h-4 rounded-full mt-0.5"></div>
                  <span>Mobile Native Apps</span>
                </li>
              </ul>
            </div>

            {/* Phase Omega */}
            <div className="border border-white/10 p-8 rounded-2xl bg-white/5 opacity-30 hover:opacity-100 transition-opacity">
              <h3 className="font-display text-xl font-bold mb-2">PHASE OMEGA</h3>
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-6">ASCENSION</div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2 text-sm text-gray-500">
                  <div className="min-w-[16px] border border-gray-700 w-4 h-4 rounded-full mt-0.5"></div>
                  <span>Mainnet Launch</span>
                </li>
                <li className="flex items-start space-x-2 text-sm text-gray-500">
                  <div className="min-w-[16px] border border-gray-700 w-4 h-4 rounded-full mt-0.5"></div>
                  <span>Global Grid Network</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MISSION CONTROL (CTA) */}
      <section className="py-32 bg-[#09090B] text-white relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="mb-12">
            <div className="inline-block px-4 py-1 rounded-full border border-[#D4FF00]/30 text-[#D4FF00] font-display text-xs font-bold tracking-widest mb-6 animate-pulse">
              STATUS: ONLINE
            </div>
            <h2 className="font-display text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
              ENTER THE <br /> <span className="text-[#D4FF00]">GRID</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              The map is live. The prize pool is growing.
              Your warmup is over.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <Button
              variant="default"
              size="xl"
              className="h-20 px-12 text-xl bg-[#D4FF00] text-black hover:bg-[#b8dd00] font-display font-bold rounded-full shadow-[0_0_40px_rgba(212,255,0,0.3)] transition-transform hover:scale-105"
            >
              CONNECT WALLET
            </Button>
            <Link to="/how-to-play">
              <Button
                variant="outline"
                size="xl"
                className="h-20 px-12 text-xl border-white/20 text-white hover:bg-white/10 font-display font-bold rounded-full"
              >
                HOW IT WORKS
              </Button>
            </Link>
          </div>

          {/* Live Stats */}
          <div className="inline-flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6">
            <div className="px-8 py-4 text-center">
              <div className="text-gray-500 text-xs font-bold tracking-widest mb-2">CURRENT POOL</div>
              <div className="font-display text-4xl font-bold text-[#D4FF00]">125.5 STX</div>
            </div>
            <div className="px-8 py-4 text-center">
              <div className="text-gray-500 text-xs font-bold tracking-widest mb-2">RUNNERS ONLINE</div>
              <div className="font-display text-4xl font-bold text-white">42</div>
            </div>
            <div className="px-8 py-4 text-center">
              <div className="text-gray-500 text-xs font-bold tracking-widest mb-2">TOTAL CAPTURED</div>
              <div className="font-display text-4xl font-bold text-white">50K km²</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div >
  );
};

export default Index;
