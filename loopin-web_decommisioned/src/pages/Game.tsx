import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Shield, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MapView from '@/components/game/MapView';
import GameHUD from '@/components/game/GameHUD';
import Leaderboard from '@/components/game/Leaderboard';
import PowerUpShop from '@/components/game/PowerUpShop';
import { mockUser, generateMockSession, PLAYER_COLORS } from '@/lib/mockData';
import { PowerUpType, User, PlayerInGame, H3Index } from '@/lib/gameTypes';
import * as h3 from "h3-js";
import { toast } from 'sonner';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { buyShield, buyStealth } from '@/lib/contractInteractions';
import { ENABLE_WEB3, COSTS, MICRO_STX } from '@/lib/stacksConfig';

const H3_RESOLUTION = 12; // 12 is roughly 300m² per hexagon, good for a city block level
const AREA_PER_CELL_SQ_M = h3.getHexagonAreaAvg(H3_RESOLUTION, 'm2');

const Game = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [user, setUser] = useState<User>(mockUser);
  const { userSession, balance } = useStacksWallet();
  
  const [players, setPlayers] = useState<PlayerInGame[]>(() => 
    [mockUser, ...generateMockSession(sessionId || 'session_1', 'active').players.filter(p => p.userId !== mockUser.id)]
    .map((p, i) => ({
      ...(p as any),
      userId: (p as any).id || p.userId,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      trail: [],
      territories: [],
      totalArea: 0,
      isActive: true,
      currentPosition: { lat: 37.7749 + (Math.random() - 0.5) * 0.01, lng: -122.4194 + (Math.random() - 0.5) * 0.01 },
      ai: { direction: 'north', steps: 0, stepsPerSide: 10 + Math.floor(Math.random() * 10) }
    }))
  );

  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [speed, setSpeed] = useState(1);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const userPlayer = players.find(p => p.userId === user.id)!;

  // REMOVED: totalWalked and caloriesBurned which used turf

  const handleGameEnd = useCallback(() => {
    toast.success('Game Over!');
    setTimeout(() => navigate('/lobby'), 2000);
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleGameEnd]);

  const MOVE_DISTANCE = 0.0001;

  // REMOVED: checkLoopClosure function

  const movePlayer = useCallback((playerId: string, direction: 'north' | 'south' | 'east' | 'west') => {
    setPlayers(prevPlayers => {
      const playerIndex = prevPlayers.findIndex(p => p.userId === playerId);
      if (playerIndex === -1) return prevPlayers;

      const player = prevPlayers[playerIndex];
      const distance = MOVE_DISTANCE * speed;
      const newPos = { ...player.currentPosition! };

      switch (direction) {
        case 'north': newPos.lat += distance; break;
        case 'south': newPos.lat -= distance; break;
        case 'east': newPos.lng += distance; break;
        case 'west': newPos.lng -= distance; break;
      }

      const currentCell = h3.latLngToCell(newPos.lat, newPos.lng, H3_RESOLUTION);
      
      let updatedPlayer = { 
        ...player, 
        currentPosition: newPos, 
      };

      // Claim the new cell if it's not already in the current trail
      if (!updatedPlayer.trail.includes(currentCell)) {
        updatedPlayer.trail = [...updatedPlayer.trail, currentCell];
        toast.info(`${player.name} claimed a new cell!`);
      }

      // TODO: Implement "banking" logic.
      // For now, we just accumulate cells in the trail.
      // When a player visits a "checkpoint", we would move cells from `trail` to `territories`
      // and update `totalArea`.

      const newPlayers = [...prevPlayers];
      newPlayers[playerIndex] = updatedPlayer;
      
      return newPlayers;
    });
  }, [speed]);

  useEffect(() => {
    if (isDemoMode) {
      const demoInterval = setInterval(() => {
        players.forEach(p => {
          if (p.userId !== user.id) {
            let { direction, steps, stepsPerSide } = p.ai!;
            steps++;
            if (steps >= stepsPerSide) {
              steps = 0;
              const directions: Array<'north' | 'south' | 'east' | 'west'> = ['north', 'east', 'south', 'west'];
              direction = directions[(directions.indexOf(direction) + 1) % 4];
            }
            movePlayer(p.userId, direction);
            setPlayers(prev => prev.map(pl => pl.userId === p.userId ? {...pl, ai: { ...pl.ai!, direction, steps }} : pl));
          }
        });
      }, 500 / speed);
      return () => clearInterval(demoInterval);
    }
  }, [isDemoMode, speed, players, movePlayer, user.id]);

  const handleToggleDemoMode = () => setIsDemoMode(prev => !prev);

  const handlePurchasePowerUp = async (type: PowerUpType) => {
    if (!ENABLE_WEB3) {
      // Mock mode
      const powerUp = POWER_UPS.find(p => p.type === type);
      if (!powerUp || user.stxBalance < powerUp.cost) return;

      setUser(prev => ({
        ...prev,
        stxBalance: prev.stxBalance - powerUp.cost,
        powerUps: {
          ...prev.powerUps,
          [type]: { ...prev.powerUps[type], count: prev.powerUps[type].count + 1 },
        },
      }));
      toast.success(`${powerUp.name} purchased!`);
      return;
    }

    // Web3 mode - real transaction
    try {
      const gameId = parseInt(sessionId?.replace('session_', '') || '1');
      const powerUp = POWER_UPS.find(p => p.type === type);
      const cost = type === 'shield' ? COSTS.SHIELD : COSTS.STEALTH;
      const costSTX = cost / MICRO_STX;

      if (balance < costSTX) {
        toast.error(`Insufficient balance. Need ${costSTX} STX`);
        return;
      }

      toast.info(`Purchasing ${powerUp?.name}...`);

      if (type === 'shield') {
        await buyShield(gameId, userSession);
      } else if (type === 'stealth') {
        await buyStealth(gameId, userSession);
      }

      // Update local state optimistically
      setUser(prev => ({
        ...prev,
        powerUps: {
          ...prev.powerUps,
          [type]: { ...prev.powerUps[type], count: prev.powerUps[type].count + 1 },
        },
      }));
    } catch (error) {
      console.error('Power-up purchase failed:', error);
      toast.error('Purchase failed. Please try again.');
    }
  };

  return (
    <div className="h-screen bg-background relative">
      <div className="absolute inset-0 z-0">
        {userPlayer && <MapView
          center={[userPlayer.currentPosition!.lat, userPlayer.currentPosition!.lng]}
          allPlayers={players}
          currentUserId={user.id}
        />}
      </div>

      <div className="absolute inset-0 p-4 pointer-events-none z-10 flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="pointer-events-auto w-full max-w-md">
            <Card className="p-2 flex items-center justify-between bg-background/80 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/lobby')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-md font-black uppercase font-mono">LOOPIN</h1>
                <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant={isDemoMode ? "secondary" : "outline"} size="sm" onClick={handleToggleDemoMode}>
                  {isDemoMode ? "Stop Demo" : "Start Demo"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => navigate('/lobby')}>
                  <X className="w-4 h-4 mr-1" />
                  Exit
                </Button>
              </div>
            </Card>
          </div>
          {userPlayer &&
            <div className="pointer-events-auto w-full max-w-md">
              <GameHUD
                timeRemaining={timeRemaining}
                totalArea={userPlayer.totalArea}
                territoriesCount={userPlayer.territories.length}
                totalWalked={0} // FIXME: Re-implement or remove
                caloriesBurned={0} // FIXME: Re-implement or remove
              />
            </div>
          }
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="pointer-events-auto w-full md:w-64">
            <Leaderboard players={players} currentUserId={user.id} />
          </div>
          <div className="pointer-events-auto w-full md:w-64">
            <PowerUpShop user={user} onPurchase={handlePurchasePowerUp} powerUps={POWER_UPS} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Add POWER_UPS mock data to be self-contained
const POWER_UPS = [
    { type: 'shield', name: 'Shield', description: 'Protect your trail from being cut.', cost: 0.5, icon: Shield },
    { type: 'stealth', name: 'Stealth', description: 'Temporarily hide your trail.', cost: 1, icon: EyeOff },
];

export default Game;