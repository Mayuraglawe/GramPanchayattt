'use client';

import React, { useEffect, useRef } from 'react';
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

    // Initialize Map default centered at Grampanchayt Hudkeshwar Khurd, Nagpur
    const map = L.map(mapContainerRef.current, {
      zoomControl: false, // Custom zoom control buttons (+ and -)
    }).setView([21.085, 79.125], 15);
    
    mapInstanceRef.current = map;

    // Add Tile Layer (Google Streets)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Grampanchayt Hudkeshwar Khurd',
    }).addTo(map);

    // Boundary Polygon for Hudkeshwar Khurd Gram Panchayat Area
    const latlngs: L.LatLngExpression[] = [
      [21.092, 79.118],
      [21.093, 79.132],
      [21.082, 79.136],
      [21.076, 79.130],
      [21.077, 79.118],
      [21.085, 79.115],
    ];
    L.polygon(latlngs, {
      color: '#004d1a',
      weight: 3,
      fillColor: '#86df72',
      fillOpacity: 0.18
    }).addTo(map);

    // Add Markers for all locations in Hudkeshwar Khurd
    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng]).addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; text-align: center; padding: 4px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #004d1a;">${loc.name}</div>
            <div style="font-size: 12px; color: #4b5563;">${loc.description}</div>
            <div style="font-size: 10px; color: #9ca3af; margin-top: 4px; text-transform: uppercase;">Grampanchayt Hudkeshwar Khurd • ${loc.type}</div>
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
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 17, {
        animate: true,
        duration: 1.2
      });
      
      const marker = markersRef.current[selectedLocation.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 1200);
      }
    } else if (mapInstanceRef.current && !selectedLocation) {
      // Reset view to default Hudkeshwar Khurd overview
      mapInstanceRef.current.flyTo([21.085, 79.125], 15, {
        animate: true,
        duration: 1.2
      });
    }
  }, [selectedLocation]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([21.085, 79.125], 15);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0" 
      />

      {/* Floating Zoom Control Buttons (+ and -) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-gray-200 shadow-md">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          aria-label="Zoom In"
          className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold text-2xl flex items-center justify-center border border-gray-200 shadow-xs transition-transform active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
          className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold text-2xl flex items-center justify-center border border-gray-200 shadow-xs transition-transform active:scale-95"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleResetView}
          title="Reset to Hudkeshwar Khurd"
          aria-label="Reset View"
          className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center border border-gray-200 shadow-xs transition-transform active:scale-95 mt-1"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>

      {/* Location Badge Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/80 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-green-400 text-[18px]">location_on</span>
        <span>Grampanchayt Hudkeshwar Khurd, Nagpur</span>
      </div>
    </div>
  );
}
