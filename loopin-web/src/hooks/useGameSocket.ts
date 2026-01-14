import { useEffect, useRef, useState } from 'react';

export interface GamePlayer {
    id: string;
    is_me: boolean;
    position: { lat: number; lng: number };
    trail: { lat: number; lng: number }[];
    status: string;
}

export interface GameState {
    tick: number;
    players: GamePlayer[];
    territories: any[]; // Define if needed
}

export const useGameSocket = (gameId: string | null, playerId: string | null) => {
    const socketRef = useRef<WebSocket | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!gameId || !playerId) return;

        // Clean up previous connection
        if (socketRef.current) {
            socketRef.current.close();
        }

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
        const ws = new WebSocket(`${wsUrl}/game/${gameId}?player_id=${playerId}`);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to Game Server");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'game_state') {
                    setGameState({
                        tick: message.tick,
                        players: message.players,
                        territories: message.territories
                    });
                }
            } catch (e) {
                console.error("WS Parse Error", e);
            }
        };

        ws.onclose = () => {
            console.log("Disconnected from Game Server");
            setIsConnected(false);
        };

        return () => {
            ws.close();
        };
    }, [gameId, playerId]);

    const sendPosition = (lat: number, lng: number) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'position_update',
                lat,
                lng
            }));
        }
    };

    return { gameState, isConnected, sendPosition };
};
