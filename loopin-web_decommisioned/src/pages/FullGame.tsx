import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FullGameInterface from '@/components/game/FullGameInterface';
import { generateMockSession, PLAYER_COLORS } from '@/lib/mockData';
import { PlayerInGame, GameSession } from '@/lib/gameTypes';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { toast } from 'sonner';

const FullGame = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { balance } = useStacksWallet();
  
  // Generate realistic paths for AI players
  const generateRealisticPath = (startLat: number, startLng: number, steps: number = 15): [number, number][] => {
    const path: [number, number][] = [[startLat, startLng]];
    let currentLat = startLat;
    let currentLng = startLng;
    
    for (let i = 0; i < steps; i++) {
      // Random walk with slight bias to create interesting patterns
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.0008 + Math.random() * 0.0004; // 80-120 meters
      currentLat += Math.cos(angle) * distance;
      currentLng += Math.sin(angle) * distance;
      path.push([currentLat, currentLng]);
    }
    
    return path;
  };
  
  // Generate game session with realistic data
  const [gameSession, setGameSession] = useState<GameSession>(() => {
    const session = generateMockSession(sessionId || 'session_1', 'active');
    
    // Filter out user_123 and generate realistic AI players
    const onlyAIPlayers = session.players.filter(p => p.userId !== 'user_123');
    const updatedAIPlayers = onlyAIPlayers.map((player, index) => {
      // Spread players across the area
      const baseLat = 37.7749 + (Math.random() - 0.5) * 0.03;
      const baseLng = -122.4194 + (Math.random() - 0.5) * 0.03;
      const trailCoordinates = generateRealisticPath(baseLat, baseLng, 12);
      const currentPosition = trailCoordinates[trailCoordinates.length - 1];
      
      return {
        ...player,
        currentPosition: { lat: currentPosition[0], lng: currentPosition[1] },
        trailCoordinates,
        trail: trailCoordinates.map((_, i) => `trail_${player.userId}_${i}`),
        territories: Array.from({ length: Math.floor(player.score / 200) }, (_, i) => `territory_${player.userId}_${i}`)
      };
    });
    
    // Add human player
    const humanStartLat = 37.7749;
    const humanStartLng = -122.4194;
    const humanTrailCoords = generateRealisticPath(humanStartLat, humanStartLng, 8);
    const humanCurrentPos = humanTrailCoords[humanTrailCoords.length - 1];
    
    const youPlayer: PlayerInGame = {
      userId: 'user_123',
      name: 'You',
      color: '#FF6B6B',
      trail: humanTrailCoords.map((_, i) => `trail_user_123_${i}`),
      trailCoordinates: humanTrailCoords,
      territories: ['territory_user_123_0', 'territory_user_123_1', 'territory_user_123_2'],
      totalArea: 750,
      isActive: true,
      score: 750,
      rank: 5,
      isShielded: false,
      isStealthed: false,
      kills: 2,
      deaths: 1,
      currentPosition: { lat: humanCurrentPos[0], lng: humanCurrentPos[1] }
    };
    
    const allPlayers = [...updatedAIPlayers, youPlayer];
    const sortedLeaderboard = [...allPlayers].sort((a, b) => b.score - a.score);
    sortedLeaderboard.forEach((player, index) => {
      player.rank = index + 1;
    });
    
    return {
      ...session,
      players: allPlayers,
      leaderboard: sortedLeaderboard,
      prizePool: 5.0,
      status: 'active',
      gamePhase: 'active'
    };
  });

  const [currentPlayer, setCurrentPlayer] = useState<PlayerInGame>(() => 
    gameSession.players.find(p => p.userId === 'user_123')!
  );

  // Game Timer
  useEffect(() => {
    if (gameSession.gamePhase === 'active' && gameSession.timeRemaining > 0) {
      const timer = setInterval(() => {
        setGameSession(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameSession.timeRemaining === 0 && gameSession.gamePhase === 'active') {
      setGameSession(prev => ({ ...prev, gamePhase: 'ended', status: 'ended' }));
      toast.success('Game ended! Check your final ranking.');
    }
  }, [gameSession.gamePhase, gameSession.timeRemaining]);

  // Realistic AI movement
  useEffect(() => {
    const aiUpdateInterval = setInterval(() => {
      setGameSession(prev => {
        const updatedPlayers = prev.players.map(player => {
          if (player.userId === 'user_123') return player; // Don't auto-move human player
          
          // Realistic AI movement
          const currentPos = player.currentPosition || { lat: 37.7749, lng: -122.4194 };
          const angle = Math.random() * Math.PI * 2;
          const distance = 0.0005 + Math.random() * 0.0003; // 50-80 meters
          const newLat = currentPos.lat + Math.cos(angle) * distance;
          const newLng = currentPos.lng + Math.sin(angle) * distance;
          
          // Update trail coordinates
          const newTrailCoords = [...(player.trailCoordinates || []), [newLat, newLng] as [number, number]];
          const trimmedTrailCoords = newTrailCoords.slice(-15); // Keep last 15 points
          
          // Update score and territories
          const scoreIncrease = Math.random() * 5;
          const newScore = Math.floor(player.score + scoreIncrease);
          
          const newTerritories = [...player.territories];
          if (Math.random() > 0.85 && newTerritories.length < 8) {
            newTerritories.push(`territory_${player.userId}_${Date.now()}`);
          }
          
          return {
            ...player,
            currentPosition: { lat: newLat, lng: newLng },
            trailCoordinates: trimmedTrailCoords,
            trail: trimmedTrailCoords.map((_, i) => `trail_${player.userId}_${i}`),
            territories: newTerritories,
            score: newScore,
            totalArea: newScore
          };
        });

        const newLeaderboard = [...updatedPlayers].sort((a, b) => b.score - a.score);
        newLeaderboard.forEach((player, index) => {
          player.rank = index + 1;
        });

        return {
          ...prev,
          players: updatedPlayers,
          leaderboard: newLeaderboard
        };
      });
    }, 3000); // Update every 3 seconds
    return () => clearInterval(aiUpdateInterval);
  }, []);

  // Update currentPlayer when gameSession changes
  useEffect(() => {
    const updatedPlayer = gameSession.players.find(p => p.userId === 'user_123');
    if (updatedPlayer) {
      setCurrentPlayer(updatedPlayer);
    }
  }, [gameSession]);

  const handleGameAction = (action: string, data?: any) => {
    switch (action) {
      case 'buy_powerup':
        const cost = data.type === 'shield' ? 0.5 : 1.0;
        if (balance < cost) {
          toast.error(`Insufficient balance. You need ${cost} STX`);
          return;
        }

        setGameSession(prev => {
          const updatedPlayers = prev.players.map(player => {
            if (player.userId === 'user_123') {
              return {
                ...player,
                isShielded: data.type === 'shield' ? true : player.isShielded,
                isStealthed: data.type === 'stealth' ? true : player.isStealthed,
                stealthExpiresAt: data.type === 'stealth' ? Date.now() + 30000 : player.stealthExpiresAt
              };
            }
            return player;
          });

          const newLeaderboard = [...updatedPlayers].sort((a, b) => b.score - a.score);
          newLeaderboard.forEach((player, index) => {
            player.rank = index + 1;
          });

          return {
            ...prev,
            players: updatedPlayers,
            leaderboard: newLeaderboard
          };
        });

        toast.success(`${data.type === 'shield' ? 'Shield' : 'Stealth'} activated!`);
        break;

      default:
        console.log('Game action:', action, data);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/lobby')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO LOBBY
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-sm font-bold">{formatTime(gameSession.timeRemaining)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-lime" />
                <span className="font-mono text-sm font-bold">{balance.toFixed(2)} STX</span>
              </div>
            </div>

            <img src="/logo.svg" className="h-auto w-10" alt="Loopin" />
          </div>
        </div>
      </header>

      {/* Main Game Interface */}
      <main className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
        <FullGameInterface 
          gameSession={gameSession} 
          currentPlayer={currentPlayer} 
          onGameAction={handleGameAction} 
        />
      </main>
    </div>
  );
};

export default FullGame;
