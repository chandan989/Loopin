import React from 'react';
import { Wallet } from 'lucide-react';
import { SlideUp, ScaleIn, GlitchText } from '@/components/animation/MotionWrapper';

interface DashboardHeaderProps {
    currentBalance: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentBalance }) => {
    return (
        <div className="mb-12 md:mb-24">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8 md:mb-12">
                <SlideUp>
                    <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-4 md:mb-6 uppercase">
                        <GlitchText text="COMMAND" /> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-400">
                            <GlitchText text="CENTER" delay={0.3} />
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-medium max-w-md leading-relaxed">
                        Welcome back, Runner. Your territory is waiting.
                    </p>
                </SlideUp>

                <ScaleIn delay={0.2} className="bg-[#09090B] p-1.5 rounded-3xl md:rounded-full w-full md:w-auto">
                    <div className="px-6 md:px-8 py-4 rounded-3xl md:rounded-full bg-[#09090B] border border-white/10 flex items-center justify-between md:justify-start gap-5 shadow-2xl">
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#D4FF00] flex items-center justify-center animate-pulse shrink-0">
                                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-black" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">Available Balance</div>
                                <div className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">{currentBalance.toFixed(1)} STX</div>
                            </div>
                        </div>
                    </div>
                </ScaleIn>
            </div>

            <SlideUp delay={0.3} className="h-px w-full bg-gray-200">
                {null}
            </SlideUp>
        </div>
    );
};

export default DashboardHeader;
