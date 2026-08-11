'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setLogs(d);
        setFilteredLogs(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = logs.filter(
      (l) =>
        l.userName.toLowerCase().includes(term) ||
        l.action.toLowerCase().includes(term) ||
        l.details.toLowerCase().includes(term)
    );
    setFilteredLogs(filtered);
  }, [search, logs]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 font-semibold">Loading system audit trail...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Compliance & Transparency</p>
          <h1 className="text-xl font-bold">🏛️ Immutable System Audit Logs</h1>
        </div>
        <Link
          href="/dashboard/super-admin"
          className="text-xs bg-white text-green-800 px-4 py-2 rounded-full font-semibold hover:bg-green-100 transition"
        >
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">RTI Security Audit Trail</h2>
            <p className="text-gray-500 mt-1">Immutable trace log of all human actions, settings overrides, and certificates updates.</p>
          </div>
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search by action, name, details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">User (Role)</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-semibold">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{log.userName}</div>
                        <div className="text-xs text-gray-500 uppercase">{log.userRole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            log.action.includes('UPDATE') || log.action.includes('SYSTEM')
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : log.action.includes('APPROVE')
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : log.action.includes('REJECT')
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-gray-50 text-gray-700 border border-gray-100'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs md:max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                        {log.ipAddress}
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
