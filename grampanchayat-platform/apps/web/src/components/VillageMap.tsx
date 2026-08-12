'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function VillageMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Resolve default icon issues in Leaflet under Next.js bundling
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Initialize Leaflet Map centered at Hudkeshwar, Nagpur
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

    // Approximate boundary coordinates for the Gram Panchayat (Hudkeshwar area)
    // In a real application, you would load a GeoJSON file with exact survey coordinates.
    const latlngs: L.LatLngExpression[] = [
      [21.105, 79.112], // Top Left
      [21.106, 79.125], // Top Right
      [21.096, 79.130], // Mid Right
      [21.088, 79.125], // Bottom Right
      [21.089, 79.112], // Bottom Left
      [21.095, 79.108], // Mid Left
    ];

    // Draw the boundary polygon
    const boundaryPolygon = L.polygon(latlngs, {
      color: '#0284c7', // Primary blue boundary line
      weight: 3,
      fillColor: '#38bdf8', // Light blue fill
      fillOpacity: 0.2
    }).addTo(map);
    
    // Fit the map view to perfectly frame the boundary
    map.fitBounds(boundaryPolygon.getBounds());

    // Add a marker for the Gram Panchayat office inside the boundary
    const marker = L.marker([21.097, 79.122])
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 14px; font-weight: bold; text-align: center;">
          Gram Panchayat Hudkeshwar
          <div style="font-size: 12px; font-weight: normal; color: #6b7280; margin-top: 4px;">Gram Panchayat Area Boundary</div>
        </div>
      `);
    
    // Open the popup by default
    marker.openPopup();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full z-10" 
    />
  );
}
