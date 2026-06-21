import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TopHeader } from '../components';

const MAPBOX_TOKEN_B64 = import.meta.env.VITE_MAPBOX_TOKEN_B64 as string;
const MAPBOX_TOKEN = MAPBOX_TOKEN_B64 ? atob(MAPBOX_TOKEN_B64) : '';
if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapScreen() {
  const { activeDog, sightings, fetchSightings } = useStore();
  const nav = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [radius, setRadius] = useState(1);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (activeDog) fetchSightings(activeDog.id);
  }, [activeDog?.id]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !MAPBOX_TOKEN) {
      if (!MAPBOX_TOKEN) setMapError(true);
      return;
    }

    navigator.geolocation?.getCurrentPosition(
      pos => initMap([pos.coords.longitude, pos.coords.latitude]),
      () => initMap([-74.0060, 40.7128]),
      { timeout: 5000 }
    );

    function initMap(center: [number, number]) {
      try {
        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom: 13,
        });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

        map.on('load', () => {
          const userEl = document.createElement('div');
          userEl.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#d97706;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);';
          new mapboxgl.Marker({ element: userEl }).setLngLat(center).addTo(map);

          map.addSource('radius', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'Point', coordinates: center }, properties: {} },
          });
          map.addLayer({
            id: 'radius-circle',
            type: 'circle',
            source: 'radius',
            paint: {
              'circle-radius': { stops: [[0, 0], [20, metersToPixelsAtMaxZoom(radius * 1609.34, center[1])]], base: 2 },
              'circle-color': '#d97706',
              'circle-opacity': 0.06,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#d97706',
              'circle-stroke-opacity': 0.4,
            },
          });
        });

        mapRef.current = map;
      } catch {
        setMapError(true);
      }
    }

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    sightings.forEach((s: any) => {
      if (!s.lng || !s.lat) return;
      const el = document.createElement('div');
      const color = s.source === 'relay' ? '#a78bfa' : s.source === 'collar' ? '#d97706' : '#c05c28';
      el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.25);cursor:pointer;`;
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([s.lng, s.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(
          `<div style="font-family:sans-serif;font-size:12px;">
            <strong>${s.source === 'relay' ? 'BLE Relay' : s.source === 'collar' ? 'Chip Scan' : 'Sighting'}</strong><br/>
            ${new Date(s.created_at).toLocaleString()}
          </div>`
        ))
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [sightings]);

  function metersToPixelsAtMaxZoom(meters: number, lat: number) {
    return meters / 0.075 / Math.cos(lat * Math.PI / 180);
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title={activeDog ? activeDog.name + "'s Map" : 'Map'} back action={`${radius} mi ▾`} onAction={() => setRadius(r => r >= 5 ? 1 : r + 1)}/>
      <div className="flex-1 relative overflow-hidden">
        {mapError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-wood3/30 px-8 text-center">
            <span className="text-4xl">🗺️</span>
            <p className="font-sans text-sm text-muted">Map unavailable — missing Mapbox configuration</p>
          </div>
        ) : (
          <div ref={mapContainer} className="absolute inset-0"/>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <div className="bg-surface/90 border border-amber/20 rounded-xl p-2.5 px-3 backdrop-blur-md shadow-sm">
            <p className="font-mono text-lg font-bold text-warn leading-none">{sightings.length}</p>
            <p className="font-mono text-[8px] text-muted tracking-[.06em] mt-1">SIGHTINGS</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border-t border-amber/15 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🐕</span>
          <p className="font-sans text-sm font-semibold text-text flex-1">
            {activeDog?.name ?? 'No dog selected'}
            {activeDog?.status === 'lost' && <span className="text-warn text-xs ml-2">LOST</span>}
          </p>
          <button onClick={() => nav('/broadcast')} className="h-9 px-4 bg-transparent border border-amber/20 rounded-xl font-mono text-[9px] text-muted">📢 Broadcast</button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {[['#a78bfa','BLE relay'],['#c05c28','Community'],['#d97706','Chip scan']].map(([c,l]) => (
            <div key={l} className="bg-wood3/40 border border-amber/15 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{background:c}}/>
              <span className="text-[11px] text-text">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
