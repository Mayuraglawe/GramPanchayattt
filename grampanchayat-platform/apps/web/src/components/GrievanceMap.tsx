'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Complaint {
  id: string;
  filerName: string;
  category: string;
  description: string;
  ward_no: number;
  status: string;
}

export default function GrievanceMap({ complaints }: { complaints: Complaint[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 1. Resolve default icon issues in Leaflet under Next.js bundling
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // 2. Initialize Leaflet Map centered at Wandhale, Ramtek, Nagpur area (approx coords)
    const map = L.map(mapContainerRef.current).setView([21.3969, 79.3242], 14);
    mapInstanceRef.current = map;

    // 3. Add OpenStreetMap tile layers
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // 4. Seed random coordinates near Wandhale center for mock display markers
    const coordsOffset = [
      { lat: 21.3980, lng: 79.3250 },
      { lat: 21.3950, lng: 79.3220 },
      { lat: 21.4010, lng: 79.3280 },
      { lat: 21.3930, lng: 79.3200 },
    ];

    complaints.forEach((comp, idx) => {
      const offset = coordsOffset[idx % coordsOffset.length];
      L.marker([offset.lat, offset.lng])
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #c2410c; text-transform: uppercase;">${comp.category}</strong>
            <div style="font-weight: 600; margin-top: 4px;">${comp.description}</div>
            <div style="color: #6b7280; font-size: 10px; margin-top: 4px;">Filer: ${comp.filerName} (Ward ${comp.ward_no})</div>
            <div style="margin-top: 6px;"><span style="background-color: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; border-radius: 9999px; padding: 2px 8px; font-weight: bold; font-size: 10px;">${comp.status}</span></div>
          </div>
        `);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [complaints]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-[350px] rounded-2xl border border-gray-200 shadow-inner z-10" 
    />
  );
}
