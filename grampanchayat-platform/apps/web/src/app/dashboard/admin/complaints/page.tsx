'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Complaint {
  id: string;
  filerName: string;
  category: string;
  description: string;
  ward_no: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

interface Me {
  name: string;
  role: string;
  ward_no: number;
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((user) => {
        setMe(user);
        return fetch('/api/complaints');
      })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setComplaints(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update complaint status');

      const refreshRes = await fetch('/api/complaints');
      const refreshedComplaints = await refreshRes.json();
      setComplaints(refreshedComplaints);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating status');
    }
  };

  const filteredComplaints = complaints.filter(
    (c) => statusFilter === 'ALL' || c.status === statusFilter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 font-semibold">Loading complaint records...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Admin Control Panel</p>
          <h1 className="text-xl font-bold">📣 Grievance Management Hub</h1>
        </div>
        <div className="flex items-center gap-4">
          {me && (
            <span className="text-xs bg-orange-800 px-3 py-1 rounded-full font-semibold">
              WARD {me.ward_no} SCOPE
            </span>
          )}
          <Link
            href="/dashboard/admin"
            className="text-xs bg-white text-orange-700 px-4 py-2 rounded-full font-semibold hover:bg-orange-100 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ward Grievances Queue</h2>
            <p className="text-gray-500 mt-1">
              Review and act on citizen-submitted grievances for Ward {me?.ward_no}.
            </p>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredComplaints.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 font-semibold py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
              No matching grievances found for the selected status.
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                        {c.category}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        c.status === 'OPEN'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : c.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : c.status === 'RESOLVED'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : 'bg-gray-50 text-gray-700 border-gray-100'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-gray-800 font-semibold mb-2">{c.description}</p>
                  <div className="text-xs text-gray-500 flex flex-col gap-1 mb-6">
                    <div>Filed by: <strong className="text-gray-700">{c.filerName}</strong></div>
                    <div>Date Filed: <strong className="text-gray-700">{new Date(c.createdAt).toLocaleString()}</strong></div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-gray-100 pt-4">
                  {c.status === 'OPEN' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {(c.status === 'OPEN' || c.status === 'IN_PROGRESS') && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200 transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {c.status === 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'CLOSED')}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                    >
                      Archive / Close
                    </button>
                  )}
                  {c.status === 'CLOSED' && (
                    <span className="text-xs text-gray-500 italic flex items-center gap-1">
                      <span>📁</span> Archived
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
