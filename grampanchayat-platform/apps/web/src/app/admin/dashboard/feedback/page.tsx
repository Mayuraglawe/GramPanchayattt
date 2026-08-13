'use client';

import React, { useState, useEffect } from 'react';

interface FeedbackDetails {
  rating?: number;
  comments?: string;
  mobile?: string;
  ward_no?: number;
  submitted_at?: string;
}

interface FeedbackLog {
  id: string;
  entity_id: string;
  new_value?: FeedbackDetails | null;
  created_at: string;
}

export default function AdminFeedbackDashboardPage() {
  const [logs, setLogs] = useState<FeedbackLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterFacility, setFilterFacility] = useState('ALL');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/feedback');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load feedback');
      }

      const rawLogs: FeedbackLog[] = data.data || [];
      const parsedLogs: FeedbackLog[] = rawLogs.map((log) => ({
        id: log.id,
        entity_id: log.entity_id,
        new_value: typeof log.new_value === 'object' && log.new_value !== null ? (log.new_value as FeedbackDetails) : {},
        created_at: log.created_at,
      }));

      setLogs(parsedLogs);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filterFacility === 'ALL'
    ? logs
    : logs.filter((log: FeedbackLog) => log.entity_id === filterFacility);

  const averageRating = logs.length > 0
    ? (logs.reduce((acc: number, log: FeedbackLog) => acc + (log.new_value?.rating || 0), 0) / logs.length).toFixed(1)
    : '0.0';

  const facilities = Array.from(new Set(logs.map((log: FeedbackLog) => log.entity_id).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Citizen Ratings & Feedback Desk</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Review citizen ratings and public facility feedback submitted across wards.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-purple-500/10 border border-purple-500/20 px-5 py-3 rounded-2xl">
          <span className="material-symbols-outlined text-purple-600 text-3xl">star_rate</span>
          <div>
            <span className="text-xs text-purple-600 font-semibold uppercase tracking-wider block">Average Score</span>
            <span className="text-2xl font-bold text-purple-900">{averageRating} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-on-surface">Filter Facility:</span>
          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value)}
            className="border border-outline px-3 py-1.5 rounded-lg text-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Facilities ({logs.length})</option>
            {facilities.map((fac) => (
              <option key={fac} value={fac}>{fac}</option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchFeedback}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh Feed
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-12 text-center text-on-surface-variant animate-pulse">
          Loading feedback logs...
        </div>
      )}

      {error && (
        <div className="p-4 bg-error-container/40 border border-error/30 text-error rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Feedback Logs Grid */}
      {!loading && !error && filteredLogs.length === 0 && (
        <div className="py-12 text-center bg-surface rounded-2xl border border-outline-variant text-on-surface-variant">
          No feedback ratings recorded yet.
        </div>
      )}

      {!loading && !error && filteredLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-on-surface text-base">{log.entity_id}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span>{log.new_value?.rating} / 5</span>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4 italic">
                  &ldquo;{log.new_value?.comments || 'No comment provided'}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Ward No: <strong>{log.new_value?.ward_no || '1'}</strong></span>
                <span>{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
