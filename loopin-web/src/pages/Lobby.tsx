import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Trophy, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockUser, generateMockSession } from '@/lib/mockData';

const Lobby = () => {
  const navigate = useNavigate();
  const [user] = useState(mockUser);
  const [walletConnected, setWalletConnected] = useState(false);
  const currentSession = generateMockSession('session_1', 'lobby');

  const handleConnectWallet = () => {
    setWalletConnected(true);
  };

  const handleJoinGame = () => {
    if (user.stxBalance >= currentSession.entryFee) {
      navigate('/game/session_1');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK
              </Button>
            </Link>
            
            <h1 className="text-2xl font-black uppercase font-mono">
              LOOPIN
            </h1>

            {walletConnected ? (
              <div className="flex items-center gap-3 bg-lime/10 border border-lime/20 rounded-lg px-4 py-2">
                <Wallet className="w-4 h-4 text-lime" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground font-mono">BALANCE</p>
                  <p className="font-bold font-mono">{user.stxBalance} STX</p>
                </div>
              </div>
            ) : (
              <Button variant="lime" size="sm" onClick={handleConnectWallet}>
                CONNECT WALLET
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black uppercase">
            GAME LOBBY
          </h2>
          <div className="h-1 w-24 bg-lime mx-auto" />
          <p className="text-muted-foreground text-lg">
            Join an active game session and start capturing territory
          </p>
        </div>

        {/* Wallet Warning */}
        {!walletConnected && (
          <Card className="p-6 mb-8 border-lime/20 bg-lime/5">
            <div className="flex items-start gap-4">
              <Wallet className="w-6 h-6 text-lime flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold uppercase font-mono mb-2">
                  WALLET REQUIRED
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect your Stacks wallet to join game sessions and compete for prizes.
                </p>
                <Button variant="lime" size="sm" onClick={handleConnectWallet}>
                  CONNECT NOW
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Game Session */}
        <Card className="p-8 border-lime hover:glow-lime transition-all duration-300">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-lime animate-pulse-glow" />
                  <span className="font-mono text-sm tracking-wide uppercase text-lime">
                    ACTIVE NOW
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase font-mono mb-2">
                  DOWNTOWN CONQUEST
                </h3>
                <p className="text-muted-foreground">
                  Session ID: {currentSession.id}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-3xl font-black text-lime font-mono">
                  {currentSession.entryFee} STX
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  ENTRY FEE
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-lime" />
                  <p className="text-2xl font-bold font-mono">
                    {currentSession.prizePool}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground uppercase font-mono">
                  Prize Pool (STX)
                </p>
              </div>

              <div className="text-center border-x border-border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-lime" />
                  <p className="text-2xl font-bold font-mono">
                    {currentSession.players.length}/{currentSession.maxPlayers}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground uppercase font-mono">
                  Players
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-lime" />
                  <p className="text-2xl font-bold font-mono">
                    60
                  </p>
                </div>
                <p className="text-xs text-muted-foreground uppercase font-mono">
                  Minutes
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold uppercase font-mono text-sm">
                GAME RULES
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-lime">→</span>
                  Draw trails by moving in the real world (or use GPS simulation)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime">→</span>
                  Close loops to capture territory and earn area points
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime">→</span>
                  Cut enemy trails to disrupt their progress
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime">→</span>
                  Player with most territory when timer ends wins the prize pool
                </li>
              </ul>
            </div>

            <Button
              variant="lime"
              size="lg"
              className="w-full"
              onClick={handleJoinGame}
              disabled={!walletConnected || user.stxBalance < currentSession.entryFee}
            >
              {!walletConnected 
                ? 'CONNECT WALLET TO JOIN'
                : user.stxBalance < currentSession.entryFee
                  ? 'INSUFFICIENT BALANCE'
                  : 'JOIN GAME - ' + currentSession.entryFee + ' STX'}
            </Button>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 bg-card/50">
            <h4 className="font-bold uppercase font-mono mb-3 text-sm">
              GPS SIMULATION
            </h4>
            <p className="text-sm text-muted-foreground">
              Can't move around? Use our GPS simulation controls to test the game with virtual movement.
            </p>
          </Card>

          <Card className="p-6 bg-card/50">
            <h4 className="font-bold uppercase font-mono mb-3 text-sm">
              POWER-UPS AVAILABLE
            </h4>
            <p className="text-sm text-muted-foreground">
              Purchase shields and stealth mode during gameplay to gain tactical advantages.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
