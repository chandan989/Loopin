import { useState } from 'react';
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PlayerInGame } from '@/lib/gameTypes';

interface LeaderboardProps {
  players: PlayerInGame[];
  currentUserId: string;
}

const Leaderboard = ({ players, currentUserId }: LeaderboardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const sortedPlayers = [...players].sort((a, b) => b.totalArea - a.totalArea);

  const formatArea = (area: number) => {
    if (area >= 1000000) return `${(area / 1000000).toFixed(1)}km²`;
    return `${Math.floor(area)}m²`;
  };

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50 w-full md:w-64">
      <div className="p-2">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-foreground" />
            <h3 className="font-bold uppercase font-mono text-xs">Leaderboard</h3>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-1">
            {sortedPlayers.map((player, index) => {
              const isCurrentUser = player.userId === currentUserId;
              return (
                <div 
                  key={player.userId} 
                  className={`flex items-center justify-between p-1.5 rounded ${isCurrentUser ? 'bg-primary/10' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs w-5 text-center">{index + 1}</span>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: player.color }} />
                    <p className="font-mono text-xs truncate">{player.name}</p>
                  </div>
                  <p className={`font-mono text-xs font-bold ${isCurrentUser ? 'text-primary' : ''}`}>
                    {formatArea(player.totalArea)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Leaderboard;
