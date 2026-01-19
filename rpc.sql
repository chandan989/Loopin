-- =============================================
-- Helper RPCs for WebServer
-- =============================================

-- 1. ensure_player
-- Gets existing player or creates a new one with defaults.
CREATE OR REPLACE FUNCTION ensure_player(
    p_wallet VARCHAR,
    p_username_default VARCHAR
)
RETURNS TABLE (
    id UUID,
    username VARCHAR,
    wallet_address VARCHAR
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_player_id UUID;
    v_username VARCHAR;
BEGIN
    -- Check if exists
    SELECT p.id, p.username INTO v_player_id, v_username
    FROM players p
    WHERE p.wallet_address = p_wallet;

    IF v_player_id IS NOT NULL THEN
        RETURN QUERY SELECT v_player_id, v_username, p_wallet;
        RETURN;
    END IF;

    -- Create new
    INSERT INTO players (wallet_address, username, level, joined_at)
    VALUES (p_wallet, p_username_default, 1, NOW())
    RETURNING players.id INTO v_player_id;

    -- Initialize stats
    INSERT INTO player_stats (player_id) VALUES (v_player_id);

    RETURN QUERY SELECT v_player_id, p_username_default, p_wallet;
END;
$$;

-- 2. join_game
-- Adds player to game participants
CREATE OR REPLACE FUNCTION join_game(
    p_player_id UUID,
    p_game_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- Cleanup previous state for this game if re-joining
    DELETE FROM player_trails WHERE player_id = p_player_id AND game_id = p_game_id;
    DELETE FROM player_territories WHERE player_id = p_player_id AND game_id = p_game_id;

    INSERT INTO game_participants (game_id, player_id, joined_at)
    VALUES (p_game_id, p_player_id, NOW())
    ON CONFLICT (game_id, player_id) DO NOTHING;
END;
$$;

-- 3. record_game_result
-- Updates history and stats
CREATE OR REPLACE FUNCTION record_game_result(
    p_game_id UUID,
    p_player_id UUID,
    p_rank INTEGER,
    p_area FLOAT,
    p_prize FLOAT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert history
    INSERT INTO player_game_history (player_id, game_id, rank, area_captured, prize_won, played_at)
    VALUES (p_player_id, p_game_id, p_rank, p_area, p_prize, NOW());

    -- Update stats
    UPDATE player_stats
    SET 
        games_played = games_played + 1,
        games_won = games_won + (CASE WHEN p_rank = 1 THEN 1 ELSE 0 END),
        total_area = total_area + p_area,
        total_earnings = total_earnings + p_prize
    WHERE player_id = p_player_id;
END;
$$;

-- 4. get_active_trails
-- Returns GeoJSON of all trails for a specific game
CREATE OR REPLACE FUNCTION get_active_trails(p_game_id UUID)
RETURNS TABLE (
    player_id UUID,
    path JSON
)
LANGUAGE sql
AS $$
    SELECT player_id, ST_AsGeoJSON(trail)::json
    FROM player_trails
    WHERE game_id = p_game_id;
$$;

-- 5. get_active_territories
-- Returns GeoJSON of all territories for a specific game
CREATE OR REPLACE FUNCTION get_active_territories(p_game_id UUID)
RETURNS TABLE (
    player_id UUID,
    polygon JSON,
    area_sqm FLOAT
)
LANGUAGE sql
AS $$
    SELECT player_id, ST_AsGeoJSON(territory)::json, area_sqm
    FROM player_territories
    WHERE game_id = p_game_id;
$$;

-- 6. get_safe_points_geojson
CREATE OR REPLACE FUNCTION get_safe_points_geojson()
RETURNS TABLE (
    id UUID,
    location JSON,
    radius FLOAT,
    type VARCHAR
)
LANGUAGE sql
AS $$
    SELECT id, ST_AsGeoJSON(location)::json, radius, "type"
    FROM safe_points;
$$;

-- 7. sever_player_trail
-- Resets a player's trail to its start point (used to resolve deadlocks)
CREATE OR REPLACE FUNCTION sever_player_trail(
    p_game_id UUID,
    p_player_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM player_trails 
    WHERE player_id = p_player_id AND game_id = p_game_id;
END;
$$;

-- =============================================
-- Core Game Logic (PostGIS)
-- =============================================

-- 7. update_player_position_rpc
-- The heavy lifter: adds point, checks loops, checks collisions.
-- Returns events table.
CREATE OR REPLACE FUNCTION update_player_position_rpc(
    p_game_id UUID,
    p_player_id UUID,
    p_lat FLOAT,
    p_lng FLOAT,
    p_shielded_ids UUID[] -- List of players with active shields
)
RETURNS TABLE (
    event_type VARCHAR,
    attacker_id UUID,
    victim_id UUID,
    area_added FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_point GEOGRAPHY;
    v_old_trail GEOGRAPHY;
    v_new_trail GEOGRAPHY;
    v_is_valid BOOLEAN;
    v_loop_poly GEOGRAPHY;
    v_area FLOAT;
    r RECORD;
BEGIN
    -- Construct point
    v_point := ST_Point(p_lng, p_lat)::geography;

    -- Get existing trail for THIS game
    SELECT trail INTO v_old_trail 
    FROM player_trails 
    WHERE player_id = p_player_id AND game_id = p_game_id;

    IF v_old_trail IS NULL THEN
        -- Start new trail with 2 points (approx current pos)
        v_new_trail := ST_MakeLine(v_point::geometry, v_point::geometry)::geography;
        INSERT INTO player_trails (player_id, game_id, trail) VALUES (p_player_id, p_game_id, v_new_trail);
        RETURN;
    END IF;

    -- Append point to trail
    v_new_trail := ST_AddPoint(v_old_trail::geometry, v_point::geometry)::geography;

    -- Update trail in DB
    UPDATE player_trails SET trail = v_new_trail WHERE player_id = p_player_id AND game_id = p_game_id;

    -- 1. Check Loop Closure (Closed Ring OR Self-Intersection)
    v_is_valid := ST_IsSimple(v_new_trail::geometry);
    
    IF (NOT v_is_valid) OR (ST_IsClosed(v_new_trail::geometry) AND ST_NumPoints(v_new_trail::geometry) >= 4) THEN
        -- It closed!
        BEGIN
            -- Try strict polygon first
            IF ST_IsClosed(v_new_trail::geometry) THEN
                 v_loop_poly := ST_MakePolygon(v_new_trail::geometry)::geography;
            ELSE
                 -- Fallback for self-intersecting "mess" -> Convex Hull (Gamey)
                 v_loop_poly := ST_ConvexHull(v_new_trail::geometry)::geography;
            END IF;

            v_area := ST_Area(v_loop_poly);
            
            IF v_area > 10 THEN -- Filter noise
                -- Insert Territory
                INSERT INTO player_territories (player_id, game_id, territory, area_sqm)
                VALUES (p_player_id, p_game_id, v_loop_poly, v_area);
                
                -- Reset Trail (Start fresh at current point)
                UPDATE player_trails 
                SET trail = ST_MakeLine(v_point::geometry, v_point::geometry)::geography 
                WHERE player_id = p_player_id AND game_id = p_game_id;
                
                RETURN QUERY SELECT 'territory_captured'::VARCHAR, p_player_id, NULL::UUID, v_area;
                RETURN; -- Stop processing for this update
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- If MakePolygon fails, fallback to Hull
             BEGIN
                v_loop_poly := ST_ConvexHull(v_new_trail::geometry)::geography;
                v_area := ST_Area(v_loop_poly);
                IF v_area > 10 THEN
                     INSERT INTO player_territories (player_id, game_id, territory, area_sqm)
                     VALUES (p_player_id, p_game_id, v_loop_poly, v_area);
                     UPDATE player_trails 
                     SET trail = ST_MakeLine(v_point::geometry, v_point::geometry)::geography 
                     WHERE player_id = p_player_id AND game_id = p_game_id;
                     
                     RETURN QUERY SELECT 'territory_captured'::VARCHAR, p_player_id, NULL::UUID, v_area;
                     RETURN;
                END IF;
             EXCEPTION WHEN OTHERS THEN
                NULL; -- Ignore geometry errors
             END;
        END;
    END IF;

    -- 2. Check Collision with Others (Trail Severing)
    -- Iterate over other players' trails IN THIS GAME ONLY
    FOR r IN 
        SELECT player_id, trail 
        FROM player_trails 
        WHERE player_id != p_player_id AND game_id = p_game_id
    LOOP
        -- If intersects
        IF ST_Intersects(v_new_trail, r.trail) THEN
            -- Check Shield
            IF NOT (r.player_id = ANY(p_shielded_ids)) THEN
                -- DEADLOCK FIX: Do NOT update victim row here.
                -- Just return the event, and let the application server call sever_player_trail separately.
                
                RETURN QUERY SELECT 'trail_severed'::VARCHAR, p_player_id, r.player_id, 0.0::FLOAT;
            END IF;
        END IF;
    END LOOP;

    RETURN;
END;
$$;
