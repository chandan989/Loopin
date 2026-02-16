// Player Profile Type
export interface PlayerProfile {
    id: string;
    wallet_address: string;
    username: string;
    avatar_seed: string;
    level: number;
    joined_at: string;
}

// Player Stats Type
export interface PlayerStats {
    player_id: string;
    total_area: number;
    games_played: number;
    games_won: number;
    total_earnings: number;
    current_streak: number;
}

// Game Session Type
export interface GameSession {
    id: string;
    game_type: string;
    status: string;
    max_players: number;
    entry_fee: number;
    prize_pool: number;
    creator_wallet: string;
    created_at: string;
    start_time?: string;
    end_time?: string;
}

// Game Participant Type
export interface GameParticipant {
    id: string;
    game_id: string;
    player_id: string;
    area_captured: number;
    rank: number;
    prize_won: number;
    joined_at: string;
}
