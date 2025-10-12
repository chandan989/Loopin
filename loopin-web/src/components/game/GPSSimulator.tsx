import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface GPSSimulatorProps {
  onMove: (direction: 'north' | 'south' | 'east' | 'west') => void;
  onAutoWalk: () => void;
  isAutoWalking: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentPosition: { lat: number; lng: number };
}

const GPSSimulator = ({
  onMove,
  onAutoWalk,
  isAutoWalking,
  speed,
  onSpeedChange,
  currentPosition,
}: GPSSimulatorProps) => {
  const [demoMode, setDemoMode] = useState(true);

  return (
    <Card className="p-4 bg-card/95 backdrop-blur border-lime/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${demoMode ? 'bg-lime animate-pulse-glow' : 'bg-muted'}`} />
            <h3 className="font-bold uppercase font-mono text-sm">
              GPS SIMULATOR
            </h3>
          </div>
          <Button
            variant={demoMode ? "lime" : "outline"}
            size="sm"
            onClick={() => setDemoMode(!demoMode)}
          >
            {demoMode ? 'DEMO ON' : 'DEMO OFF'}
          </Button>
        </div>

        {demoMode && (
          <>
            {/* Movement Controls */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Manual Controls
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onMove('north')}
                  className="hover:border-lime hover:bg-lime/10"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <div />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onMove('west')}
                  className="hover:border-lime hover:bg-lime/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:border-lime hover:bg-lime/10"
                >
                  <Circle className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onMove('east')}
                  className="hover:border-lime hover:bg-lime/10"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onMove('south')}
                  className="hover:border-lime hover:bg-lime/10"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <div />
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Speed
                </p>
                <span className="text-xs font-mono font-bold">
                  {speed === 1 ? 'WALK' : speed === 2 ? 'RUN' : 'DRIVE'}
                </span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={(value) => onSpeedChange(value[0])}
                min={1}
                max={3}
                step={1}
                className="w-full"
              />
            </div>

            {/* Auto Walk */}
            <Button
              variant={isAutoWalking ? "lime" : "lime-outline"}
              size="sm"
              onClick={onAutoWalk}
              className="w-full"
            >
              {isAutoWalking ? (
                <>
                  <Pause className="w-4 h-4" />
                  STOP AUTO-WALK
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  START AUTO-WALK
                </>
              )}
            </Button>

            {/* Coordinates Display */}
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground font-mono mb-2">
                CURRENT POSITION
              </p>
              <div className="bg-background/50 rounded p-2 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LAT:</span>
                  <span>{currentPosition.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LNG:</span>
                  <span>{currentPosition.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default GPSSimulator;
