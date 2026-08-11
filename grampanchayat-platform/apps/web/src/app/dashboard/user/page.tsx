'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Me {
  name: string;
  role: string;
  mobile: string;
  ward_no?: number;
}

interface Certificate {
  id: string;
  applicantName: string;
  applicantNameMr: string;
  type: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  ward_no: number;
  appliedAt: string;
  certificateNumber?: string;
}

interface Complaint {
  id: string;
  filerName: string;
  category: string;
  description: string;
  ward_no: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  
  // Lists
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Modals Toggles
  const [showCertModal, setShowCertModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Form states
  const [certForm, setCertForm] = useState({ type: 'INCOME', nameMr: '' });
  const [complaintForm, setComplaintForm] = useState({ category: 'Water Supply', desc: '' });
  
  // Message states
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchUserData = useCallback(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setMe(d);
      })
      .catch(() => router.push('/login'));

    fetch('/api/certificates')
      .then((r) => r.json())
      .then((data) => setCerts(data))
      .catch((e) => console.error('Certs load error', e));

    fetch('/api/complaints')
      .then((r) => r.json())
      .then((data) => setComplaints(data))
      .catch((e) => console.error('Complaints load error', e));
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: certForm.type,
          applicantNameMr: certForm.nameMr,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit certificate request');

      setMsg({ text: 'Certificate request submitted successfully!', type: 'success' });
      setShowCertModal(false);
      setCertForm({ type: 'INCOME', nameMr: '' });
      fetchUserData();
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : 'Error submitting request', type: 'error' });
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: complaintForm.category,
          description: complaintForm.desc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit grievance');

      setMsg({ text: 'Grievance ticket registered successfully!', type: 'success' });
      setShowComplaintModal(false);
      setComplaintForm({ category: 'Water Supply', desc: '' });
      fetchUserData();
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : 'Error filing grievance', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Citizen Portal</p>
          <h1 className="text-xl font-bold">🏛️ Gram Panchayat</h1>
        </div>
        <div className="flex items-center gap-4">
          {me && (
            <span className="text-sm">
              Welcome, <strong>{me.name}</strong> {me.ward_no && `(Ward ${me.ward_no})`}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full font-semibold hover:bg-blue-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {me ? `Hello, ${me.name}! 👋` : 'Loading…'}
          </h2>
          <p className="text-gray-500 mt-1">Access and track your Gram Panchayat digital requests.</p>
        </div>

        {msg.text && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              msg.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Quick action triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {/* Certificate Trigger */}
          <button
            onClick={() => setShowCertModal(true)}
            className="flex items-center gap-4 bg-white border border-gray-200 p-6 rounded-xl text-left shadow-sm hover:shadow-md hover:border-blue-400 transition group"
          >
            <div className="text-4xl bg-blue-50 p-3 rounded-full text-blue-600 group-hover:scale-105 transition-transform">📜</div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Apply for Certificate</h3>
              <p className="text-xs text-gray-500 mt-1">Request Birth, Income, Domicile or Caste certificates.</p>
            </div>
          </button>

          {/* Grievance Trigger */}
          <button
            onClick={() => setShowComplaintModal(true)}
            className="flex items-center gap-4 bg-white border border-gray-200 p-6 rounded-xl text-left shadow-sm hover:shadow-md hover:border-red-400 transition group"
          >
            <div className="text-4xl bg-red-50 p-3 rounded-full text-red-600 group-hover:scale-105 transition-transform">📣</div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">File a Grievance</h3>
              <p className="text-xs text-gray-500 mt-1">Report sanitation, roads or pipeline damages directly.</p>
            </div>
          </button>
        </div>

        {/* Live track lists */}
        <div className="space-y-8">
          {/* Certificates Queue */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <span>📜</span> Your Certificate Requests
            </h3>
            {certs.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No applications found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {certs.map((c) => (
                  <div key={c.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-semibold text-gray-800">{c.type} Certificate</div>
                      <div className="text-xs text-gray-400">Applied on {new Date(c.appliedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          c.status === 'PENDING'
                            ? 'bg-yellow-50 text-yellow-700'
                            : c.status === 'UNDER_REVIEW'
                            ? 'bg-blue-50 text-blue-700'
                            : c.status === 'APPROVED'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.status === 'APPROVED' && c.certificateNumber && (
                        <div className="text-xs font-semibold text-blue-600 underline cursor-pointer hover:text-blue-800">
                          Download ({c.certificateNumber})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grievance tracker */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <span>📣</span> Your Active Grievances
            </h3>
            {complaints.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No filed grievances found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {complaints.map((comp) => (
                  <div key={comp.id} className="py-4 text-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">
                          {comp.category}
                        </span>
                        <p className="font-semibold text-gray-800 mt-2">{comp.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          comp.status === 'OPEN'
                            ? 'bg-red-50 text-red-700'
                            : comp.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700'
                            : comp.status === 'RESOLVED'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── CERTIFICATE APPLICATION MODAL ────────────────────────────────────── */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Apply for Digital Certificate</h3>
            <form onSubmit={handleCertSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate Type</label>
                <select
                  value={certForm.type}
                  onChange={(e) => setCertForm({ ...certForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INCOME">Income Certificate</option>
                  <option value="BIRTH">Birth Certificate</option>
                  <option value="DEATH">Death Certificate</option>
                  <option value="CASTE">Caste Certificate</option>
                  <option value="DOMICILE">Domicile Certificate</option>
                  <option value="RESIDENCE">Residence Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Applicant Name (Marathi)</label>
                <input
                  type="text"
                  required
                  placeholder="अर्जदाराचे मराठीत नाव लिहा"
                  value={certForm.nameMr}
                  onChange={(e) => setCertForm({ ...certForm, nameMr: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 text-sm rounded-full border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-full bg-blue-700 text-white hover:bg-blue-800 transition font-semibold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COMPLAINT FILING MODAL ───────────────────────────────────────────── */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">File Grievance Ticket</h3>
            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Grievance Category</label>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Water Supply">Water Supply pipeline issue</option>
                  <option value="Roads & Sanitation">Roads potholes or blockage</option>
                  <option value="Electricity">Street lights out</option>
                  <option value="Drainage">Drainage overflow</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue with exact location details..."
                  value={complaintForm.desc}
                  onChange={(e) => setComplaintForm({ ...complaintForm, desc: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 text-sm rounded-full border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition font-semibold"
                >
                  File Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
