'use client';

import React, { useState, useEffect } from 'react';

interface AgentApproval {
  id: string;
  approved_by: string;
  approved: boolean;
  comment?: string;
}

interface AgentRequest {
  id: string;
  agent_name: string;
  action_level: string;
  action: string;
  reason: string;
  affected_entity: string;
  payload: Record<string, unknown>;
  alternative_if_denied: string;
  status: string;
  requested_at: string;
  expires_at: string;
  approvals: AgentApproval[];
}

const LEVEL_COLORS: Record<string, string> = {
  READ: 'bg-blue-100 text-blue-800',
  WRITE: 'bg-amber-100 text-amber-800',
  SENSITIVE: 'bg-orange-100 text-orange-800',
  DESTRUCTIVE: 'bg-red-100 text-red-800',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  DENIED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-600',
};

export default function AdminAgentApprovalsDashboard() {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/agent-approvals');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, approved: boolean) => {
    setActionLoadingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/agent-approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved, comment: comment[id] || '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: approved ? 'APPROVED' : 'DENIED' } : r));
      setSuccess(`Request ${approved ? 'approved' : 'denied'} successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const filtered = filterStatus === 'ALL' ? requests : requests.filter(r => r.status === filterStatus);
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#018749]">AI Agent Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage AI agent permission requests for sensitive actions.</p>
        </div>
        <div className="flex gap-3 items-center">
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
              {pendingCount} Pending
            </span>
          )}
          <button onClick={fetchRequests} className="bg-[#018749] hover:bg-[#006400] text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm">
            🔄 Refresh
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {error || success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: requests.length, color: 'bg-gray-50 border-gray-200 text-gray-800' },
          { label: 'Pending', value: requests.filter(r => r.status === 'PENDING').length, color: 'bg-amber-50 border-amber-200 text-amber-800' },
          { label: 'Approved', value: requests.filter(r => r.status === 'APPROVED').length, color: 'bg-green-50 border-green-200 text-green-800' },
          { label: 'Denied', value: requests.filter(r => r.status === 'DENIED').length, color: 'bg-red-50 border-red-200 text-red-800' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.color} text-center`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <span className="text-sm font-semibold text-gray-700">Filter:</span>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#018749]">
          <option value="ALL">All Requests</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="DENIED">Denied</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">Loading agent requests...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 text-gray-400 font-semibold">
          {pendingCount === 0 ? '✅ No pending agent requests — all clear!' : 'No requests match the selected filter.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 ${r.status === 'PENDING' && !isExpired(r.expires_at) ? 'border-amber-300' : 'border-gray-200'}`}>
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="font-bold text-gray-900">{r.agent_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${LEVEL_COLORS[r.action_level] || 'bg-gray-100 text-gray-700'}`}>
                        {r.action_level}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>
                        {r.status}
                      </span>
                      {isExpired(r.expires_at) && r.status === 'PENDING' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-gray-100 text-gray-500">EXPIRED</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Requested {new Date(r.requested_at).toLocaleString()} · Expires {new Date(r.expires_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
                <div><span className="text-[10px] font-bold uppercase text-gray-400 block">Action Requested</span><span className="font-semibold text-gray-800">{r.action}</span></div>
                <div><span className="text-[10px] font-bold uppercase text-gray-400 block">Affected Entity</span><span className="font-semibold text-gray-800">{r.affected_entity}</span></div>
                <div className="sm:col-span-2"><span className="text-[10px] font-bold uppercase text-gray-400 block">Reason</span><span className="text-gray-700">{r.reason}</span></div>
                <div className="sm:col-span-2"><span className="text-[10px] font-bold uppercase text-gray-400 block">Alternative if Denied</span><span className="text-gray-600 italic">{r.alternative_if_denied}</span></div>
              </div>

              {/* Payload preview */}
              {Object.keys(r.payload).length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 font-semibold hover:text-gray-800">View Payload</summary>
                  <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded-xl overflow-x-auto text-[11px]">
                    {JSON.stringify(r.payload, null, 2)}
                  </pre>
                </details>
              )}

              {/* Action area */}
              {r.status === 'PENDING' && !isExpired(r.expires_at) && (
                <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-100 pt-3">
                  <input
                    type="text"
                    placeholder="Optional comment..."
                    value={comment[r.id] || ''}
                    onChange={e => setComment(prev => ({ ...prev, [r.id]: e.target.value }))}
                    className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(r.id, true)}
                      disabled={actionLoadingId === r.id}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 font-bold rounded-lg text-sm transition disabled:opacity-40"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleAction(r.id, false)}
                      disabled={actionLoadingId === r.id}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-sm transition disabled:opacity-40"
                    >
                      ❌ Deny
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
