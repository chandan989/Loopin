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
import { TrailPoint, Territory, PowerUpType, User, PlayerInGame } from '@/lib/gameTypes';
import * as turf from '@turf/turf';
import { toast } from 'sonner';

const Game = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [user, setUser] = useState<User>(mockUser);
  
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

  const totalWalked = userPlayer?.trail.reduce((dist, point, i, arr) => {
    if (i === 0) return 0;
    const prevPoint = arr[i-1];
    return dist + turf.distance(turf.point([prevPoint.lng, prevPoint.lat]), turf.point([point.lng, point.lat]), { units: 'meters' });
  }, 0) || 0;
  const caloriesBurned = totalWalked * 0.05;

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

  const checkLoopClosure = (player: PlayerInGame): Territory | null => {
    if (player.trail.length < 4) return null;

    const start = player.trail[0];
    const current = player.trail[player.trail.length - 1];
    const distance = turf.distance([start.lng, start.lat], [current.lng, current.lat], { units: 'meters' });

    if (distance < 20) {
      const trailCoords = player.trail.map(p => [p.lng, p.lat]);
      trailCoords.push([start.lng, start.lat]);

      try {
        const newPolygon = turf.polygon([trailCoords]);
        const area = turf.area(newPolygon);

        if (area > 0) {
          toast.success(`${player.name} captured ${Math.floor(area)} m²!`);
          return {
            coordinates: trailCoords.map(c => [c[1], c[0]]),
            area,
            capturedAt: new Date().toISOString(),
          };
        }
      } catch (error) {
        console.error('Error creating territory:', error);
      }
    }
    return null;
  };

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

      const newPoint: TrailPoint = { lat: newPos.lat, lng: newPos.lng, timestamp: new Date().toISOString() };
      
      let updatedPlayer = { 
        ...player, 
        currentPosition: newPos, 
        trail: [...player.trail, newPoint] 
      };

      const newTerritory = checkLoopClosure(updatedPlayer);

      if (newTerritory) {
        updatedPlayer = {
          ...updatedPlayer,
          trail: [],
          territories: [...updatedPlayer.territories, newTerritory],
          totalArea: updatedPlayer.totalArea + newTerritory.area,
        };
      }

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

  const handlePurchasePowerUp = (type: PowerUpType) => {
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
                totalWalked={totalWalked}
                caloriesBurned={caloriesBurned}
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
    { type: 'shield', name: 'Shield', description: 'Protect your trail from being cut.', cost: 5, icon: Shield },
    { type: 'stealth', name: 'Stealth', description: 'Temporarily hide your trail.', cost: 10, icon: EyeOff },
];

export default Game;
