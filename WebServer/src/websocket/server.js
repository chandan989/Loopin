import { WebSocketServer } from 'ws';
import { updatePlayerPosition, getSafePoints, getGameState } from '../services/gameService.js';
import { usePowerup, getPowerupInventory } from '../services/powerupService.js';

// Connection state: Map<WebSocket, { playerId: string, activePowerups: Set<string> }>
const connectionStates = new Map();

export const setupWebSocket = (server) => {
    const wss = new WebSocketServer({ server, path: '/ws/game' });

    console.log('socket server setup on /ws/game');

    wss.on('connection', async (ws, req) => {
        console.log('New client connected');

        // Initialize state
        connectionStates.set(ws, { playerId: null, activePowerups: new Set() });

        // Send initial state
        try {
            const safePoints = await getSafePoints();
            const gameState = await getGameState(); // Raw state

            ws.send(JSON.stringify({
                type: 'init',
                safePoints,
                gameState
            }));
        } catch (e) {
            console.error('Error sending init state:', e);
        }

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === 'position_update') {
                    const { playerId, lat, lng } = data;
                    if (playerId && lat && lng) {
                        // Associate WS with PlayerID
                        const state = connectionStates.get(ws);
                        if (state) state.playerId = playerId;

                        // Gather Shielded Players
                        const shieldedPlayerIds = [];
                        for (const [sWs, sState] of connectionStates.entries()) {
                            if (sState.playerId && sState.activePowerups.has('shield')) {
                                shieldedPlayerIds.push(sState.playerId);
                            }
                        }

                        // Process Game Mechanics
                        const events = await updatePlayerPosition(playerId, lat, lng, shieldedPlayerIds);

                        // Broadcast State (Customized per client for Stealth)
                        // We fetch the full fresh state once
                        const baseGameState = await getGameState();
                        broadcastGameState(wss, baseGameState, connectionStates);

                        // Broadcast events (like captured) to all
                        if (events && events.length > 0) {
                            events.forEach(event => {
                                broadcastToAll(wss, event);
                            });
                        }
                    }
                }
                else if (data.type === 'use_powerup') {
                    const { playerId, powerupId } = data;
                    // Validate and Decrement Inventory
                    const success = await usePowerup(playerId, powerupId);

                    if (success) {
                        const state = connectionStates.get(ws);
                        if (state) {
                            state.activePowerups.add(powerupId);
                            // Set timeout to remove it (e.g. 60s)
                            setTimeout(() => {
                                if (connectionStates.has(ws)) {
                                    connectionStates.get(ws).activePowerups.delete(powerupId);
                                }
                            }, 60000);
                        }

                        // Notify user
                        ws.send(JSON.stringify({ type: 'powerup_activated', powerupId }));
                    }
                }
            } catch (err) {
                console.error('Error processing message:', err);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            connectionStates.delete(ws);
        });
    });
};

// Customized Broadcast
const broadcastGameState = (wss, baseState, states) => {
    // console.log(`Broadcasting state to ${wss.clients.size} clients`);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            const recipientState = states.get(client);
            const recipientId = recipientState ? recipientState.playerId : 'anon';

            // console.log(`Sending to ${recipientId}`);

            // Filter Players
            // baseState.players contains basic info. 
            // We need to merge with activePowerups from our memory map

            // 1. Create a map of active powerups by player ID
            const powerupMap = new Map();
            for (const [ws, s] of states.entries()) {
                if (s.playerId) powerupMap.set(s.playerId, s.activePowerups);
            }

            const visiblePlayers = baseState.players.filter(p => {
                const pPowerups = powerupMap.get(p.id) || new Set();
                const isInvisible = pPowerups.has('invisibility'); // or 'stealth'
                const isMe = p.id === recipientId;

                // Show if: It's ME, OR they are NOT invisible
                return isMe || !isInvisible;
            }).map(p => ({
                ...p,
                powerups: Array.from(powerupMap.get(p.id) || [])
            }));

            // Filter Trails
            const visibleTrails = baseState.trails.filter(t => {
                const pPowerups = powerupMap.get(t.playerId) || new Set();
                const isInvisible = pPowerups.has('invisibility');
                const isMe = t.playerId === recipientId;
                return isMe || !isInvisible;
            });

            const payload = {
                type: 'game_state_update',
                state: {
                    ...baseState,
                    players: visiblePlayers,
                    trails: visibleTrails
                    // territories are always visible
                }
            };

            // try {
            //     console.log(`Payload for ${recipientId}: trails=${visibleTrails.length}`);
            //     client.send(JSON.stringify(payload));
            // } catch (err) {
            //     console.error(`Send Failed to ${recipientId}:`, err);
            // }
            client.send(JSON.stringify(payload));
        }
    });
};

const broadcastToAll = (wss, data) => {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(msg);
    });
};
