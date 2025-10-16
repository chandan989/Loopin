import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlayerInGame, H3Index } from '@/lib/gameTypes';
import * as h3 from 'h3-js';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center: [number, number];
  allPlayers: PlayerInGame[];
  currentUserId: string;
}

const MapView = ({ center, allPlayers, currentUserId }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const playerMarkers = useRef<{ [key: string]: L.Marker }>({});
  const trailLayers = useRef<L.LayerGroup>(L.layerGroup());
  const territoryLayers = useRef<L.LayerGroup>(L.layerGroup());

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = L.map(mapContainer.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(center, 16);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '<a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      r: L.Browser.retina ? '@2x' : '',
    }).addTo(map);

    trailLayers.current.addTo(map);
    territoryLayers.current.addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update player markers, trails, and territories
  useEffect(() => {
    if (!mapInstance.current) return;

    trailLayers.current.clearLayers();
    territoryLayers.current.clearLayers();

    allPlayers.forEach(player => {
      // Update marker
      if (player.currentPosition) {
        const position: [number, number] = [player.currentPosition.lat, player.currentPosition.lng];
        const isUser = player.userId === currentUserId;

        if (playerMarkers.current[player.userId]) {
          playerMarkers.current[player.userId].setLatLng(position);
        } else {
          const iconHtml = isUser
            ? `
              <style>
                @keyframes pulse-glow {
                  0%, 100% { box-shadow: 0 0 15px ${player.color}, 0 0 30px ${player.color}; }
                  50% { box-shadow: 0 0 25px ${player.color}, 0 0 50px ${player.color}; }
                }
              </style>
              <div style="animation: pulse-glow 1.5s infinite; background-color: ${player.color}; width: 24px; height: 24px; border-radius: 50%; border: 5px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>
              `
            : `<div style="background-color: ${player.color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.2);"></div>`;
          
          const icon = L.divIcon({
            className: 'custom-marker',
            html: iconHtml,
            iconSize: isUser ? [24, 24] : [18, 18],
            iconAnchor: isUser ? [12, 12] : [9, 9],
          });

          playerMarkers.current[player.userId] = L.marker(position, { icon }).addTo(mapInstance.current!);
        }
        
        if(isUser) {
            mapInstance.current.setView(position, mapInstance.current.getZoom());
        }
      }

      // Draw Realistic Trail Lines
      if (player.trail.length > 1 && player.trailCoordinates && player.trailCoordinates.length > 1) {
        // Draw lines between actual coordinates
        L.polyline(player.trailCoordinates, {
          color: player.color,
          weight: player.userId === currentUserId ? 5 : 3,
          opacity: player.userId === currentUserId ? 0.9 : 0.7,
          dashArray: player.userId === currentUserId ? '0' : '5, 5',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(trailLayers.current);
      }

      // Draw Simple Territory Circles
      player.territories.forEach((cellIndex: H3Index, index) => {
        // Generate simple circular territory around player position
        const centerLat = (player.currentPosition?.lat || 37.7749) + (index * 0.002);
        const centerLng = (player.currentPosition?.lng || -122.4194) + (index * 0.002);
        
        L.circle([centerLat, centerLng], {
          color: player.color,
          weight: 2,
          opacity: 0.8,
          fillColor: player.color,
          fillOpacity: 0.5,
          radius: 50 // 50 meter radius
        }).addTo(territoryLayers.current);
      });
    });

  }, [allPlayers, currentUserId]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};

export default MapView;