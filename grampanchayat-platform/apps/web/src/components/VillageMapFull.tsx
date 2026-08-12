'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'office' | 'ward' | 'school' | 'hospital';
  description: string;
}

interface VillageMapFullProps {
  selectedLocation: MapLocation | null;
  locations: MapLocation[];
}

export default function VillageMapFull({ selectedLocation, locations }: VillageMapFullProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
        zoomControl: true,
    }).setView([21.097, 79.122], 14);
    
    mapInstanceRef.current = map;

    // Add Tile Layer (Google Streets)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps',
    }).addTo(map);

    // Add Boundary Polygon
    const latlngs: L.LatLngExpression[] = [
      [21.105, 79.112], [21.106, 79.125], [21.096, 79.130], 
      [21.088, 79.125], [21.089, 79.112], [21.095, 79.108],
    ];
    L.polygon(latlngs, {
      color: '#0284c7',
      weight: 3,
      fillColor: '#38bdf8',
      fillOpacity: 0.15
    }).addTo(map);

    // Add Markers for all locations
    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng]).addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; text-align: center;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${loc.name}</div>
            <div style="font-size: 12px; color: #4b5563;">${loc.description}</div>
            <div style="font-size: 10px; color: #9ca3af; margin-top: 4px; text-transform: uppercase;">${loc.type}</div>
          </div>
        `);
      markersRef.current[loc.id] = marker;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [locations]);

  // Handle flyTo when selectedLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        animate: true,
        duration: 1.5
      });
      
      const marker = markersRef.current[selectedLocation.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 1500); // Open popup after fly animation
      }
    } else if (mapInstanceRef.current && !selectedLocation) {
        // Reset view to overview
        mapInstanceRef.current.flyTo([21.097, 79.122], 14, {
            animate: true,
            duration: 1.5
        });
    }
  }, [selectedLocation]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full z-0" 
    />
  );
}
