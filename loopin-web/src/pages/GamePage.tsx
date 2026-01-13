import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Button } from '@/components/ui/button';
import {
  Flame,
  Map as MapIcon,
  Navigation,
  Target,
  Zap,
  X,
  Shield,
  Ghost
} from 'lucide-react';
import { MOCK_POWERUPS } from '@/data/mockData';

// --- ICONS & STYLES ---
// Using Custom divIcons for cleaner look than default markers
const createPulseIcon = (color: string) => L.divIcon({
  className: 'custom-pulse-icon',
  html: `<div class="relative flex items-center justify-center">
            <div class="absolute w-4 h-4 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>
            <div class="relative w-3 h-3 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// --- GAME CONFIG ---
const START_POS: [number, number] = [40.785091, -73.968285]; // Central Park
const GAME_DURATION = 1500; // 25 mins

const GamePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // State
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [myPos, setMyPos] = useState<[number, number]>(START_POS);
  const [myTrail, setMyTrail] = useState<[number, number][]>([START_POS]);
  const [stats, setStats] = useState({ distance: 0, calories: 0, conquered: 0.0 });

  // Powerup State
  const [activePowerup, setActivePowerup] = useState<'shield' | 'invisibility' | null>(null);

  const handlePowerup = (type: 'shield' | 'invisibility') => {
    if (activePowerup === type) {
      setActivePowerup(null); // Toggle off
    } else {
      setActivePowerup(type);
      // In real implementation, this would send a message via WebSocket
      // sendPowerupActivation(type);

      // Auto-deactivate after duration (mock)
      setTimeout(() => setActivePowerup(null), type === 'shield' ? 10000 : 15000);
    }
  };

  // Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
      // Simulate Movement logic here (simplified for demo)
      setMyPos((prev) => {
        const latChange = (Math.random() - 0.5) * 0.0001;
        const lngChange = (Math.random() - 0.5) * 0.0001;
        const newPos: [number, number] = [prev[0] + latChange, prev[1] + lngChange];
        setMyTrail(trail => [...trail, newPos]);
        setStats(s => ({
          distance: s.distance + 0.005,
          calories: s.calories + 0.2,
          conquered: s.conquered + 0.0001
        }));
        return newPos;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const RecenterMap = ({ pos }: { pos: [number, number] }) => {
    const map = useMap();
    useEffect(() => { map.flyTo(pos, map.getZoom()); }, [pos, map]);
    return null;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white font-sans text-black touch-none">

      {/* --- MAP LAYER (LIGHT) --- */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={START_POS}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />

          {/* Trails */}
          <Polyline
            positions={myTrail}
            pathOptions={{ color: '#09090B', weight: 4, opacity: 0.8, lineCap: 'round' }}
          />

          {/* Markers */}
          <Marker position={myPos} icon={createPulseIcon('#09090B')} />

          {/* Fake Enemies */}
          <Marker position={[START_POS[0] + 0.003, START_POS[1] + 0.001]} icon={createPulseIcon('#EF4444')} />

          <RecenterMap pos={myPos} />
        </MapContainer>
      </div>

      {/* --- TOP HUD --- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt- safe-top">
        <div className="flex justify-between items-start">
          {/* Back / Exit */}
          <Button
            size="icon"
            className="bg-[#D4FF00] hover:bg-[#b8dd00] text-black rounded-full shadow-[0_0_20px_rgba(212,255,0,0.3)] border border-[#09090B]/10 transition-transform active:scale-95 w-12 h-12"
            onClick={() => navigate('/dashboard')}
          >
            <X size={24} strokeWidth={2.5} />
          </Button>

          {/* Timer Pill */}
          <div className="flex flex-col items-center">
            <div className="bg-white/80 backdrop-blur-xl border border-black/5 px-6 py-2 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#09090B] animate-pulse" />
              <span className="font-display text-2xl font-bold tracking-tight tabular-nums text-black">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Participants / Live Count */}
          <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-black/5 gap-2 shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border border-white bg-gray-200" />
              ))}
            </div>
            <span className="text-xs font-bold text-black">+12</span>
          </div>
        </div>
      </div>

      {/* --- BOTTOM HUD --- */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8 safe-bottom bg-gradient-to-t from-white/90 via-white/50 to-transparent">

        {/* Conquered Stat Floating above */}
        <div className="mb-4 flex justify-between items-end">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-lg border-l-4 border-[#D4FF00] shadow-sm">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Territory</span>
            <span className="font-display text-2xl font-bold text-black">
              {stats.conquered.toFixed(2)} <span className="text-sm text-gray-400">km²</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-4 items-end">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Distance */}
            <div className="bg-white/90 backdrop-blur rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <Navigation size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">DIST</span>
              </div>
              <div className="font-display text-xl font-bold text-black">
                {stats.distance.toFixed(2)} <span className="text-xs text-gray-400 font-sans">km</span>
              </div>
            </div>

            {/* Calories */}
            <div className="bg-white/90 backdrop-blur rounded-xl p-4 border border-black/5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <Flame size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">KCAL</span>
              </div>
              <div className="font-display text-xl font-bold text-black">
                {Math.floor(stats.calories)}
              </div>
            </div>
          </div>


          {/* Powerups Control Panel */}
          <div className="bg-black/80 backdrop-blur-xl p-2 rounded-[24px] border border-white/10 shadow-2xl flex items-center gap-2">

            {/* Shield Slot */}
            <div className="relative group">
              {/* Countdown Ring (visible when active) */}
              {activePowerup === 'shield' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-110" viewBox="0 0 36 36">
                  <path
                    className="text-[#D4FF00] stroke-current transition-all duration-1000 ease-linear"
                    strokeDasharray="100, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="2"
                  />
                  {/* We would animate stroke-dashoffset here based on time remaining */}
                </svg>
              )}

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
                  className={`relative z-10 transition-transform duration-300 ${activePowerup === 'shield' ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                {activePowerup === 'shield' && <div className="absolute inset-0 bg-white/30 animate-pulse-slow" />}
              </button>
              {/* Label (Tooltip style) */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                Shield
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-white/10" />

            {/* Stealth Slot */}
            <div className="relative group">
              {activePowerup === 'invisibility' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-110" viewBox="0 0 36 36">
                  <path
                    className="text-[#b794f4] stroke-current"
                    strokeDasharray="100, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="2"
                  />
                </svg>
              )}

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
                  className={`relative z-10 transition-transform duration-300 ${activePowerup === 'invisibility' ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                {activePowerup === 'invisibility' && <div className="absolute inset-0 bg-white/30 animate-pulse-slow" />}
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
