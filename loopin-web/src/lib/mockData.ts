import { User, GameSession, PowerUp, PlayerInGame } from './gameTypes';

export const mockUser: User = {
  id: 'user_123',
  walletAddress: 'SP2X0TZ59D5SZ8ACQ6ALSSZTFYN12SWJ1QEYPGKHB',
  stxBalance: 50,
  powerUps: {
    shield: { active: false, count: 0 },
    stealth: { active: false, expiresAt: null, count: 0 }
  }
};

export const POWER_UPS: PowerUp[] = [
  {
    type: 'shield',
    name: 'SHIELD',
    cost: 2,
    description: 'Protect your trail from being cut once',
    icon: 'Shield'
  },
  {
    type: 'stealth',
    name: 'STEALTH',
    cost: 5,
    description: 'Hide your trail for 60 seconds',
    icon: 'Eye'
  }
];

export const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

export const generateMockSession = (id: string, status: GameSession['status'] = 'lobby'): GameSession => {
  const players: PlayerInGame[] = status !== 'lobby' ? [
    {
      userId: 'user_123',
      name: 'You',
      color: PLAYER_COLORS[0],
      trail: [],
      territories: [],
      totalArea: 0,
      isActive: true
    },
    {
      userId: 'bot_1',
      name: 'Runner_42',
      color: PLAYER_COLORS[1],
      trail: [],
      territories: [],
      totalArea: 3200,
      isActive: true
    },
    {
      userId: 'bot_2',
      name: 'Loop_Master',
      color: PLAYER_COLORS[2],
      trail: [],
      territories: [],
      totalArea: 2800,
      isActive: true
    }
  ] : [];

  return {
    id,
    status,
    entryFee: 2,
    prizePool: status === 'lobby' ? 10 : players.length * 2,
    startTime: new Date().toISOString(),
    duration: 3600,
    players,
    maxPlayers: 10
  };
};
