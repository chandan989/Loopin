export interface User {
  id: string;
  walletAddress: string;
  stxBalance: number;
  powerUps: {
    shield: { active: boolean; count: number };
    stealth: { active: boolean; expiresAt: number | null; count: number };
  };
}

export type H3Index = string;

export interface PlayerInGame {
  userId: string;
  name: string;
  color: string;
  trail: H3Index[]; // Unbanked cells claimed in the current run
  trailCoordinates?: [number, number][]; // Actual lat/lng coordinates for trail rendering
  territories: H3Index[]; // Banked cells that are permanently owned
  totalArea: number; // Can now be calculated as territories.length * area_per_cell
  isActive: boolean;
  currentPosition?: { lat: number; lng: number };
  ai?: any;
  score: number; // Total score from captured territories
  rank: number; // Current ranking in the game
  isShielded: boolean; // Shield power-up active
  isStealthed: boolean; // Stealth power-up active
  stealthExpiresAt?: number; // When stealth expires
  kills: number; // Number of enemy trails cut
  deaths: number; // Number of times own trail was cut
}

export interface GameSession {
  id: string;
  status: 'lobby' | 'active' | 'ended';
  entryFee: number;
  prizePool: number;
  startTime: string;
  endTime?: string;
  duration: number; // Game duration in seconds
  timeRemaining: number; // Time remaining in seconds
  players: PlayerInGame[];
  maxPlayers: number;
  winner?: string;
  gamePhase: 'waiting' | 'countdown' | 'active' | 'ending' | 'ended';
  countdownSeconds?: number; // Countdown before game starts
  leaderboard: PlayerInGame[]; // Sorted by score
}

export type PowerUpType = 'shield' | 'stealth';

export interface PowerUp {
  type: PowerUpType;
  name: string;
  cost: number;
  description: string;
  icon: string;
}
