import { MOCK_ACTIVE_SESSIONS, MOCK_REWARD_STATUS, MOCK_PLAYER_PROFILE } from '@/data/mockData';

// Simple fetch wrapper for now since we don't have axios installed (or verify if we do)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

export interface Game {
    id: string;
    status: string;
    game_type: string;
    entry_fee: number;
    prize_pool: number;
    players: number;
    time_remaining: string;
}

export const api = {
    getLobby: async (): Promise<Game[]> => {
        // MOCK IMPLEMENTATION
        await new Promise(r => setTimeout(r, 500));
        return MOCK_ACTIVE_SESSIONS.map(s => ({
            id: s.id,
            status: 'WAITING',
            game_type: s.type,
            entry_fee: parseFloat(s.entryFee.split(' ')[0]),
            prize_pool: parseFloat(s.prizePool.split(' ')[0]),
            players: s.players,
            time_remaining: s.timeRemaining
        }));
    },

    joinGame: async (gameId: string, walletAddress: string): Promise<{ status: string, player_id: string }> => {
        // MOCK IMPLEMENTATION
        await new Promise(r => setTimeout(r, 800));
        return { status: 'joined', player_id: 'mock-player-id' };
    },

    getDailyRewardStatus: async (walletAddress: string): Promise<RewardStatusResponse> => {
        // MOCK IMPLEMENTATION
        await new Promise(r => setTimeout(r, 600));
        return MOCK_REWARD_STATUS;
    },

    claimDailyReward: async (walletAddress: string): Promise<ClaimResponse> => {
        // MOCK IMPLEMENTATION
        await new Promise(r => setTimeout(r, 1000));
        return {
            success: true,
            reward_amount: 50,
            new_streak: MOCK_REWARD_STATUS.streak + 1,
            new_total_earnings: 1250
        };
    },

    // Player Endpoints
    registerPlayer: async (walletAddress: string, username: string, avatarSeed?: string): Promise<PlayerProfile> => {
        // MOCK IMPLEMENTATION
        await new Promise(r => setTimeout(r, 1000));
        // Simulate "already exists" if we want, but for now just succeed
        return {
            ...MOCK_PLAYER_PROFILE,
            wallet_address: walletAddress,
            username: username,
            avatar_seed: avatarSeed || 'A'
        };
    },

    getPlayer: async (walletAddress: string): Promise<PlayerProfile> => {
        // MOCK IMPLEMENTATION
        await new Promise(r => setTimeout(r, 500));
        return {
            ...MOCK_PLAYER_PROFILE,
            wallet_address: walletAddress
        };
    },

    updatePlayer: async (walletAddress: string, username?: string, avatarSeed?: string): Promise<PlayerProfile> => {
        // MOCK IMPLEMENTATION
        await new Promise(r => setTimeout(r, 800));
        return {
            ...MOCK_PLAYER_PROFILE,
            wallet_address: walletAddress,
            username: username || MOCK_PLAYER_PROFILE.username,
            avatar_seed: avatarSeed || MOCK_PLAYER_PROFILE.avatar_seed
        };
    },

    buyPowerup: async (walletAddress: string, powerupId: string, cost: number): Promise<{ success: boolean, newBalance: number, inventory: Record<string, number> }> => {
        // MOCK IMPLEMENTATION
        await new Promise(r => setTimeout(r, 600));
        // Simulate successful purchase
        const currentInventory = MOCK_PLAYER_PROFILE.inventory || {};
        const newCount = (currentInventory[powerupId] || 0) + 1;

        // Update mock state locally for the session (rudimentary)
        MOCK_PLAYER_PROFILE.inventory = {
            ...currentInventory,
            [powerupId]: newCount
        };

        return {
            success: true,
            newBalance: 245.3 - cost, // Mock balance update
            inventory: MOCK_PLAYER_PROFILE.inventory
        };
    }
};

export interface RewardStatusResponse {
    streak: number;
    claimable: boolean;
    next_reward: number;
    claimed_today: boolean;
    last_claimed_at: string | null;
}

export interface ClaimResponse {
    success: boolean;
    reward_amount: number;
    new_streak: number;
    new_total_earnings: number;
}

export interface PlayerProfile {
    id: string;
    wallet_address: string;
    username: string;
    avatar_seed: string;
    level: number;
    joined_at: string;
    inventory?: Record<string, number>; // itemId -> quantity
}
