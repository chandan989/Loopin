/**
 * Local Database using IndexedDB (via Dexie)
 * Stores game data, player progress, and transactions locally
 */

import Dexie, { Table } from 'dexie';

// Database Types
export interface GameSession {
  id: string;
  sessionId: string;
  status: 'lobby' | 'active' | 'ended';
  entryFee: number;
  prizePool: number;
  startTime: string;
  endTime?: string;
  duration: number;
  maxPlayers: number;
  createdAt: number;
  updatedAt: number;
}

export interface PlayerData {
  id?: number;
  sessionId: string;
  playerId: string;
  name: string;
  color: string;
  totalArea: number;
  territoriesCount: number;
  trail: string[]; // H3 cell indices
  territories: string[]; // H3 cell indices
  powerUps: {
    shields: number;
    stealth: number;
  };
  lastPosition?: {
    lat: number;
    lng: number;
  };
  updatedAt: number;
}

export interface Transaction {
  id?: number;
  txId: string;
  type: 'join-game' | 'buy-shield' | 'buy-stealth' | 'end-game';
  sessionId: string;
  playerId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockHeight?: number;
  timestamp: number;
  errorMessage?: string;
}

export interface GameEvent {
  id?: number;
  sessionId: string;
  playerId: string;
  eventType: 'trail-cut' | 'territory-captured' | 'powerup-used' | 'player-joined';
  data: any;
  timestamp: number;
}

// Database Class
class LoopinDatabase extends Dexie {
  gameSessions!: Table<GameSession, string>;
  players!: Table<PlayerData, number>;
  transactions!: Table<Transaction, number>;
  gameEvents!: Table<GameEvent, number>;

  constructor() {
    super('LoopinGameDB');
    
    // Define schema
    this.version(1).stores({
      gameSessions: 'id, sessionId, status, createdAt',
      players: '++id, sessionId, playerId, updatedAt',
      transactions: '++id, txId, sessionId, playerId, type, status, timestamp',
      gameEvents: '++id, sessionId, playerId, eventType, timestamp'
    });
  }
}

// Create database instance
export const db = new LoopinDatabase();

// ===================================================================
// DATABASE OPERATIONS
// ===================================================================

// --- GAME SESSIONS ---

export async function saveGameSession(session: GameSession) {
  return await db.gameSessions.put({
    ...session,
    updatedAt: Date.now()
  });
}

export async function getGameSession(sessionId: string) {
  return await db.gameSessions.get(sessionId);
}

export async function getAllGameSessions() {
  return await db.gameSessions.orderBy('createdAt').reverse().toArray();
}

export async function updateGameSessionStatus(sessionId: string, status: GameSession['status']) {
  return await db.gameSessions.update(sessionId, {
    status,
    updatedAt: Date.now()
  });
}

// --- PLAYERS ---

export async function savePlayerData(player: PlayerData) {
  if (player.id) {
    return await db.players.update(player.id, {
      ...player,
      updatedAt: Date.now()
    });
  } else {
    return await db.players.add({
      ...player,
      updatedAt: Date.now()
    });
  }
}

export async function getPlayerData(sessionId: string, playerId: string) {
  return await db.players
    .where({ sessionId, playerId })
    .first();
}

export async function getAllPlayersInSession(sessionId: string) {
  return await db.players
    .where('sessionId')
    .equals(sessionId)
    .toArray();
}

export async function updatePlayerArea(sessionId: string, playerId: string, area: number, territoriesCount: number) {
  const player = await getPlayerData(sessionId, playerId);
  if (player?.id) {
    return await db.players.update(player.id, {
      totalArea: area,
      territoriesCount,
      updatedAt: Date.now()
    });
  }
}

export async function updatePlayerTrail(sessionId: string, playerId: string, trail: string[]) {
  const player = await getPlayerData(sessionId, playerId);
  if (player?.id) {
    return await db.players.update(player.id, {
      trail,
      updatedAt: Date.now()
    });
  }
}

export async function updatePlayerTerritories(sessionId: string, playerId: string, territories: string[]) {
  const player = await getPlayerData(sessionId, playerId);
  if (player?.id) {
    return await db.players.update(player.id, {
      territories,
      updatedAt: Date.now()
    });
  }
}

// --- TRANSACTIONS ---

export async function saveTransaction(tx: Transaction) {
  return await db.transactions.add(tx);
}

export async function updateTransactionStatus(
  txId: string, 
  status: Transaction['status'], 
  blockHeight?: number,
  errorMessage?: string
) {
  const tx = await db.transactions.where('txId').equals(txId).first();
  if (tx?.id) {
    return await db.transactions.update(tx.id, {
      status,
      blockHeight,
      errorMessage
    });
  }
}

export async function getTransaction(txId: string) {
  return await db.transactions.where('txId').equals(txId).first();
}

export async function getPlayerTransactions(playerId: string) {
  return await db.transactions
    .where('playerId')
    .equals(playerId)
    .reverse()
    .sortBy('timestamp');
}

export async function getPendingTransactions() {
  return await db.transactions
    .where('status')
    .equals('pending')
    .toArray();
}

// --- GAME EVENTS ---

export async function saveGameEvent(event: GameEvent) {
  return await db.gameEvents.add(event);
}

export async function getGameEvents(sessionId: string) {
  return await db.gameEvents
    .where('sessionId')
    .equals(sessionId)
    .sortBy('timestamp');
}

export async function getPlayerEvents(sessionId: string, playerId: string) {
  return await db.gameEvents
    .where({ sessionId, playerId })
    .sortBy('timestamp');
}

// --- UTILITY FUNCTIONS ---

export async function clearAllData() {
  await db.gameSessions.clear();
  await db.players.clear();
  await db.transactions.clear();
  await db.gameEvents.clear();
}

export async function clearSession(sessionId: string) {
  await db.gameSessions.where('sessionId').equals(sessionId).delete();
  await db.players.where('sessionId').equals(sessionId).delete();
  await db.transactions.where('sessionId').equals(sessionId).delete();
  await db.gameEvents.where('sessionId').equals(sessionId).delete();
}

export async function getStorageStats() {
  return {
    sessions: await db.gameSessions.count(),
    players: await db.players.count(),
    transactions: await db.transactions.count(),
    events: await db.gameEvents.count()
  };
}

// Export database instance as default
export default db;


