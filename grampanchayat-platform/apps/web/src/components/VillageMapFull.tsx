'use client';

import React, { useState } from 'react';

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'office' | 'ward' | 'school' | 'hospital';
  description: string;
}

interface VillageMapFullProps {
  selectedLocation?: MapLocation | null;
  locations?: MapLocation[];
}

export default function VillageMapFull({ selectedLocation }: VillageMapFullProps) {
  const [zoom, setZoom] = useState(15);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 1));
  };

  const handleReset = () => {
    setZoom(15);
  };

  const mapQuery = selectedLocation
    ? `${selectedLocation.lat},${selectedLocation.lng}+(${encodeURIComponent(selectedLocation.name)})`
    : '21.0600,79.1300+(Grampanchayt%20Hudkeshwar%20Khurd)';

  return (
    <div className="relative w-full h-full min-h-[450px] bg-slate-100 overflow-hidden">
      {/* Official Google Maps Embed */}
      <iframe
        key={`${mapQuery}-${zoom}`}
        title="Google Maps - Grampanchayt Hudkeshwar Khurd"
        src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`}
        className="w-full h-full absolute inset-0 border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Floating Zoom Control Buttons (+ and -) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 bg-white p-1 rounded-lg border border-gray-300 shadow-md">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          className="w-9 h-9 bg-white hover:bg-gray-100 text-gray-800 font-bold text-xl flex items-center justify-center rounded border-b border-gray-200"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          className="w-9 h-9 bg-white hover:bg-gray-100 text-gray-800 font-bold text-xl flex items-center justify-center rounded border-b border-gray-200"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleReset}
          title="Reset Location"
          className="w-9 h-9 bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center rounded"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
        </button>
      </div>

      {/* Google Maps Style Card Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white p-4 rounded-xl border border-gray-200 shadow-lg max-w-sm text-left">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-bold text-base text-gray-900 leading-tight">Grampanchayt Hudkeshwar Khurd</h2>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
              <span className="font-semibold text-amber-700">4.0</span>
              <span className="text-amber-500 font-bold">★★★★☆</span>
              <span>(Government office)</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          Hudkeshwar Khurd, Nagpur, Maharashtra (21.0600° N, 79.1300° E)
        </p>
        <div className="mt-2 text-xs flex items-center gap-1 font-semibold text-emerald-700 border-t pt-2 border-gray-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          Open · Closes 5:30 PM
        </div>
      </div>
    </div>
  );
}

