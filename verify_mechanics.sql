-- Verification Script for Game Mechanics
-- Run this in your Supabase SQL Editor or psql console

BEGIN;

-- 1. Setup Mock Data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create temp tables if needed, or just insert into actual tables with rollback?
-- Let's use a temporary function to test the logic without polluting the DB, 
-- or we assume we can insert dummy data.
-- Since the RPC relies on `player_trails` and `player_territories`, we need to insert real rows.
-- We will use a transaction and ROLLBACK at the end so no data is persisted.

-- Mock Game & Player
INSERT INTO game_sessions (id, game_type, status) VALUES ('00000000-0000-0000-0000-000000000001', 'custom', 'active') ON CONFLICT DO NOTHING;
INSERT INTO players (id, username, wallet_address) VALUES ('00000000-0000-0000-0000-000000000001', 'Tester', '0x123') ON CONFLICT DO NOTHING;
INSERT INTO game_participants (game_id, player_id) VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;

-- TEST CASE 1: Simple Loop (Triangle)
-- ---------------------------------------------------
RAISE NOTICE 'Test 1: Simple Loop';
-- Clear state
DELETE FROM player_trails WHERE player_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM player_territories WHERE player_id = '00000000-0000-0000-0000-000000000001';

-- Move 1: Start
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0, 0, ARRAY[]::UUID[]);
-- Move 2: Up
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0.001, 0, ARRAY[]::UUID[]);
-- Move 3: Right
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0, 0.001, ARRAY[]::UUID[]);
-- Move 4: Close Loop (Back to Start)
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0, 0, ARRAY[]::UUID[]);

-- Check result: Should have 1 territory
IF EXISTS (SELECT 1 FROM player_territories WHERE player_id = '00000000-0000-0000-0000-000000000001') THEN
    RAISE NOTICE 'PASS: Territory created for simple loop.';
ELSE
    RAISE NOTICE 'FAIL: No territory for simple loop.';
END IF;


-- TEST CASE 2: Messy Line (Self-Intersection without Loop) - "The 3 Slides Issue"
-- ---------------------------------------------------
RAISE NOTICE 'Test 2: Messy Line (No Loop)';
-- Clear state
DELETE FROM player_trails WHERE player_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM player_territories WHERE player_id = '00000000-0000-0000-0000-000000000001';

-- Move 1: Start
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0, 0, ARRAY[]::UUID[]);
-- Move 2: Up
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0.001, 0, ARRAY[]::UUID[]);
-- Move 3: Right
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0.001, 0.001, ARRAY[]::UUID[]);
-- Move 4: Down (but cross the first line slightly due to jitter? No, let's just make a U shape)
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0, 0.001, ARRAY[]::UUID[]);
-- Move 5: Turn Left towards start but don't reach it.
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0.0005, 0.0005, ARRAY[]::UUID[]); -- Random point inside

-- Check result: Should NOT have territory
IF EXISTS (SELECT 1 FROM player_territories WHERE player_id = '00000000-0000-0000-0000-000000000001') THEN
    RAISE NOTICE 'FAIL: Territory created for open shape! (Old Bug)';
ELSE
    RAISE NOTICE 'PASS: No territory for open shape.';
END IF;

-- TEST CASE 3: Trail Severing (Player A cuts Player B)
-- ---------------------------------------------------
RAISE NOTICE 'Test 3: Trail Severing';
-- Clear state
DELETE FROM player_trails;
DELETE FROM player_territories;

-- Setup Player B (The Victim)
INSERT INTO players (id, username, wallet_address) VALUES ('00000000-0000-0000-0000-000000000002', 'Victim', '0x456') ON CONFLICT DO NOTHING;
INSERT INTO game_participants (game_id, player_id) VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002') ON CONFLICT DO NOTHING;

-- Player B makes a horizontal line
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 0.0005, 0, ARRAY[]::UUID[]);
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 0.0005, 0.002, ARRAY[]::UUID[]); -- Trail from (0.0005, 0) to (0.0005, 0.002)

-- Player A (Attacker) moves vertically to cross it
-- Start below
PERFORM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0, 0.001, ARRAY[]::UUID[]);
-- Move up crossing y=0.0005
-- We need to capture the output to verify the event
DECLARE
    v_event text;
    v_attacker uuid;
    v_victim uuid;
BEGIN
    SELECT event_type, attacker_id, victim_id INTO v_event, v_attacker, v_victim
    FROM update_player_position_rpc('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0.001, 0.001, ARRAY[]::UUID[]);

    IF v_event = 'trail_severed' AND v_victim = '00000000-0000-0000-0000-000000000002' THEN
        RAISE NOTICE 'PASS: Trail severing event detected. Victim: %', v_victim;
    ELSE
        RAISE NOTICE 'FAIL: Trail severing failed. Event: %, Victim: %', v_event, v_victim;
    END IF;
END;

-- Rollback changes
ROLLBACK;
RAISE NOTICE 'Test Complete. Rolled back changes.';
