import { useState, useEffect } from 'react';
import { Menu, X, Map, Trophy, Zap, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';


// Re-usable component for the brand logo SVG
const Logo = ({ width = 40, height = 40 }) => (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="#212529" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z" fill="#C7F441" stroke="#C7F441" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Scroll-to-section link helper
const NavLink = ({ href, children, isMono = true, onClick }) => (
    <a href={href} onClick={onClick} className={`${isMono ? 'font-mono' : 'font-primary'} text-gray-600 hover:text-black transition-colors`}>
        {children}
    </a>
);

// Button for primary calls to action
const ActionButton = ({ href, children }) => (
    <a href={href} className="relative inline-block px-6 py-2 font-bold rounded-md text-black transition-all duration-300 bg-[var(--accent-color)] hover:bg-[#b0d635] font-mono tracking-wide overflow-hidden">
        <span className="relative z-10">{children}</span>
    </a>
);

const Landing = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Effect for scroll animations, inspired by landing.html
    useEffect(() => {
        const animatedElements = document.querySelectorAll('.scroll-animate');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        animatedElements.forEach(el => observer.observe(el));
        return () => animatedElements.forEach(el => observer.unobserve(el));
    }, []);

    return (
        <>
            {/* Injecting design tokens and base styles from landing.html */}
            <style>{`
                :root {
                    --accent-color: #C7F441;
                    --bg-color: #F8F9FA;
                    --text-color: #212529;
                    --muted-text-color: #6C757D;
                    --border-color: #DEE2E6;
                    --card-bg-color: #FFFFFF;
                    --background: 240 10% 3.9%;
                    --foreground: 0 0% 98%;
                    --card: 240 10% 3.9%;
                    --card-foreground: 0 0% 98%;
                    --popover: 240 10% 3.9%;
                    --popover-foreground: 0 0% 98%;
                    --primary: 0 0% 98%;
                    --primary-foreground: 240 5.9% 10%;
                    --secondary: 240 3.7% 15.9%;
                    --secondary-foreground: 0 0% 98%;
                    --muted: 240 3.7% 15.9%;
                    --muted-foreground: 240 5% 64.9%;
                    --accent: 74 89% 61%;
                    --destructive: 0 84.2% 60.2%;
                    --destructive-foreground: 0 0% 98%;
                    --border: 240 3.7% 15.9%;
                    --input: 240 3.7% 15.9%;
                    --ring: 74 89% 66%;
                }
                html { scroll-behavior: smooth; scroll-padding-top: 80px; }
                body { background-color: var(--bg-color); font-family: 'Inter', sans-serif; }
                .font-primary { font-family: 'Inter', sans-serif; }
                .font-mono { font-family: 'Roboto Mono', monospace; }
                .scroll-animate { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
                .scroll-animate.is-visible { opacity: 1; transform: translateY(0); }
                @keyframes draw-trail { to { stroke-dashoffset: 0; } }
                .animate-draw-trail { animation: draw-trail 3s ease-out forwards; }
                .grid-bg { background-image: linear-gradient(to bottom, rgba(255,255,255,0) 0%, var(--bg-color) 100%); }
            `}</style>

            <div className="bg-[var(--bg-color)] text-[var(--text-color)]">
                {/* Header - Styled like landing.html */}
                <header className="fixed top-0 left-0 right-0 z-50  backdrop-blur-md border-[var(--border-color)]">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <a href="#home" className="flex items-center gap-3">
                            <img src={"logo.svg"} className="h-auto w-10" />
                            <span className="text-2xl font-black tracking-wide font-primary text-gray-900">LOOPIN</span>
                        </a>
                        <nav className="hidden md:flex items-center gap-6">
                            <NavLink href="#mechanics">Mechanics</NavLink>
                            <NavLink href="#features">Features</NavLink>
                            <NavLink href="#community">Community</NavLink>
                        </nav>
                        <div className="hidden md:block">
                            <ActionButton href="#community">JOIN WAITLIST</ActionButton>
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <div className="md:hidden bg-white border-t border-[var(--border-color)]">
                            <nav className="flex flex-col items-center px-6 py-4 gap-4">
                                <NavLink href="#mechanics" onClick={() => setIsMenuOpen(false)}>Mechanics</NavLink>
                                <NavLink href="#features" onClick={() => setIsMenuOpen(false)}>Features</NavLink>
                                <NavLink href="#community" onClick={() => setIsMenuOpen(false)}>Community</NavLink>
                                <ActionButton href="#community">JOIN WAITLIST</ActionButton>
                            </nav>
                        </div>
                    )}
                </header>

                <main className="pt-20">
                    {/* Hero Section - Restored to original component style */}
                    <section id="home" className="relative overflow-hidden py-20 px-4 grid-bg">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-color)] pointer-events-none" />
                        <div className="container mx-auto max-w-6xl relative z-10">
                            <div className="text-center space-y-8">
                                <div className="inline-block">
                                    <div className="flex items-center gap-3 bg-[var(--card-bg-color)] border border-[var(--accent-color)]/20 rounded-full px-6 py-2">
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
                                        <span className="font-mono text-sm tracking-wide text-[var(--text-color)]">BETA LIVE</span>
                                    </div>
                                </div>
                                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight text-[var(--text-color)]">
                                    LOOPIN
                                </h1>
                                <div className="h-1 w-24 bg-[var(--accent-color)] mx-auto" />
                                <p className="text-xl md:text-2xl text-[var(--muted-text-color)] max-w-2xl mx-auto">
                                    Capture territory through GPS movement. Draw trails, close loops, dominate the map.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                                    <Link to="/lobby">
                                        <Button variant="lime" size="xl" className="group">
                                            START PLAYING
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Button variant="lime-outline" size="xl">
                                        WATCH DEMO
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-20 relative h-64 md:h-96">
                                <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g opacity="0.1" stroke="var(--border-color)">
                                        {Array.from({ length: 20 }).map((_, i) => <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" strokeWidth="1" />)}
                                        {Array.from({ length: 10 }).map((_, i) => <line key={`h-${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} strokeWidth="1" />)}
                                    </g>
                                    <path d="M 100 200 L 200 150 L 300 180 L 400 120 L 500 200 L 600 150 L 700 200" stroke="var(--accent-color)" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-draw-trail" strokeDasharray="1000" strokeDashoffset="1000" />
                                    {[ [200, 150], [400, 120], [600, 150] ].map(([x, y], i) => (
                                        <circle key={i} cx={x} cy={y} r="8" fill="var(--accent-color)" className="animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                                    ))}
                                    <polygon points="300,180 400,120 500,200 450,250 350,240" fill="var(--accent-color)" opacity="0.2" stroke="var(--accent-color)" strokeWidth="2" />
                                </svg>
                            </div>
                        </div>
                    </section>

                    {/* Core Mechanics - Restyled from original Landing.tsx */}
                    <section id="mechanics" className="py-16 md:py-24 bg-white overflow-hidden">
                        <div className="container mx-auto px-6">
                            <div className="scroll-animate">
                                <h2 className="text-4xl font-bold font-primary uppercase mb-1 text-gray-900">Core Mechanics</h2>
                                <div className="w-24 h-1 bg-[var(--accent-color)] mb-8"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: Map, title: 'GPS_TO_TERRITORY', description: 'Your physical movements draw a path on the map. Close the loop to capture the enclosed area.' },
                                    { icon: Trophy, title: 'WINNER_TAKES_ALL', description: 'The player with the largest captured area at the end of a session wins the entire prize pool.' },
                                    { icon: Zap, title: 'STRATEGIC_GAMEPLAY', description: 'Use power-ups and cut off rival trails to defend your territory and gain an edge.' },
                                ].map((item, i) => (
                                    <div key={i} className="scroll-animate bg-[var(--card-bg-color)] p-6 border border-[var(--border-color)] rounded-lg h-full group relative overflow-hidden" style={{ transitionDelay: `${i * 100}ms` }}>
                                        <div className="absolute -inset-0.5 bg-[var(--accent-color)] rounded-lg blur-xl opacity-0 group-hover:opacity-25 transition duration-300"></div>
                                        <div className="relative">
                                            <item.icon className="w-8 h-8 text-[var(--accent-color)] mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 font-mono">{item.title}</h3>
                                            <p className="text-[var(--muted-text-color)] leading-relaxed font-primary">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Game Features - Restyled from original Landing.tsx */}
                    <section id="features" className="py-16 md:py-24 overflow-hidden">
                        <div className="container mx-auto px-6">
                            <div className="scroll-animate">
                                <h2 className="text-4xl font-bold font-primary uppercase mb-1 text-gray-900">Game Features</h2>
                                <div className="w-24 h-1 bg-[var(--accent-color)] mb-8"></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { icon: Users, title: 'MULTIPLAYER_BATTLES', description: 'Compete against players in real-time. Cut their trails to stop their progress.' },
                                    { icon: Zap, title: 'POWER_UPS', description: 'Use shields to protect your trail or stealth mode to hide your movements.' },
                                    { icon: Trophy, title: 'STX_REWARDS', description: 'Winner takes the prize pool, managed by a secure smart contract on Stacks.' },
                                    { icon: Map, title: 'REAL_WORLD_CONQUEST', description: 'Your actual movement creates gameplay. Walk, run, or drive to capture territory.' },
                                ].map((feature, i) => (
                                    <div key={i} className="scroll-animate p-6 bg-white border border-[var(--border-color)] rounded-lg flex items-start gap-4" style={{ transitionDelay: `${i * 100}ms` }}>
                                        <div className="w-12 h-12 rounded-lg bg-[var(--accent-color)]/20 flex items-center justify-center flex-shrink-0">
                                            <feature.icon className="w-6 h-6 text-[var(--text-color)]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold uppercase mb-2 font-mono">{feature.title}</h3>
                                            <p className="text-[var(--muted-text-color)] text-sm font-primary">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="community" className="py-16 md:py-24 bg-white">
                        <div className="container mx-auto px-6 scroll-animate">
                            <h2 className="text-4xl font-bold font-primary uppercase mb-1 text-gray-900">Join Genesis Loop</h2>
                            <div className="w-24 h-1 bg-[var(--accent-color)] mb-8"></div>
                            <p className="max-w-2xl mb-8 font-primary text-[var(--muted-text-color)]">Be first to be notified when Loopin goes live. Get early access, exclusive rewards, and a place in our founding community.</p>
                            <form className="max-w-md flex flex-col sm:flex-row gap-0 relative" onSubmit={(e) => e.preventDefault()}>
                                <input type="email" placeholder="your.email@protocol.xyz" className="w-full px-5 py-3 rounded-l-md rounded-r-none bg-white text-black placeholder-gray-400 outline-none border-2 border-gray-300 focus:border-[var(--accent-color)] transition-all focus:ring-2 focus:ring-[var(--accent-color)]/50 font-mono" required />
                                <button type="submit" className="px-6 py-3 font-bold rounded-r-md bg-[var(--accent-color)] text-black hover:bg-[#b0d635] transition-all duration-300 focus:outline-none whitespace-nowrap font-mono border-2 border-l-0 border-[var(--accent-color)] hover:border-[#b0d635]">SUBMIT</button>
                            </form>
                        </div>
                    </section>
                </main>

                {/* Footer - Styled like landing.html */}
                <footer className="bg-white border-t border-[var(--border-color)]">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
                            <div className="flex items-center gap-3">
                                <Logo width={32} height={32} />
                                <span className="text-xl font-black tracking-wide font-primary text-gray-900">LOOPIN</span>
                            </div>
                            <p className="font-mono text-sm text-[var(--muted-text-color)]">&copy; 2025 Loopin Protocol. All rights reserved.</p>
                            <div className="flex gap-4 font-mono text-sm text-gray-600">
                                <a href="#" className="hover:text-black">Twitter</a>
                                <a href="#" className="hover:text-black">Discord</a>
                                <a href="#" className="hover:text-black">Privacy</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Landing;
