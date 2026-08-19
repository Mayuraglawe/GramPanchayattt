'use client';

import React, { useState, useEffect } from 'react';

interface GramSabhaMeeting {
  id: string;
  meeting_date: string;
  meeting_type: string;
  venue?: string;
  agenda: string[];
  attendees_count: number;
  quorum_met: boolean;
  decisions: string[];
  minutes_url?: string;
}

export default function AdminGramSabhaDashboard() {
  const [meetings, setMeetings] = useState<GramSabhaMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<GramSabhaMeeting | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingType, setMeetingType] = useState('REGULAR');
  const [venue, setVenue] = useState('');
  const [agendaInput, setAgendaInput] = useState('');

  // Minutes form
  const [attendeesCount, setAttendeesCount] = useState('');
  const [quorumMet, setQuorumMet] = useState(false);
  const [decisionsInput, setDecisionsInput] = useState('');
  const [minutesUrl, setMinutesUrl] = useState('');
  const [minutesLoading, setMinutesLoading] = useState(false);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/gram-sabha');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const agenda = agendaInput.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/admin/gram-sabha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_date: meetingDate, meeting_type: meetingType, venue, agenda }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMeetings([data, ...meetings]);
      setSuccess('Meeting scheduled successfully!');
      setShowCreateForm(false);
      setMeetingDate(''); setMeetingType('REGULAR'); setVenue(''); setAgendaInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule meeting');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveMinutes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    setMinutesLoading(true);
    try {
      const decisions = decisionsInput.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/admin/gram-sabha', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMeeting.id,
          attendees_count: parseInt(attendeesCount) || 0,
          quorum_met: quorumMet,
          decisions,
          minutes_url: minutesUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? data : m));
      setSuccess('Meeting minutes saved successfully!');
      setSelectedMeeting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save minutes');
    } finally {
      setMinutesLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meeting record?')) return;
    try {
      const res = await fetch('/api/admin/gram-sabha', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setMeetings(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting');
    }
  };

  const isFuture = (date: string) => new Date(date) >= new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#018749]">Gram Sabha Meetings</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule village assemblies, log attendance, and record decisions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMeetings} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all">🔄 Refresh</button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-[#018749] hover:bg-[#006400] text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm"
          >
            {showCreateForm ? '✕ Cancel' : '+ Schedule Meeting'}
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {error || success}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-2xl border border-[#018749]/40 shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Schedule Gram Sabha</h2>
          <form onSubmit={handleScheduleMeeting} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Meeting Date</label>
              <input required type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Meeting Type</label>
              <select value={meetingType} onChange={e => setMeetingType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]">
                <option value="REGULAR">Regular (नियमित)</option>
                <option value="SPECIAL">Special (विशेष)</option>
                <option value="EMERGENCY">Emergency (आपत्कालीन)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Venue</label>
              <input value={venue} onChange={e => setVenue(e.target.value)}
                placeholder="e.g. Gram Panchayat Office"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Agenda Items (one per line)</label>
              <textarea rows={4} value={agendaInput} onChange={e => setAgendaInput(e.target.value)}
                placeholder={"Water supply discussion\nRoad repair budget\nScheme eligibility review"}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749] resize-none" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={formLoading} className="w-full bg-[#018749] hover:bg-[#006400] text-white font-bold py-3 rounded-lg transition-colors text-sm disabled:opacity-50">
                {formLoading ? 'Scheduling...' : '🏛️ Schedule Meeting'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Minutes Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Log Meeting Minutes</h3>
            <p className="text-sm text-gray-500 mb-4">{new Date(selectedMeeting.meeting_date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
            <form onSubmit={handleSaveMinutes} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Attendees Count</label>
                  <input type="number" value={attendeesCount} onChange={e => setAttendeesCount(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={quorumMet} onChange={e => setQuorumMet(e.target.checked)} className="w-4 h-4 accent-[#018749]" />
                    <span className="text-sm font-semibold text-gray-700">Quorum Met?</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Decisions Taken (one per line)</label>
                <textarea rows={4} value={decisionsInput} onChange={e => setDecisionsInput(e.target.value)}
                  placeholder={"Approved ₹5L for road repair\nRejected vendor bid - re-tender\nNew water committee elected"}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Minutes PDF URL (Optional)</label>
                <input type="url" value={minutesUrl} onChange={e => setMinutesUrl(e.target.value)} placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedMeeting(null)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={minutesLoading} className="flex-1 bg-[#018749] hover:bg-[#006400] text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50">
                  {minutesLoading ? 'Saving...' : 'Save Minutes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meetings List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 text-gray-400 font-semibold">
          No Gram Sabha meetings found. Schedule the first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {meetings.map((m) => (
            <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all ${isFuture(m.meeting_date) ? 'border-[#018749]/30' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${m.meeting_type === 'EMERGENCY' ? 'bg-red-100 text-red-800' : m.meeting_type === 'SPECIAL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {m.meeting_type}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1.5">
                    {new Date(m.meeting_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </h3>
                  {m.venue && <p className="text-xs text-gray-500">📍 {m.venue}</p>}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isFuture(m.meeting_date) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isFuture(m.meeting_date) ? 'Upcoming' : 'Past'}
                </span>
              </div>

              {m.agenda?.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">Agenda</p>
                  <ul className="space-y-1">
                    {m.agenda.slice(0, 3).map((item: string, i: number) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="text-[#018749]">•</span>{item}</li>
                    ))}
                    {m.agenda.length > 3 && <li className="text-xs text-gray-400">+{m.agenda.length - 3} more...</li>}
                  </ul>
                </div>
              )}

              {m.attendees_count > 0 && (
                <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <span>👥 {m.attendees_count} attended</span>
                  <span>{m.quorum_met ? '✅ Quorum met' : '⚠️ No quorum'}</span>
                  {m.decisions?.length > 0 && <span>📋 {m.decisions.length} decisions</span>}
                </div>
              )}

              <div className="flex gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => {
                    setSelectedMeeting(m);
                    setAttendeesCount(String(m.attendees_count || ''));
                    setQuorumMet(m.quorum_met);
                    setDecisionsInput((m.decisions || []).join('\n'));
                    setMinutesUrl(m.minutes_url || '');
                  }}
                  className="flex-1 bg-[#018749]/10 hover:bg-[#018749]/20 text-[#018749] font-semibold py-2 rounded-lg text-xs transition"
                >
                  📝 Log Minutes
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="px-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg text-xs transition"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
