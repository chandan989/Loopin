-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    on_chain_id INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'lobby',
    game_type VARCHAR(20) DEFAULT 'CASUAL', -- BLITZ, ELITE, CASUAL
    max_players INTEGER DEFAULT 10,
    entry_fee FLOAT DEFAULT 0.0,
    prize_pool FLOAT DEFAULT 0.0,
    start_time TIMESTAMP,
    end_time TIMESTAMP
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) UNIQUE,
    avatar_seed VARCHAR(100),
    level INTEGER DEFAULT 1,
    joined_at TIMESTAMP DEFAULT NOW()
);

-- Create game_participants table
CREATE TABLE IF NOT EXISTS game_participants (
    game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (game_id, player_id)
);

-- Create indexes for players
CREATE INDEX IF NOT EXISTS idx_players_wallet_address ON players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);

-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    total_area FLOAT DEFAULT 0.0,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_earnings FLOAT DEFAULT 0.0,
    longest_trail FLOAT DEFAULT 0.0,
    biggest_loop FLOAT DEFAULT 0.0,
    current_streak INTEGER DEFAULT 0
);

-- Create player_game_history table
CREATE TABLE IF NOT EXISTS player_game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    game_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    rank INTEGER,
    area_captured FLOAT,
    prize_won FLOAT,
    played_at TIMESTAMP DEFAULT NOW()
);

-- Create powerups table
CREATE TABLE IF NOT EXISTS powerups (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'shield', 'ghost'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cost FLOAT NOT NULL DEFAULT 0.0,
    type VARCHAR(20) NOT NULL -- defense, offense, stealth, bonus
);

-- Create player_powerups table (inventory)
CREATE TABLE IF NOT EXISTS player_powerups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    powerup_id VARCHAR(50) NOT NULL REFERENCES powerups(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    equipped BOOLEAN DEFAULT FALSE,
    UNIQUE(player_id, powerup_id)
);

-- Create player_trails table
CREATE TABLE IF NOT EXISTS player_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    trail GEOGRAPHY(LINESTRING, 4326) NOT NULL
);

-- Create player_territories table
CREATE TABLE IF NOT EXISTS player_territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    territory GEOGRAPHY(POLYGON, 4326) NOT NULL,
    area_sqm FLOAT NOT NULL
);

-- Create sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255)
);

-- Create sponsored_locations table
CREATE TABLE IF NOT EXISTS sponsored_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
    name VARCHAR(255),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    bid_price FLOAT DEFAULT 0.0
);

-- Create leaderboard_all_time view
CREATE OR REPLACE VIEW leaderboard_all_time AS
SELECT
    RANK() OVER (ORDER BY ps.total_area DESC) as rank,
    p.username,
    p.wallet_address,
    ps.total_area,
    ps.games_won,
    ps.total_earnings
FROM player_stats ps
JOIN players p ON ps.player_id = p.id;