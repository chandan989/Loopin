import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ActionDeck, ActionDeckContent, StatDisplay } from '@/components/ui/action-deck';
import SlideToEngage from '@/components/ui/slide-to-engage';
import { GPSMarker, StatusIndicator, SignalStrength } from '@/components/ui/game-indicators';
import {
  Shield,
  Eye,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { MOCK_POWERUPS } from '@/data/mockData';
import { SlideUp, FadeIn, MaskReveal } from '@/components/animation/MotionWrapper';

const GamePage = () => {
  const { sessionId } = useParams();
  const [speed, setSpeed] = React.useState(0);
  const [earnings, setEarnings] = React.useState(0);
  const [showPowerUps, setShowPowerUps] = React.useState(false);

  const shieldPowerUp = MOCK_POWERUPS.find(p => p.id === 'shield');
  const stealthPowerUp = MOCK_POWERUPS.find(p => p.id === 'ghost');

  // Simulate speed changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const change = (Math.random() - 0.5) * 2;
        return Math.max(0, Math.min(20, prev + change));
      });
      setEarnings(prev => prev + 0.001);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEndGame = () => {
    console.log('Game ended');
  };

  const handlePurchasePowerUp = (type: 'shield' | 'stealth') => {
    console.log('Purchased:', type);
    setShowPowerUps(false);
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-fog relative">
      {/* Status Bar - Top 10% */}
      <SlideUp className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between" delay={0.2}>
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon-sm" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <MaskReveal className="rounded-full bg-background/80 backdrop-blur-sm px-1 py-1">
            <StatusIndicator status="live" label="LIVE • 3 RUNNERS" />
          </MaskReveal>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm">
          <SignalStrength strength="strong" />
        </div>
      </SlideUp>

      {/* Map Viewport - 60% */}
      <div className="absolute inset-0" style={{ bottom: '30vh' }}>
        {/* Placeholder Map Background */}
        <div className="absolute inset-0 bg-fog">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px'
            }}
          />

          {/* Simulated Trail */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.8 }}>
            <path
              d="M 100,300 Q 150,200 200,250 T 300,200 T 400,300 T 350,400"
              fill="none"
              stroke="#000"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Enemy Trail */}
            <path
              d="M 250,150 Q 300,250 350,200"
              fill="none"
              stroke="hsl(4, 100%, 59%)"
              strokeWidth="4"
              strokeDasharray="8,4"
              strokeLinecap="round"
            />
            {/* Captured Territory */}
            <path
              d="M 150,350 L 200,300 L 250,350 L 200,400 Z"
              fill="#000"
              fillOpacity="0.1"
              stroke="#000"
              strokeWidth="1"
            />
          </svg>

          {/* STX Beacon */}
          <div className="absolute top-1/3 right-1/4">
            <div
              className="w-2 h-32 rounded-full animate-beacon-glow"
              style={{
                background: 'linear-gradient(to top, hsl(220, 100%, 50%), transparent)'
              }}
            />
          </div>

          {/* User Position */}
          <div className="absolute" style={{ top: '45%', left: '45%' }}>
            <GPSMarker size="lg" pulse />
          </div>
        </div>
      </div>

      {/* Action Deck - Bottom 30% */}
      <ActionDeck>
        <ActionDeckContent>
          {/* Primary Stats */}
          <SlideUp className="flex items-end justify-center gap-12 mb-6" delay={0.4}>
            <StatDisplay
              value={speed.toFixed(1)}
              label="km/h"
              variant="hero"
            />
            <div className="w-px h-16 bg-border" />
            <StatDisplay
              value={earnings.toFixed(3)}
              label="STX Earned"
              variant="crypto"
            />
          </SlideUp>

          {/* Power-ups */}
          <FadeIn className="flex items-center justify-center gap-3 mb-6" delay={0.6}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPowerUps(true)}
            >
              <Shield className="w-4 h-4" />
              Power-ups
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-fog text-sm">
              <Zap className="w-4 h-4 text-volt" />
              <span className="font-medium">No active power-ups</span>
            </div>
          </FadeIn>

          {/* Slide to End */}
          <SlideToEngage
            onComplete={handleEndGame}
            label="Slide to End Game"
          />
        </ActionDeckContent>
      </ActionDeck>

      {/* Power-up Modal */}
      {showPowerUps && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-t-lg p-6 animate-slide-up">
            <h3 className="font-display text-xl font-semibold mb-4 text-center">
              Power-ups
            </h3>

            <div className="space-y-3">
              {shieldPowerUp && (
                <button
                  className="w-full p-4 rounded-md border-2 border-border hover:border-success transition-colors text-left"
                  onClick={() => handlePurchasePowerUp('shield')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-md bg-success/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{shieldPowerUp.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {shieldPowerUp.description}
                      </div>
                    </div>
                    <div className="font-display font-bold text-crypto">{shieldPowerUp.cost}</div>
                  </div>
                </button>
              )}

              {stealthPowerUp && (
                <button
                  className="w-full p-4 rounded-md border-2 border-border hover:border-crypto transition-colors text-left"
                  onClick={() => handlePurchasePowerUp('stealth')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-md bg-crypto/10 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-crypto" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{stealthPowerUp.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {stealthPowerUp.description}
                      </div>
                    </div>
                    <div className="font-display font-bold text-crypto">{stealthPowerUp.cost}</div>
                  </div>
                </button>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowPowerUps(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
