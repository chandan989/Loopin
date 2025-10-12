import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlayerInGame } from '@/lib/gameTypes';

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
                  0%, 100% { box-shadow: 0 0 12px ${player.color}; }
                  50% { box-shadow: 0 0 24px ${player.color}, 0 0 12px ${player.color}; }
                }
              </style>
              <div style="animation: pulse-glow 1.5s infinite; background-color: ${player.color}; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white;"></div>
              `
            : `<div style="background-color: ${player.color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>`;
          
          const icon = L.divIcon({
            className: 'custom-marker',
            html: iconHtml,
            iconSize: isUser ? [20, 20] : [14, 14],
            iconAnchor: isUser ? [10, 10] : [7, 7],
          });

          playerMarkers.current[player.userId] = L.marker(position, { icon }).addTo(mapInstance.current!);
        }
        
        if(isUser) {
            mapInstance.current.setView(position, mapInstance.current.getZoom());
        }
      }

      // Draw trail
      if (player.trail.length > 1) {
        const trailCoords: [number, number][] = player.trail.map(p => [p.lat, p.lng]);
        L.polyline(trailCoords, {
          color: player.color,
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5',
        }).addTo(trailLayers.current);
      }

      // Draw territories
      player.territories.forEach(territory => {
        const coords: [number, number][] = territory.coordinates.map(c => [c[0], c[1]]);
        L.polygon(coords, {
          color: '#00ff00', // Bright green for glow
          weight: 3,
          fillColor: player.color,
          fillOpacity: 0.6,
        }).addTo(territoryLayers.current);
      });
    });

  }, [allPlayers, currentUserId]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};

export default MapView;
