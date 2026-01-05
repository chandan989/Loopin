import { User, GameSession, PlayerInGame } from './gameTypes';

export const mockUser: User = {
  id: 'user_123',
  walletAddress: 'SP2X0TZ59D5SZ8ACQ6ALSSZTFYN12SWJ1QEYPGKHB',
  stxBalance: 50,
  powerUps: {
    shield: { active: false, count: 0 },
    stealth: { active: false, expiresAt: null, count: 0 }
  }
};

export const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

export const generateMockSession = (id: string, status: GameSession['status'] = 'lobby'): GameSession => {
  // 9 AI players that are always present
  const aiPlayers: PlayerInGame[] = [
    {
      userId: 'bot_1',
      name: 'AI_Runner_42',
      color: PLAYER_COLORS[1],
      trail: [],
      territories: [],
      totalArea: 950,
      isActive: true,
      score: 950,
      rank: 1,
      isShielded: false,
      isStealthed: false,
      kills: 3,
      deaths: 1
    },
    {
      userId: 'bot_2',
      name: 'AI_Loop_Master',
      color: PLAYER_COLORS[2],
      trail: [],
      territories: [],
      totalArea: 880,
      isActive: true,
      score: 880,
      rank: 2,
      isShielded: false,
      isStealthed: false,
      kills: 2,
      deaths: 1
    },
    {
      userId: 'bot_3',
      name: 'AI_Territory_King',
      color: PLAYER_COLORS[3],
      trail: [],
      territories: [],
      totalArea: 820,
      isActive: true,
      score: 820,
      rank: 3,
      isShielded: false,
      isStealthed: false,
      kills: 4,
      deaths: 2
    },
    {
      userId: 'bot_4',
      name: 'AI_Speed_Demon',
      color: PLAYER_COLORS[4],
      trail: [],
      territories: [],
      totalArea: 780,
      isActive: true,
      score: 780,
      rank: 4,
      isShielded: false,
      isStealthed: false,
      kills: 1,
      deaths: 0
    },
    {
      userId: 'bot_5',
      name: 'AI_Capture_Pro',
      color: PLAYER_COLORS[5],
      trail: [],
      territories: [],
      totalArea: 720,
      isActive: true,
      score: 720,
      rank: 5,
      isShielded: false,
      isStealthed: false,
      kills: 3,
      deaths: 2
    },
    {
      userId: 'bot_6',
      name: 'AI_Trail_Blazer',
      color: PLAYER_COLORS[6],
      trail: [],
      territories: [],
      totalArea: 680,
      isActive: true,
      score: 680,
      rank: 6,
      isShielded: false,
      isStealthed: false,
      kills: 2,
      deaths: 3
    },
    {
      userId: 'bot_7',
      name: 'AI_Loop_Hunter',
      color: PLAYER_COLORS[7],
      trail: [],
      territories: [],
      totalArea: 650,
      isActive: true,
      score: 650,
      rank: 7,
      isShielded: false,
      isStealthed: false,
      kills: 1,
      deaths: 2
    },
    {
      userId: 'bot_8',
      name: 'AI_Area_Controller',
      color: PLAYER_COLORS[0],
      trail: [],
      territories: [],
      totalArea: 600,
      isActive: true,
      score: 600,
      rank: 8,
      isShielded: false,
      isStealthed: false,
      kills: 0,
      deaths: 1
    },
    {
      userId: 'bot_9',
      name: 'AI_Last_Stand',
      color: PLAYER_COLORS[1],
      trail: [],
      territories: [],
      totalArea: 550,
      isActive: true,
      score: 550,
      rank: 9,
      isShielded: false,
      isStealthed: false,
      kills: 1,
      deaths: 4
    }
  ];

  // If game is active, add the human player
  const players: PlayerInGame[] = status !== 'lobby' ? [
    // You as the human player
    {
      userId: 'user_123',
      name: 'You',
      color: PLAYER_COLORS[0],
      trail: [],
      territories: [],
      totalArea: 750,
      isActive: true,
      score: 750,
      rank: 5,
      isShielded: false,
      isStealthed: false,
      kills: 2,
      deaths: 1
    },
    ...aiPlayers
  ] : aiPlayers; // In lobby, show only AI players

  // Sort players by score for leaderboard
  const leaderboard = [...players].sort((a, b) => b.score - a.score);
  
  // Update ranks based on sorted leaderboard
  leaderboard.forEach((player, index) => {
    player.rank = index + 1;
  });

  return {
    id,
    status,
    entryFee: 0.5,
    prizePool: status === 'lobby' ? 4.5 : players.length * 0.5, // 9 AI players * 0.5 STX = 4.5 STX
    startTime: new Date().toISOString(),
    duration: 3600, // 60 minutes
    timeRemaining: 3600,
    players,
    maxPlayers: 10,
    gamePhase: status === 'lobby' ? 'waiting' : 'active',
    leaderboard
  };
};
