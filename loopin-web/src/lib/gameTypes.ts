export interface User {
  id: string;
  walletAddress: string;
  stxBalance: number;
  powerUps: {
    shield: { active: boolean; count: number };
    stealth: { active: boolean; expiresAt: number | null; count: number };
  };
}

export interface TrailPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface Territory {
  coordinates: [number, number][];
  area: number;
  capturedAt: string;
}

export interface PlayerInGame {
  userId: string;
  name: string;
  color: string;
  trail: TrailPoint[];
  territories: Territory[];
  totalArea: number;
  isActive: boolean;
}

export interface GameSession {
  id: string;
  status: 'lobby' | 'active' | 'ended';
  entryFee: number;
  prizePool: number;
  startTime: string;
  duration: number;
  players: PlayerInGame[];
  maxPlayers: number;
  winner?: string;
}

export type PowerUpType = 'shield' | 'stealth';

export interface PowerUp {
  type: PowerUpType;
  name: string;
  cost: number;
  description: string;
  icon: string;
}
