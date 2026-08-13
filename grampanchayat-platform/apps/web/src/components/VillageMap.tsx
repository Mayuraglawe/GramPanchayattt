'use client';

import React, { useState } from 'react';

export default function VillageMap() {
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

  return (
    <div className="relative w-full h-full min-h-[320px] overflow-hidden rounded-2xl border border-outline-variant shadow-md bg-surface-variant group">
      {/* Google Map Embed Iframe for Grampanchayt Hudkeshwar Khurd */}
      <iframe
        key={zoom}
        title="Grampanchayt Hudkeshwar Khurd Map"
        src={`https://maps.google.com/maps?q=Grampanchayt%20Hudkeshwar%20Khurd%20Nagpur&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`}
        className="w-full h-full absolute inset-0 border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Floating Zoom Control Buttons (+ and -) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-gray-200 shadow-md">
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
          onClick={handleReset}
          title="Reset View"
          aria-label="Reset View"
          className="w-9 h-9 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center border border-gray-200 shadow-xs transition-transform active:scale-95 mt-1"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
        </button>
      </div>

      {/* Official Details Card Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200 shadow-xl max-w-xs text-left text-gray-900">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm text-[#004d1a] leading-tight">Grampanchayt Hudkeshwar Khurd</h3>
          <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-xs font-bold shrink-0">
            <span>4.0</span>
            <span className="material-symbols-outlined text-[14px] text-amber-600 fill-1">star</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 font-medium flex items-center gap-1 mb-1.5">
          <span className="material-symbols-outlined text-[14px] text-gray-500">account_balance</span>
          📍 Government office • Nagpur
        </p>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-emerald-700">Open</span>
          <span className="text-gray-500">· Closes 5:30 PM</span>
        </div>
      </div>
    </div>
  );
}
