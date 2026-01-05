import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Target, Shield, EyeOff, Zap } from 'lucide-react';
import { PlayerInGame, GameSession } from '@/lib/gameTypes';
import MapView from './MapView';

interface FullGameInterfaceProps {
  gameSession: GameSession;
  currentPlayer: PlayerInGame;
  onGameAction?: (action: string, data?: any) => void;
}

const FullGameInterface = ({ gameSession, currentPlayer, onGameAction }: FullGameInterfaceProps) => {
  // Use timeRemaining and gamePhase from gameSession props (no duplicate timer)
  const timeRemaining = gameSession.timeRemaining;
  const gamePhase = gameSession.gamePhase;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePowerUp = (type: 'shield' | 'stealth') => {
    onGameAction?.('buy_powerup', { type });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Left Panel - Game Stats */}
      <div className="space-y-4">
        {/* Game Timer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              GAME TIMER
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-lime">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {gamePhase === 'active' ? 'GAME ACTIVE' : gamePhase === 'ended' ? 'GAME ENDED' : 'WAITING'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              YOUR STATS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Score</span>
              <span className="font-bold text-lime">{currentPlayer.score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rank</span>
              <Badge variant="outline" className="font-mono">
                #{currentPlayer.rank}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Territory</span>
              <span className="font-bold">{currentPlayer.totalArea} m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">K/D</span>
              <span className="font-bold">{currentPlayer.kills}/{currentPlayer.deaths}</span>
            </div>
          </CardContent>
        </Card>

        {/* Power-ups */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              POWER-UPS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant={currentPlayer.isShielded ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handlePowerUp('shield')}
              disabled={currentPlayer.isShielded}
            >
              <Shield className="w-4 h-4 mr-2" />
              Shield (0.5 STX)
            </Button>
            <Button
              variant={currentPlayer.isStealthed ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handlePowerUp('stealth')}
              disabled={currentPlayer.isStealthed}
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Stealth (1 STX)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Center - Game Map Area */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-center">
              TERRITORY MAP
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full p-0">
            <div className="h-96 relative">
              <MapView
                center={[37.7749, -122.4194]} // San Francisco coordinates
                allPlayers={gameSession.players}
                currentUserId={currentPlayer.userId}
              />
              {/* Game Instructions Overlay */}
              {gamePhase === 'active' && (
                <div className="absolute top-2 left-2 bg-black/90 text-white p-3 rounded-lg text-xs space-y-2 max-w-xs">
                  <div className="font-bold text-yellow-400">HOW TO PLAY:</div>
                  <div>🎯 <span className="text-yellow-300">Click and drag</span> to draw trails</div>
                  <div>🔄 <span className="text-green-300">Close loops</span> to capture territory</div>
                  <div>⚔️ <span className="text-red-300">Cut enemy trails</span> to disrupt them</div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="font-bold text-blue-400 mb-1">LEGEND:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-red-500"></div>
                      <span>Your trail (solid)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-blue-500" style={{background: 'repeating-linear-gradient(to right, #3b82f6 0px, #3b82f6 2px, transparent 2px, transparent 4px)'}}></div>
                      <span>AI trails (dashed)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Captured territory (circles)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Leaderboard */}
      <div>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4" />
              LEADERBOARD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameSession.leaderboard.slice(0, 10).map((player, index) => (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    player.userId === currentPlayer.userId 
                      ? 'bg-lime/10 border-lime/30' 
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                         style={{ backgroundColor: player.color, color: 'white' }}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">
                      {player.name}
                      {player.userId === currentPlayer.userId && (
                        <Badge variant="secondary" className="ml-2 text-xs">YOU</Badge>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-lime">{player.score}</div>
                    <div className="text-xs text-muted-foreground">{player.totalArea}m²</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prize Pool */}
            <div className="mt-6 p-3 bg-lime/5 border border-lime/20 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase">Prize Pool</div>
                <div className="text-xl font-bold text-lime">{gameSession.prizePool} STX</div>
                <div className="text-xs text-muted-foreground">
                  Winner takes all!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FullGameInterface;
