import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlideUp, StaggerContainer } from '@/components/animation/MotionWrapper';
import { Game } from '@/lib/api';

interface ActiveSessionsListProps {
    activeSessions: Game[];
}

const ActiveSessionsList: React.FC<ActiveSessionsListProps> = ({ activeSessions }) => {
    return (
        <div>
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
                <StaggerContainer delay={0.6}>
                    {activeSessions.length === 0 ? (
                        <div className="text-gray-500 font-bold p-4">No active games found. Start the backend!</div>
                    ) : activeSessions.map((session) => (
                        <SlideUp key={session.id} className="group relative block">
                            <div className="absolute inset-0 bg-black rounded-[24px] translate-y-2 translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative bg-white border border-gray-200 group-hover:border-black rounded-[24px] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3">
                                            <span className="font-display text-sm md:text-lg font-bold bg-black text-white px-3 py-1 rounded-md">{session.game_type}</span>
                                            <div className="flex items-center gap-2 text-gray-500 text-[10px] md:text-xs font-bold tracking-widest uppercase border-l-2 border-gray-200 pl-3 md:pl-4">
                                                <Users size={12} className="md:w-[14px] md:h-[14px]" /> {session.players} Runners
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-[10px] md:text-xs font-bold tracking-widest uppercase border-l-2 border-gray-200 pl-3 md:pl-4">
                                                <Clock size={12} className="md:w-[14px] md:h-[14px]" /> {session.time_remaining || 'Live'}
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className="font-display text-3xl md:text-4xl font-black">{session.prize_pool} STX</span>
                                            <span className="text-gray-400 font-medium text-sm md:text-base">Prize Pool</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <div className="text-left md:text-right">
                                            <div className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">ENTRY FEE</div>
                                            <div className="font-display text-lg md:text-xl font-bold">{session.entry_fee} STX</div>
                                        </div>

                                        <Link to={`/game/${session.id}`} className="block">
                                            <Button className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#09090B] hover:bg-[#D4FF00] hover:text-black p-0 flex items-center justify-center transition-colors">
                                                <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-[#D4FF00]" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SlideUp>
                    ))}
                </StaggerContainer>
            </div>
        </div>
    );
};

export default ActiveSessionsList;
