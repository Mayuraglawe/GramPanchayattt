'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Certificate {
  id: string;
  applicantName: string;
  applicantNameMr: string;
  type: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  ward_no: number;
  appliedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  certificateNumber?: string;
}

interface Me {
  name: string;
  role: string;
  ward_no: number;
}

export default function AdminCertificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    // 1. Get current logged-in Admin profile
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((user) => {
        setMe(user);
        // 2. Fetch certificates (API auto-filters to Admin's ward)
        return fetch('/api/certificates');
      })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCerts(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW') => {
    try {
      const res = await fetch('/api/certificates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update certificate status');

      // Refresh certificates
      const refreshRes = await fetch('/api/certificates');
      const refreshedCerts = await refreshRes.json();
      setCerts(refreshedCerts);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating status');
    }
  };

  const filteredCerts = certs.filter(
    (c) => statusFilter === 'ALL' || c.status === statusFilter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 font-semibold">Loading certificate queue...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Admin Control Panel</p>
          <h1 className="text-xl font-bold">📜 Certificate Approvals Hub</h1>
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
            <h2 className="text-2xl font-bold text-gray-800">Review & Verify Applications</h2>
            <p className="text-gray-500 mt-1">
              Verify citizen-submitted documents for Ward {me?.ward_no} certificates requests.
            </p>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="ALL">All Applications</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                  <th className="px-6 py-3">Applicant Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Applied At</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-semibold">
                      No applications found for the selected status.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{c.applicantName}</div>
                        <div className="text-xs text-gray-500">{c.applicantNameMr}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-600">
                        {c.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(c.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            c.status === 'PENDING'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                              : c.status === 'UNDER_REVIEW'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : c.status === 'APPROVED'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : 'bg-red-50 text-red-700 border-red-100'
                          }`}
                        >
                          {c.status}
                        </span>
                        {c.certificateNumber && (
                          <div className="text-[10px] text-gray-500 mt-1 font-mono">
                            No: {c.certificateNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {(c.status === 'PENDING' || c.status === 'UNDER_REVIEW') && (
                          <div className="flex gap-2 justify-end">
                            {c.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(c.id, 'UNDER_REVIEW')}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
                              >
                                Review
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {c.status === 'APPROVED' && (
                          <span className="text-xs text-green-600 font-semibold flex items-center gap-1 justify-end">
                            <span>✅</span> Signed & Delivered
                          </span>
                        )}
                        {c.status === 'REJECTED' && (
                          <span className="text-xs text-red-600 font-semibold flex items-center gap-1 justify-end">
                            <span>❌</span> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
