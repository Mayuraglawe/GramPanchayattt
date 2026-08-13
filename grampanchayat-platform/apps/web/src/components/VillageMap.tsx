'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function VillageMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Resolve default icon issues in Leaflet under Next.js
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
      zoomControl: false, // Custom zoom control buttons
    }).setView([21.085, 79.125], 15);

    mapInstanceRef.current = map;

    // Add Tile Layer (Google Hybrid Streets)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Grampanchayt Hudkeshwar Khurd',
    }).addTo(map);

    // Territory Boundary Polygon for Hudkeshwar Khurd Gram Panchayat Area
    const boundaryCoordinates: L.LatLngExpression[] = [
      [21.092, 79.118],
      [21.093, 79.132],
      [21.082, 79.136],
      [21.076, 79.130],
      [21.077, 79.118],
      [21.085, 79.115],
    ];

    const polygon = L.polygon(boundaryCoordinates, {
      color: '#004d1a',
      weight: 3,
      fillColor: '#86df72',
      fillOpacity: 0.2,
    }).addTo(map);

    // Frame the map bounds
    map.fitBounds(polygon.getBounds());

    // Marker for Grampanchayt Karyalaya Hudkeshwar Khurd
    const marker = L.marker([21.085, 79.125])
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; text-align: center; padding: 4px;">
          <b style="color: #004d1a; font-size: 14px;">ग्रामपंचायत हुडकेश्वर खुर्द</b>
          <div style="font-size: 12px; color: #404a3b; margin-top: 2px;">Grampanchayt Karyalaya Hudkeshwar Khurd</div>
          <div style="font-size: 10px; color: #707a6a; margin-top: 4px;">District Nagpur, Maharashtra</div>
        </div>
      `);

    marker.openPopup();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-2xl border border-outline-variant shadow-xs">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Zoom Control Buttons (+ and -) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-gray-200 shadow-md">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          aria-label="Zoom In"
          className="w-9 h-9 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold text-xl flex items-center justify-center border border-gray-200 shadow-xs transition-transform active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
          className="w-9 h-9 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold text-xl flex items-center justify-center border border-gray-200 shadow-xs transition-transform active:scale-95"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleResetView}
          title="Reset to Hudkeshwar Khurd"
          aria-label="Reset View"
          className="w-9 h-9 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center border border-gray-200 shadow-xs transition-transform active:scale-95 mt-1"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
        </button>
      </div>

      {/* Location Badge Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5">
        <span className="material-symbols-outlined text-green-400 text-[16px]">location_on</span>
        <span>Grampanchayt Hudkeshwar Khurd, Nagpur</span>
      </div>
    </div>
  );
}
