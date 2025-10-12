import { Card } from '@/components/ui/card';

interface GameHUDProps {
  timeRemaining: number;
  totalArea: number;
  territoriesCount: number;
  totalWalked: number;
  caloriesBurned: number;
}

const GameHUD = ({ 
  timeRemaining, 
  totalArea, 
  territoriesCount, 
  totalWalked,
  caloriesBurned
}: GameHUDProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatArea = (area: number) => {
    if (area >= 1000000) return `${(area / 1000000).toFixed(2)}km²`;
    return `${area.toFixed(0)} m²`;
  };

  const formatDistance = (distance: number) => {
    if (distance >= 1000) return `${(distance / 1000).toFixed(2)} km`;
    return `${distance.toFixed(0)} m`;
  };

  return (
    <Card className="p-3 bg-background/80 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between gap-4">
        <div className="text-center flex-1">
          <p className="text-xs text-muted-foreground uppercase font-mono">Time Left</p>
          <p className="text-2xl font-bold font-mono text-foreground">
            {formatTime(timeRemaining)}
          </p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-muted-foreground uppercase font-mono">Conquered</p>
          <p className="text-2xl font-bold font-mono text-foreground">
            {formatArea(totalArea)}
          </p>
        </div>
      </div>
      <div className="my-2 border-t border-border/50" />
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground font-mono">Walked</p>
          <p className="font-bold font-mono text-sm text-foreground">
            {formatDistance(totalWalked)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-mono">Calories</p>
          <p className="font-bold font-mono text-sm text-foreground">
            {caloriesBurned.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-mono">Territories</p>
          <p className="font-bold font-mono text-sm text-foreground">
            {territoriesCount}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default GameHUD;
