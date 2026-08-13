'use client';

import React, { useState } from 'react';

export default function VillageMap() {
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

  return (
    <div className="relative w-full h-full min-h-[320px] overflow-hidden rounded-2xl border border-outline-variant shadow-md bg-surface-variant group">
      {/* Official Google Maps Embed */}
      <iframe
        key={zoom}
        title="Google Maps - Grampanchayt Hudkeshwar Khurd"
        src={`https://maps.google.com/maps?q=21.0600,79.1300+(Grampanchayt%20Hudkeshwar%20Khurd)&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`}
        className="w-full h-full absolute inset-0 border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Floating Zoom Control Buttons (+ and -) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-white p-1 rounded-lg border border-gray-300 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-800 font-bold text-lg flex items-center justify-center rounded border-b border-gray-200"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-800 font-bold text-lg flex items-center justify-center rounded border-b border-gray-200"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleReset}
          title="Reset Location"
          className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center rounded"
        >
          <span className="material-symbols-outlined text-[16px]">my_location</span>
        </button>
      </div>

      {/* Google Maps Style Card Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-white p-3 rounded-xl border border-gray-200 shadow-lg max-w-xs text-left">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-gray-900 leading-tight">Grampanchayt Hudkeshwar Khurd</h3>
          <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold shrink-0">
            <span>4.0</span>
            <span className="text-amber-500">★</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">location_on</span>
          Nagpur (21.0600° N, 79.1300° E)
        </p>
        <div className="mt-1.5 text-[11px] flex items-center gap-1 font-semibold text-emerald-700 border-t pt-1.5 border-gray-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          Open · Closes 5:30 PM
        </div>
      </div>
    </div>
  );
}

