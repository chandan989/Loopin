import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Button } from '@/components/ui/button';
import {
  Flame,
  Navigation,
  X,
  Shield,
  Ghost
} from 'lucide-react';

// --- ICONS & STYLES ---
import { MOCK_BOTS, DEFAULT_GAME_CONFIG } from '@/data/mockData';

// --- ICONS & STYLES ---
const createPulseIcon = (color: string, isMe: boolean) => L.divIcon({
  className: 'custom-pulse-icon',
  html: `<div class="relative flex items-center justify-center">
            <div class="absolute w-4 h-4 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>
            <div class="relative w-3 h-3 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}; transform: scale(${isMe ? 1.2 : 1.0})"></div>
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Default start if geo permission denied
const DEFAULT_POS = DEFAULT_GAME_CONFIG.startPos;

const ONE_DEG_IN_METERS = DEFAULT_GAME_CONFIG.degreeToMeters; // Approx

const GamePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Identity
  const [walletAddress] = useState(localStorage.getItem('loopin_wallet') || "mock_wallet_" + Math.floor(Math.random() * 10000));

  // Game State
  const [timeLeft, setTimeLeft] = useState(DEFAULT_GAME_CONFIG.durationSeconds); // 25 min default
  const [myPos, setMyPos] = useState<[number, number]>(DEFAULT_POS);

  // DEBUG STATE
  const [debugInfo, setDebugInfo] = useState({
    rawLat: 0,
    rawLng: 0,
    accuracy: 0,
    updateCount: 0,
    lastError: '',
    droppedUpdates: 0,
    lastDist: 0
  });

  // Local Game State (Offline Mode)
  const [myTrail, setMyTrail] = useState<[number, number][]>([DEFAULT_POS]);
  const [localTerritories, setLocalTerritories] = useState<any[]>([]); // { owner_id, points }
  const [otherPlayers, setOtherPlayers] = useState<any[]>(MOCK_BOTS);

  // Powerup State
  const [activePowerup, setActivePowerup] = useState<'shield' | 'invisibility' | null>(null);

  const mapRef = useRef<L.Map | null>(null);

  // Helper: Distance in meters
  const distMeters = (p1: [number, number], p2: [number, number]) => {
    const dLat = (p2[0] - p1[0]) * ONE_DEG_IN_METERS;
    const dLng = (p2[1] - p1[1]) * ONE_DEG_IN_METERS * Math.cos(p1[0] * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  };

  // Shared Position Logic (Extracted for Simulation)
  const handlePositionUpdate = useCallback((lat: number, lng: number, accuracy: number, source: string) => {
    const newPos: [number, number] = [lat, lng];

    setMyPos(prevPos => {
      const d = distMeters(prevPos, newPos);

      // Update Debug Info inside callback to access latest calculations if needed, 
      // but simpler to do it here.
      setDebugInfo(prev => ({
        ...prev,
        rawLat: lat,
        rawLng: lng,
        accuracy: accuracy,
        updateCount: prev.updateCount + 1,
        lastDist: d,
        droppedUpdates: d < 0.5 ? prev.droppedUpdates + 1 : prev.droppedUpdates,
        lastError: source
      }));

      // Allow smaller movements for marker smoothness
      if (d < 0.5) return prevPos;
      return newPos;
    });

    setMyTrail(prevTrail => {
      // 1. FIRST FIX RESET
      const isDefaultStart = prevTrail.length === 1 &&
        prevTrail[0][0] === DEFAULT_POS[0] &&
        prevTrail[0][1] === DEFAULT_POS[1];

      if (isDefaultStart) return [newPos];

      // 2. DISTANCE THRESHOLD
      const lastPoint = prevTrail[prevTrail.length - 1];
      if (distMeters(lastPoint, newPos) < 2.0) return prevTrail;

      const currentTrail = [...prevTrail, newPos];

      // LOOP DETECTION
      const captureThreshold = 10.0;
      let loopIndex = -1;
      for (let i = currentTrail.length - 10; i >= 0; i--) {
        if (distMeters(currentTrail[i], newPos) < captureThreshold) {
          loopIndex = i;
          break;
        }
      }

      if (loopIndex !== -1) {
        const polyPoints = currentTrail.slice(loopIndex);
        setLocalTerritories(prev => [...prev, {
          owner_id: 'me',
          points: polyPoints.map(p => ({ lat: p[0], lng: p[1] })),
          area: 0
        }]);
        console.log("LOOP CLOSED! Territory captured.");
        return [newPos];
      }

      return currentTrail;
    });
  }, []); // Logic is mostly functional updates, safe to be stable


  // 1. OFFLINE MODE: Geolocation & Local Logic
  useEffect(() => {
    let watchId: number | null = null;
    let isHighAccuracy = true;

    const startWatching = (useHighAction: boolean) => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      isHighAccuracy = useHighAction;

      console.log(`Starting Geo Watcher. High Accuracy: ${useHighAction}`);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          handlePositionUpdate(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy,
            useHighAction ? 'High Acc OK' : 'Low Acc OK'
          );
        },
        (err) => {
          console.error("Geo Error", err);
          setDebugInfo(prev => ({ ...prev, lastError: `${err.message} (Code ${err.code})` }));

          // FALLBACK LOGIC
          if (isHighAccuracy && (err.code === 2 || err.code === 3)) {
            console.warn("High Accuracy failed, switching to Low Accuracy...");
            startWatching(false);
          }
        },
        {
          enableHighAccuracy: useHighAction,
          maximumAge: 1000,
          timeout: 20000
        }
      );
    };

    if (navigator.geolocation) {
      startWatching(true);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [handlePositionUpdate]);


  // SIMULATION HANDLER
  const simulateMove = () => {
    // Generate a new position 5 meters "North-East" roughly
    // 0.00005 deg is approx 5 meters
    const latChange = 0.00005;
    const lngChange = 0.00005;

    // Use current myPos to generate next step
    // Note: myPos is state, so this closure captures current render's myPos.
    // Ensure we aren't using stale closure if this function isn't re-created?
    // GamePage re-renders on myPos change, so this is fine.
    const newLat = myPos[0] + latChange;
    const newLng = myPos[1] + lngChange;

    handlePositionUpdate(newLat, newLng, 10, 'Simulation');
  };


  // 2. OFFLINE MODE: Simulate Bots
  useEffect(() => {
    const interval = setInterval(() => {
      setOtherPlayers(prev => prev.map(bot => {
        // Random Walk
        const latChange = (Math.random() - 0.5) * 0.00005;
        const lngChange = (Math.random() - 0.5) * 0.00005;
        const newPos = {
          lat: bot.position.lat + latChange,
          lng: bot.position.lng + lngChange
        };

        // Bot Trail Logic (Simplified: Grow until 20 points then reset)
        let newTrail = [...bot.trail, newPos];
        if (newTrail.length > 20) {
          // Bot "Banks" it
          // Effectively just clears trail for visual simplicity
          newTrail = [];
        }

        return {
          ...bot,
          position: newPos,
          trail: newTrail
        };
      }));
    }, 500);
    return () => clearInterval(interval);
  }, []);


  // Powerup Handler
  const handlePowerup = (type: 'shield' | 'invisibility') => {
    if (activePowerup === type) {
      setActivePowerup(null);
    } else {
      setActivePowerup(type);
      setTimeout(() => setActivePowerup(null), 8000); // Mock Duration
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer Countdown 
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Recenter Helper
  const Recenter = ({ pos }: { pos: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(pos);
    }, [pos, map]);
    return null;
  };

  // Calculate stats
  const myTerritoryCount = localTerritories.filter(t => t.owner_id === 'me').length;
  // Mock Area Calc
  const myTerritoryArea = myTerritoryCount * 1500.5; // Fake sqm

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white font-sans text-black touch-none">

      {/* --- MAP LAYER (LIGHT) --- */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={myPos}
          zoom={18}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />

          <Recenter pos={myPos} />

          {/* Territories */}
          {localTerritories.map((terr: any, idx: number) => (
            <Polygon
              key={`terr-${idx}`}
              positions={terr.points}
              pathOptions={{
                color: terr.owner_id === 'me' ? '#D4FF00' : '#FF0000',
                fillColor: terr.owner_id === 'me' ? '#D4FF00' : '#FF4444',
                fillOpacity: 0.4,
                weight: 1,
                stroke: false
              }}
            />
          ))}

          {/* ME: Trail & Marker */}
          {myTrail.length > 0 && (
            <Polyline
              positions={myTrail}
              pathOptions={{ color: '#09090B', weight: 4, opacity: 0.8, lineCap: 'round' }}
            />
          )}
          <Marker position={myPos} icon={createPulseIcon('#09090B', true)} />

          {/* BOTS: Trail & Marker */}
          {otherPlayers.map(bot => (
            <React.Fragment key={bot.id}>
              {bot.trail.length > 0 && (
                <Polyline
                  positions={bot.trail.map((p: any) => [p.lat, p.lng])}
                  pathOptions={{ color: bot.color, weight: 3, opacity: 0.6, lineCap: 'round' }}
                />
              )}
              <Marker
                position={[bot.position.lat, bot.position.lng]}
                icon={createPulseIcon(bot.color, false)}
              />
            </React.Fragment>
          ))}

        </MapContainer>
      </div>

      {/* --- TOP HUD --- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt- safe-top">
        <div className="flex justify-between items-start">
          <Button
            size="icon"
            className="bg-[#D4FF00] hover:bg-[#b8dd00] text-black rounded-full shadow-[0_0_20px_rgba(212,255,0,0.3)] border border-[#09090B]/10 transition-transform active:scale-95 w-12 h-12"
            onClick={() => navigate('/dashboard')}
          >
            <X size={24} strokeWidth={2.5} />
          </Button>

          {/* Connection Status Label (Modified for Offline) */}
          <div className="absolute top-16 right-4 bg-gray-800 text-white/50 text-xs px-2 py-1 rounded backdrop-blur">
            OFFLINE MODE
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-white/80 backdrop-blur-xl border border-black/5 px-6 py-2 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#09090B] animate-pulse" />
              <span className="font-display text-2xl font-bold tracking-tight tabular-nums text-black">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-black/5 gap-2 shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border border-white bg-gray-200" />
              ))}
            </div>
            <span className="text-xs font-bold text-black">+{otherPlayers.length + 1}</span>
          </div>
        </div>
      </div>

      {/* --- BOTTOM HUD --- */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8 safe-bottom bg-gradient-to-t from-white/90 via-white/50 to-transparent">

        <div className="mb-4 flex justify-between items-end">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-lg border-l-4 border-[#D4FF00] shadow-sm">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Territory</span>
            <span className="font-display text-2xl font-bold text-black">
              {myTerritoryArea.toFixed(1)} <span className="text-sm text-gray-400">m²</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/90 backdrop-blur rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <Navigation size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Lat/Lng</span>
              </div>
              <div className="font-display text-sm font-bold text-black truncate">
                {myPos[0].toFixed(4)}, {myPos[1].toFixed(4)}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <Flame size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">KCAL</span>
              </div>
              <div className="font-display text-xl font-bold text-black">
                {Math.floor(myTrail.length * 0.5)}
              </div>
            </div>
          </div>

          {/* Powerups Control Panel */}
          <div className="bg-black/80 backdrop-blur-xl p-2 rounded-[24px] border border-white/10 shadow-2xl flex items-center gap-2">

            {/* Shield */}
            <div className="relative group">
              <button
                onClick={() => handlePowerup('shield')}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center transition-all duration-300 relative overflow-hidden ${activePowerup === 'shield'
                  ? 'bg-[#D4FF00] text-black shadow-[0_0_15px_rgba(212,255,0,0.5)]'
                  : 'bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white'
                  }`}
              >
                <Shield
                  size={24}
                  strokeWidth={2.5}
                  className={`relative z-10 transition-transform duration-300`}
                />
              </button>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                Shield
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Stealth */}
            <div className="relative group">
              <button
                onClick={() => handlePowerup('invisibility')}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center transition-all duration-300 relative overflow-hidden ${activePowerup === 'invisibility'
                  ? 'bg-[#b794f4] text-black shadow-[0_0_15px_rgba(183,148,244,0.5)]'
                  : 'bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white'
                  }`}
              >
                <Ghost
                  size={24}
                  strokeWidth={2.5}
                  className={`relative z-10 transition-transform duration-300`}
                />
              </button>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                Stealth
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* DEBUG OVERLAY */}
      <div className="absolute bottom-32 left-4 z-50 bg-black/80 text-[#D4FF00] p-4 rounded font-mono text-xs pointer-events-auto">
        <div>Updates: {debugInfo.updateCount}</div>
        <div>Dropped: {debugInfo.droppedUpdates}</div>
        <div>Lat: {debugInfo.rawLat.toFixed(6)}</div>
        <div>Lng: {debugInfo.rawLng.toFixed(6)}</div>
        <div>Acc: {debugInfo.accuracy.toFixed(1)}m</div>
        <div>Dist: {debugInfo.lastDist.toFixed(2)}m</div>
        {debugInfo.lastError && <div className="text-red-500">{debugInfo.lastError}</div>}
        <Button
          className="mt-2 text-[10px] h-6 px-2 bg-yellow-600 hover:bg-yellow-500 text-white border-none"
          onClick={simulateMove}
        >
          Simulate Move
        </Button>
      </div>

    </div>
  );
};

export default GamePage;
