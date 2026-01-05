import React, { useState, useEffect, useRef } from 'react';
import { Zap, Shield, ChevronRight } from 'lucide-react';

// The "Slide-to-Engage" Component
export const SlideButton = ({ onComplete }: { onComplete: () => void }) => {
    const [dragX, setDragX] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [completed, setCompleted] = useState(false);

    const handleDrag = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (completed) return;
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent | React.MouseEvent).clientX;
        const offsetX = Math.max(0, Math.min(clientX - rect.left - 32, rect.width - 64)); // 64 is button width

        setDragX(offsetX);

        // Threshold to trigger
        if (offsetX > rect.width - 80) {
            setCompleted(true);
            onComplete();
        }
    };

    const endDrag = () => {
        if (!completed) setDragX(0);
    };

    return (
        <div
            ref={containerRef}
            className="relative h-16 bg-[#F3F4F6] rounded-full overflow-hidden select-none touch-none"
            onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
            onTouchMove={handleDrag}
            onMouseUp={endDrag}
            onTouchEnd={endDrag}
            onMouseLeave={endDrag}
        >
            {/* Background Text */}
            <div className={`absolute inset-0 flex items-center justify-center font-display font-bold text-sm tracking-widest transition-opacity duration-300 ${completed ? 'opacity-0' : 'opacity-40'}`}>
                ||| SLIDE TO ENGAGE |||
            </div>

            {/* Progress Fill */}
            <div
                className="absolute left-0 top-0 h-full bg-black transition-all duration-75"
                style={{ width: `${dragX + 64}px` }}
            />

            {/* The Draggable Handle */}
            <div
                className="absolute top-1 left-1 h-14 w-14 rounded-full bg-[#D4FF00] shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75 z-10"
                style={{ transform: `translateX(${dragX}px)` }}
            >
                {completed ? (
                    <Zap size={24} className="text-black" />
                ) : (
                    <ChevronRight size={24} className="text-black" />
                )}
            </div>
        </div>
    );
};

// The Hero/App Simulation Section
const AppSimulation = () => {
    const [speed, setSpeed] = useState(14.2);
    const [active, setActive] = useState(false);

    // Simulate speed fluctuation
    useEffect(() => {
        if (!active) return;
        const interval = setInterval(() => {
            setSpeed(prev => {
                const variance = (Math.random() - 0.5);
                const newSpeed = Math.max(0, Math.min(25, prev + variance));
                return parseFloat(newSpeed.toFixed(1));
            });
        }, 500);
        return () => clearInterval(interval);
    }, [active]);

    // Calculate font weight based on speed (0-20km/h maps to 400-800 weight)
    const fontWeight = Math.min(800, Math.max(400, 400 + (speed * 20)));
    const isSprinting = speed > 10;

    return (
        <section className="relative w-full h-full flex flex-col bg-white overflow-hidden border-b border-gray-100">

            {/* 1. TOP STATUS BAR (Transparent) */}
            <div className="absolute top-24 left-0 w-full px-6 flex justify-between items-center z-10 pointer-events-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF2E00] animate-pulse" />
                    <span className="font-display text-xs font-bold tracking-widest">LIVE • 3 RUNNERS</span>
                </div>
                <div className="flex space-x-1">
                    {/* Signal Bars */}
                    <div className="w-1 h-3 bg-black" />
                    <div className="w-1 h-3 bg-black" />
                    <div className="w-1 h-3 bg-black" />
                    <div className="w-1 h-3 bg-black opacity-30" />
                </div>
            </div>

            {/* 2. THE VIEWPORT (Map) */}
            <div className="flex-grow relative bg-map-pattern w-full overflow-hidden">

                {/* Decorative Map Elements (Blocks) */}
                <div className="absolute top-1/4 left-10 w-24 h-32 bg-[#F3F4F6] border border-gray-200" />
                <div className="absolute top-1/3 right-10 w-40 h-40 bg-[#F3F4F6] border border-gray-200" />
                <div className="absolute bottom-1/3 left-1/4 w-32 h-64 bg-[#F3F4F6] border border-gray-200" />

                {/* The Trail (Thick Black Line) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path
                        d="M -50 400 Q 100 350 180 500 T 400 450"
                        fill="none"
                        stroke="#09090B"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Current Position (Pulsing Hyper-Volt) */}
                <div className="absolute top-[485px] left-[170px] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#D4FF00] rounded-full opacity-40 animate-ping" />
                        <div className="w-6 h-6 bg-[#D4FF00] rounded-full border-4 border-white shadow-[0_0_0_4px_rgba(204,255,0,0.4)]" />
                    </div>
                </div>

                {/* Beacons (Cobalt Nodes) */}
                <div className="absolute top-[300px] right-[80px] flex flex-col items-center opacity-80">
                    <div className="w-1 h-20 bg-gradient-to-t from-[#0047FF] to-transparent opacity-50" />
                    <div className="w-3 h-3 bg-[#0047FF] rounded-full animate-bounce" />
                </div>
            </div>

            {/* 3. THE ACTION DECK (Bottom Sheet) */}
            <div
                className="relative z-20 bg-white rounded-t-[30px] pt-8 px-6 pb-12 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
            >
                <div className="flex justify-between items-end mb-8">
                    {/* Main Stat: Speed */}
                    <div className="flex flex-col">
                        <span className="font-display text-xs text-gray-400 uppercase tracking-widest mb-1">Velocity (km/h)</span>
                        <span
                            className="font-display text-7xl leading-none tracking-tighter text-black variable-speed-text"
                            style={{
                                fontWeight: fontWeight,
                                fontStyle: isSprinting ? 'italic' : 'normal',
                                transform: isSprinting ? 'skewX(-10deg)' : 'none'
                            }}
                        >
                            {speed.toFixed(1)}
                        </span>
                    </div>

                    {/* Secondary Stat: Earnings */}
                    <div className="flex flex-col items-end mb-2">
                        <span className="font-display text-xs text-gray-400 uppercase tracking-widest mb-1">Earned (STX)</span>
                        <span className="font-display text-2xl font-bold text-[#0047FF]">
                            0.05
                        </span>
                    </div>
                </div>

                {/* Controls */}
                {active ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setActive(false)} className="h-16 rounded-2xl border-2 border-[#09090B] flex items-center justify-center font-display font-bold hover:bg-gray-50 transition-colors">
                            PAUSE
                        </button>
                        <button className="h-16 rounded-2xl bg-[#0047FF] text-white flex items-center justify-center font-display font-bold shadow-lg shadow-blue-200">
                            <Shield size={20} className="mr-2" />
                            BOOST
                        </button>
                    </div>
                ) : (
                    <SlideButton onComplete={() => setActive(true)} />
                )}
            </div>
        </section>
    );
};

export default AppSimulation;
