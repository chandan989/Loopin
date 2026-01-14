import React, { useEffect, useState, useRef } from 'react';
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
const DEFAULT_POS: [number, number] = [40.785091, -73.968285];

const ONE_DEG_IN_METERS = 111320; // Approx

const GamePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Identity
  const [walletAddress] = useState(localStorage.getItem('loopin_wallet') || "mock_wallet_" + Math.floor(Math.random() * 10000));

  // Game State
  const [timeLeft, setTimeLeft] = useState(1500); // 25 min default
  const [myPos, setMyPos] = useState<[number, number]>(DEFAULT_POS);

  // Local Game State (Offline Mode)
  const [myTrail, setMyTrail] = useState<[number, number][]>([DEFAULT_POS]);
  const [localTerritories, setLocalTerritories] = useState<any[]>([]); // { owner_id, points }
  const [otherPlayers, setOtherPlayers] = useState<any[]>([
    { id: 'bot-1', position: { lat: DEFAULT_POS[0] + 0.001, lng: DEFAULT_POS[1] + 0.001 }, trail: [], is_me: false, color: '#FF4444' },
    { id: 'bot-2', position: { lat: DEFAULT_POS[0] - 0.001, lng: DEFAULT_POS[1] - 0.0005 }, trail: [], is_me: false, color: '#8844FF' },
    { id: 'bot-3', position: { lat: DEFAULT_POS[0] + 0.0005, lng: DEFAULT_POS[1] - 0.0015 }, trail: [], is_me: false, color: '#FF8844' }
  ]);

  // Powerup State
  const [activePowerup, setActivePowerup] = useState<'shield' | 'invisibility' | null>(null);

  const mapRef = useRef<L.Map | null>(null);

  // 1. OFFLINE MODE: Geolocation & Local Logic
  useEffect(() => {
    let watchId: number;

    // Helper: Distance in meters
    const distMeters = (p1: [number, number], p2: [number, number]) => {
      const dLat = (p2[0] - p1[0]) * ONE_DEG_IN_METERS;
      const dLng = (p2[1] - p1[1]) * ONE_DEG_IN_METERS * Math.cos(p1[0] * Math.PI / 180);
      return Math.sqrt(dLat * dLat + dLng * dLng);
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos: [number, number] = [latitude, longitude];

          setMyPos(prevPos => {
            const d = distMeters(prevPos, newPos);
            if (d < 1.0) return prevPos; // Too small movement, ignore drift
            return newPos;
          });

          // UPDATE TRAIL & CHECK LOOP
          setMyTrail(prevTrail => {
            // Add new point
            const currentTrail = [...prevTrail, newPos];

            // LOOP DETECTION
            // Check if newPos matches any existing point in trail (excluding last 5 points)
            // Threshold: 10 meters
            const captureThreshold = 10.0;

            // We search backwards from end-10
            let loopIndex = -1;
            for (let i = currentTrail.length - 10; i >= 0; i--) {
              if (distMeters(currentTrail[i], newPos) < captureThreshold) {
                loopIndex = i;
                break;
              }
            }

            if (loopIndex !== -1) {
              // Captured!
              // Extract polygon points: trail[loopIndex:] + newPos
              const polyPoints = currentTrail.slice(loopIndex);

              // Add to territories
              setLocalTerritories(prev => [...prev, {
                owner_id: 'me',
                points: polyPoints.map(p => ({ lat: p[0], lng: p[1] })),
                area: 0 // Mock
              }]);

              // Reset Trail to just the current pos
              console.log("LOOP CLOSED! Territory captured.");
              return [newPos];
            }

            return currentTrail;
          });

        },
        (err) => {
          console.error("Geo Error", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []); // Run once on mount


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

    </div>
  );
};

export default GamePage;
