'use client';

import React, { useState, useEffect } from 'react';

interface Notice {
  id: string;
  title: string;
  title_mr: string;
  body: string;
  body_mr: string;
  type: string;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  views_count: number;
}

export default function AdminNoticesDashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [titleMr, setTitleMr] = useState('');
  const [body, setBody] = useState('');
  const [bodyMr, setBodyMr] = useState('');
  const [type, setType] = useState('GENERAL');
  const [expiresAt, setExpiresAt] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notices');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch notices');
      setNotices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          title_mr: titleMr,
          body,
          body_mr: bodyMr,
          type,
          expires_at: expiresAt || null,
          is_published: true, // Auto publish for simplicity in this demo
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create notice');

      setSuccess('Notice published successfully!');
      setNotices([data, ...notices]);
      
      // Reset form
      setTitle('');
      setTitleMr('');
      setBody('');
      setBodyMr('');
      setExpiresAt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish notice');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, noticeTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${noticeTitle}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/notices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setNotices(notices.filter((n) => n.id !== id));
      setSuccess('Notice deleted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting notice');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#018749]">Notice Publishing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish public announcements, tenders, and Gram Sabha meeting alerts.
          </p>
        </div>
        <button
          onClick={fetchNotices}
          className="bg-[#018749] hover:bg-[#006400] text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {error || success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Create New Notice</h2>
          <form onSubmit={handleCreateNotice} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Notice Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#018749]"
              >
                <option value="GENERAL">General Announcement</option>
                <option value="TENDER">Tender Notice</option>
                <option value="GRAM_SABHA">Gram Sabha Alert</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Title (English)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Title (Marathi)</label>
                <input
                  type="text"
                  required
                  value={titleMr}
                  onChange={(e) => setTitleMr(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Content (English)</label>
              <textarea
                required
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Content (Marathi)</label>
              <textarea
                required
                rows={3}
                value={bodyMr}
                onChange={(e) => setBodyMr(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="mt-2 bg-[#018749] hover:bg-[#006400] text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 text-sm disabled:opacity-50"
            >
              {formLoading ? 'Publishing...' : '📢 Publish Notice'}
            </button>
          </form>
        </div>

        {/* Right Col: List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[80vh]">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Active Notices</h2>
          
          {loading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-semibold">
              No notices published yet.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {notices.map((n) => (
                <div key={n.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full uppercase ${
                      n.type === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                      n.type === 'TENDER' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {n.type}
                    </span>
                    <button
                      onClick={() => handleDelete(n.id, n.title)}
                      disabled={deletingId === n.id}
                      className="bg-red-50 text-red-600 hover:bg-red-100 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase transition"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="pr-32">
                    <h3 className="font-bold text-gray-900">{n.title}</h3>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">{n.title_mr}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
                    
                    <div className="flex gap-4 mt-3 text-[10px] text-gray-400 font-semibold uppercase">
                      <span>Published: {new Date(n.published_at || '').toLocaleDateString()}</span>
                      {n.expires_at && <span>Expires: {new Date(n.expires_at).toLocaleDateString()}</span>}
                      <span>👁 {n.views_count} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
