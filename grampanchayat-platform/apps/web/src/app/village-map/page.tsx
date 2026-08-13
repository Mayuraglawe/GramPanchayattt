'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

// Dynamically import the map component with ssr disabled
const VillageMapFull = dynamic(() => import('@/components/VillageMapFull'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-variant animate-pulse flex items-center justify-center text-on-surface-variant">Loading dynamic map...</div>
});

import { MapLocation } from '@/components/VillageMapFull';

const LOCATIONS: MapLocation[] = [
  {
    id: 'office',
    name: 'Gram Panchayat Office',
    lat: 21.097,
    lng: 79.122,
    type: 'office',
    description: 'Main administrative building for Hudkeshwar Gram Panchayat.'
  },
  {
    id: 'school-1',
    name: 'Zilla Parishad Primary School',
    lat: 21.101,
    lng: 79.118,
    type: 'school',
    description: 'Primary education center for Ward 1 and 2.'
  },
  {
    id: 'phc',
    name: 'Primary Health Centre',
    lat: 21.092,
    lng: 79.125,
    type: 'hospital',
    description: '24/7 basic medical facilities and dispensary.'
  },
  {
    id: 'ward-3',
    name: 'Santoshi Nagar Chowk (Ward 3)',
    lat: 21.103,
    lng: 79.121,
    type: 'ward',
    description: 'Central gathering point and market area for Ward 3.'
  },
  {
    id: 'ward-5',
    name: 'Chandrakiran Nagar (Ward 5)',
    lat: 21.090,
    lng: 79.115,
    type: 'ward',
    description: 'Residential zone with new water supply project.'
  }
];

export default function VillageMapPage() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const getIconForType = (type: string) => {
    switch(type) {
        case 'office': return 'account_balance';
        case 'school': return 'school';
        case 'hospital': return 'local_hospital';
        case 'ward': return 'location_city';
        default: return 'place';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative flex-col md:flex-row">
        
        {/* Sidebar / Bottom Sheet on Mobile */}
        <aside className="w-full md:w-80 lg:w-96 bg-surface-container-lowest border-r border-outline-variant flex flex-col shrink-0 h-[40vh] md:h-auto overflow-y-auto order-2 md:order-1 z-10 shadow-lg md:shadow-none">
            <div className="p-4 border-b border-outline-variant/50 sticky top-0 bg-surface-container-lowest/90 backdrop-blur-sm z-10">
                <h2 className="text-title-md font-title-md text-on-surface mb-1">Points of Interest</h2>
                <p className="text-body-sm text-on-surface-variant">Select a location to explore</p>
                {selectedLocation && (
                    <button 
                        onClick={() => setSelectedLocation(null)}
                        className="mt-3 w-full py-2 px-4 border border-outline rounded-full text-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">zoom_out_map</span>
                        View Full Area
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
                {LOCATIONS.map(loc => (
                    <button
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc)}
                        className={`w-full text-left p-4 rounded-xl mb-2 transition-all flex items-start gap-3 border ${
                            selectedLocation?.id === loc.id 
                                ? 'bg-primary-container border-primary-container shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-surface-container-low'
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            selectedLocation?.id === loc.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary'
                        }`}>
                            <span className="material-symbols-outlined">{getIconForType(loc.type)}</span>
                        </div>
                        <div>
                            <h3 className={`text-title-sm font-title-sm mb-1 ${selectedLocation?.id === loc.id ? 'text-on-primary-container' : 'text-on-surface'}`}>
                                {loc.name}
                            </h3>
                            <p className={`text-body-sm line-clamp-2 ${selectedLocation?.id === loc.id ? 'text-on-primary-container/80' : 'text-on-surface-variant'}`}>
                                {loc.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </aside>

        {/* Map Container */}
        <main className="flex-1 relative order-1 md:order-2 h-[60vh] md:h-auto">
            <VillageMapFull selectedLocation={selectedLocation} locations={LOCATIONS} />
        </main>

      </div>
    </div>
  );
}
