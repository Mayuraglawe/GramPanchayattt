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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch asset bookings');
      setBookings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    if (!confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update booking');
      // Optimistically update local state
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating booking');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = filterStatus === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === filterStatus);

  const statusCount = (s: string) => bookings.filter((b) => b.status === s).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#018749]">Asset Bookings Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Approve or reject public reservations for Community Halls, Tractors, and Water Tankers.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="bg-[#018749] hover:bg-[#006400] text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: statusCount('PENDING'), color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Approved', value: statusCount('APPROVED'), color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Rejected', value: statusCount('REJECTED'), color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Completed', value: statusCount('COMPLETED'), color: 'bg-gray-50 border-gray-200 text-gray-700' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.color} text-center`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <span className="text-sm font-semibold text-gray-700">Filter:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#018749]"
        >
          <option value="ALL">All Bookings ({bookings.length})</option>
          <option value="PENDING">Pending ({statusCount('PENDING')})</option>
          <option value="APPROVED">Approved ({statusCount('APPROVED')})</option>
          <option value="REJECTED">Rejected ({statusCount('REJECTED')})</option>
          <option value="COMPLETED">Completed ({statusCount('COMPLETED')})</option>
        </select>
      </div>

      {loading && (
        <div className="py-12 text-center text-gray-400 animate-pulse">Loading asset booking applications...</div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && filteredBookings.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
          No asset booking requests found.
        </div>
      )}

      {!loading && !error && filteredBookings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-800">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Tracking ID</th>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Booker</th>
                  <th className="px-6 py-4">Booking Period</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#018749]">{b.tracking_id || b.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold">{b.asset?.name || 'Gram Asset'}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold block">{b.booker_name}</span>
                      <span className="text-xs text-gray-500">{b.booker_mobile}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(b.start_date).toLocaleDateString()} → {new Date(b.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate">{b.purpose || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        b.status === 'APPROVED' ? 'bg-green-100 text-green-800'
                        : b.status === 'REJECTED' ? 'bg-red-100 text-red-800'
                        : b.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700'
                        : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(b.id, 'APPROVED')}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 transition disabled:opacity-50"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleAction(b.id, 'REJECTED')}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition disabled:opacity-50"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {b.status === 'APPROVED' && (
                          <button
                            onClick={() => handleAction(b.id, 'COMPLETED')}
                            disabled={actionLoading === b.id}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                          >
                            📁 Mark Done
                          </button>
                        )}
                        {(b.status === 'REJECTED' || b.status === 'COMPLETED') && (
                          <span className="text-xs text-gray-400 italic">Archived</span>
                        )}
                      </div>
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
