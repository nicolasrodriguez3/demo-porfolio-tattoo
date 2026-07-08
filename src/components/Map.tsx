import { useEffect, useRef } from 'react';

interface MapProps {
  studioName?: string;
  address?: string;
}

export default function Map({
  studioName = 'Tattoo Studio',
  address = 'Bavio 173, Paraná, Entre Ríos',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    async function initMap() {
      // Dynamic import avoids SSR crash — Leaflet accesses `window` at module level
      const L = await import('leaflet');

      // Fix default marker icon issue with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [-31.7348, -60.5337],
        zoom: 16,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([-31.7348, -60.5337]).addTo(map);
      marker.bindPopup(`<strong>${studioName}</strong><br/>${address}`);

      // Enable scroll zoom on interaction
      map.on('click', () => {
        if (!map.scrollWheelZoom.enabled()) {
          map.scrollWheelZoom.enable();
        }
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [studioName, address]);

  return (
    <div
      ref={mapRef}
      className="min-h-[400px] w-full rounded-sm"
      aria-label={`Mapa de ${studioName} en ${address}`}
      role="application"
    />
  );
}
