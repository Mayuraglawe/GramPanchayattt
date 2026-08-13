'use client';

import React, { useState, useEffect } from 'react';

interface AssetBooking {
  id: string;
  tracking_id: string;
  booker_name: string;
  booker_mobile: string;
  start_date: string;
  end_date: string;
  purpose: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED';
  asset: {
    name: string;
    type: string;
  };
  created_at: string;
}

export default function AdminAssetBookingsDashboardPage() {
  const [bookings, setBookings] = useState<AssetBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assets');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch asset bookings');
      }

      // Flatten bookings from assets if needed
      const allBookings: AssetBooking[] = [];
      if (Array.isArray(data.data)) {
        data.data.forEach((assetItem: { name: string; type: string; bookings: AssetBooking[] }) => {
          if (Array.isArray(assetItem.bookings)) {
            assetItem.bookings.forEach((b) => {
              allBookings.push({
                ...b,
                asset: { name: assetItem.name, type: assetItem.type },
              });
            });
          }
        });
      }
      setBookings(allBookings);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong loading bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = filterStatus === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gram Panchayat Asset Bookings</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage public reservations for Community Halls, Tractors, and Water Tankers.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="bg-primary hover:bg-primary/90 text-on-primary font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh Bookings
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-surface p-4 rounded-xl border border-outline-variant">
        <span className="text-sm font-semibold text-on-surface">Filter Status:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-outline px-3 py-1.5 rounded-lg text-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">All Bookings ({bookings.length})</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* States */}
      {loading && (
        <div className="py-12 text-center text-on-surface-variant animate-pulse">
          Loading asset booking applications...
        </div>
      )}

      {error && (
        <div className="p-4 bg-error-container/40 border border-error/30 text-error rounded-xl text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filteredBookings.length === 0 && (
        <div className="py-12 text-center bg-surface rounded-2xl border border-outline-variant text-on-surface-variant">
          No asset booking requests found.
        </div>
      )}

      {!loading && !error && filteredBookings.length > 0 && (
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-on-surface">
              <thead className="bg-surface-container-high text-xs uppercase font-semibold text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4">Tracking ID</th>
                  <th className="px-6 py-4">Asset Name</th>
                  <th className="px-6 py-4">Booker</th>
                  <th className="px-6 py-4">Booking Period</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{b.tracking_id || b.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold">{b.asset?.name || 'Gram Asset'}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold block">{b.booker_name}</span>
                      <span className="text-xs text-on-surface-variant">{b.booker_mobile}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant">
                      {new Date(b.start_date).toLocaleDateString()} &rarr; {new Date(b.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate">{b.purpose || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        b.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : b.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
