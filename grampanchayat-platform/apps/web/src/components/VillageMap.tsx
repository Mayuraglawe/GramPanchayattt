'use client';

import React from 'react';

export default function VillageMap() {
  return (
    <div className="relative w-full h-full min-h-[250px] overflow-hidden rounded-2xl border border-outline-variant shadow-xs bg-surface-variant">
      <iframe
        title="Grampanchayt Hudkeshwar Khurd Map"
        src="https://maps.google.com/maps?q=Grampanchayt%20Hudkeshwar%20Khurd%20Nagpur&t=&z=15&ie=UTF8&iwloc=&output=embed"
        className="w-full h-full absolute inset-0 border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
