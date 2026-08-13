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
    setZoom((prev) => Math.min(prev + 1, 19));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 10));
  };

  const handleReset = () => {
    setZoom(15);
  };

  const mapQuery = selectedLocation
    ? encodeURIComponent(`${selectedLocation.name} Hudkeshwar Khurd Nagpur`)
    : encodeURIComponent('Grampanchayt Hudkeshwar Khurd Nagpur');

  return (
    <div className="relative w-full h-full min-h-[450px]">
      {/* Google Map Embed Iframe for Grampanchayt Hudkeshwar Khurd */}
      <iframe
        key={`${mapQuery}-${zoom}`}
        title="Grampanchayt Hudkeshwar Khurd Map"
        src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`}
        className="w-full h-full absolute inset-0 border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
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
          onClick={handleReset}
          title="Reset to Hudkeshwar Khurd"
          aria-label="Reset View"
          className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center border border-gray-200 shadow-xs transition-transform active:scale-95 mt-1"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>

      {/* Official Business Details Overlay Card */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-2xl max-w-sm text-left text-gray-900">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <h2 className="font-extrabold text-base text-[#004d1a] leading-tight">Grampanchayt Hudkeshwar Khurd</h2>
          <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-xs font-extrabold shrink-0 border border-amber-300/60">
            <span>4.0</span>
            <span className="material-symbols-outlined text-[15px] text-amber-600 fill-1">star</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 font-semibold flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-[16px] text-[#004d1a]">account_balance</span>
          📍 Government office • Hudkeshwar Khurd, Nagpur
        </p>
        <div className="flex items-center gap-2 text-xs pt-2 border-t border-gray-200">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-extrabold text-emerald-800">Open</span>
          <span className="text-gray-600">· Closes 5:30 PM</span>
        </div>
      </div>
    </div>
  );
}
