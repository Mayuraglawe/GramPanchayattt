'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Scheme {
  id: string;
  scheme_code: string;
  name: string;
  name_mr: string;
  description: string;
  description_mr: string;
  government_level: string;
  ministry: string | null;
  eligibility: Record<string, string>;
  benefits: string;
  benefits_mr: string;
  application_url: string | null;
  helpline: string | null;
}

interface SchemesDashboardClientProps {
  adminName: string;
  wardNo: number;
  initialSchemes: Scheme[];
}

export default function SchemesDashboardClient({
  adminName,
  wardNo,
  initialSchemes,
}: SchemesDashboardClientProps) {
  const [schemes, setSchemes] = useState<Scheme[]>(initialSchemes);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [desc, setDesc] = useState('');
  const [descMr, setDescMr] = useState('');
  const [level, setLevel] = useState<'CENTRAL' | 'STATE'>('CENTRAL');
  const [ministry, setMinistry] = useState('');
  const [benefits, setBenefits] = useState('');
  const [benefitsMr, setBenefitsMr] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [helpline, setHelpline] = useState('');
  
  // Eligibility states (simple inputs to serialize)
  const [incomeLimit, setIncomeLimit] = useState('');
  const [ageLimit, setAgeLimit] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const eligibilityObj: Record<string, string> = {};
    if (incomeLimit.trim()) eligibilityObj['Income Limit'] = incomeLimit;
    if (ageLimit.trim()) eligibilityObj['Age Limit'] = ageLimit;

    try {
      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme_code: code,
          name,
          name_mr: nameMr,
          description: desc,
          description_mr: descMr,
          government_level: level,
          ministry: ministry.trim() || null,
          eligibility: eligibilityObj,
          benefits,
          benefits_mr: benefitsMr,
          application_url: appUrl.trim() || null,
          helpline: helpline.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create scheme. Please try again.');
      } else {
        setSuccess('Scheme created successfully and is now live for citizens!');
        setSchemes((prev) => [data, ...prev]);
        
        // Reset form fields
        setCode('');
        setName('');
        setNameMr('');
        setDesc('');
        setDescMr('');
        setLevel('CENTRAL');
        setMinistry('');
        setBenefits('');
        setBenefitsMr('');
        setAppUrl('');
        setHelpline('');
        setIncomeLimit('');
        setAgeLimit('');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/schemes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete scheme');
      setSchemes((prev) => prev.filter((s) => s.id !== id));
      setSuccess(`Scheme "${name}" deleted successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scheme');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-orange-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Admin Panel</p>
          <h1 className="text-xl font-bold">🏛️ Gram Panchayat Schemes Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Welcome, <strong>{adminName}</strong> (Ward {wardNo} Admin)
          </span>
          <Link
            href="/admin/dashboard"
            className="text-xs bg-white text-orange-700 px-4 py-2 rounded-full font-semibold hover:bg-orange-100 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Main split dashboard panel */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Scheme Creation Form */}
        <section className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5 h-fit">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Add New Government Scheme</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill out detailed parameters. Scheme will go live immediately.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Scheme Code (Unique)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. PM-AWAS, LLY-2026"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Govt Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as 'CENTRAL' | 'STATE')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                >
                  <option value="CENTRAL">Central Govt</option>
                  <option value="STATE">State Govt (Maharashtra)</option>
                </select>
              </div>
            </div>

            {/* Scheme Names */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Scheme Name (English)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PM Awas Yojana"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-orange-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Scheme Name (मराठी)</label>
              <input
                type="text"
                required
                value={nameMr}
                onChange={(e) => setNameMr(e.target.value)}
                placeholder="उदा. प्रधानमंत्री आवास योजना"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Description (English)</label>
              <textarea
                required
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Provide details about the program..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-orange-500 outline-none resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Description (मराठी माहिती)</label>
              <textarea
                required
                rows={2}
                value={descMr}
                onChange={(e) => setDescMr(e.target.value)}
                placeholder="योजनेची सविस्तर माहिती लिहा..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-orange-500 outline-none resize-none"
              />
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Benefits (English)</label>
                <input
                  type="text"
                  required
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="e.g. ₹1.2 Lakh subsidy"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Benefits (मराठी फायदे)</label>
                <input
                  type="text"
                  required
                  value={benefitsMr}
                  onChange={(e) => setBenefitsMr(e.target.value)}
                  placeholder="उदा. ₹१.२ लाख अनुदान"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Eligibility (JSON Fields) */}
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Annual Income Limit</label>
                <input
                  type="text"
                  value={incomeLimit}
                  onChange={(e) => setIncomeLimit(e.target.value)}
                  placeholder="e.g. Under ₹1,20,000"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Age Limit / Other criteria</label>
                <input
                  type="text"
                  value={ageLimit}
                  onChange={(e) => setAgeLimit(e.target.value)}
                  placeholder="e.g. 18 to 35 Years"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Helpline & Apply Link */}
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Ministry Name</label>
                <input
                  type="text"
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                  placeholder="e.g. Ministry of Rural Dev"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Helpline / Contact No.</label>
                <input
                  type="text"
                  value={helpline}
                  onChange={(e) => setHelpline(e.target.value)}
                  placeholder="e.g. 1800-111-222"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Apply Link (Application URL)</label>
              <input
                type="url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="e.g. https://mahadbt.maharashtra.gov.in"
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Error & Success Alert Boxes */}
            {error && <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-lg font-semibold">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-700 text-xs border border-green-200 rounded-lg font-semibold">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  Publish Scheme
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Column - Schemes list */}
        <section className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Currently Active Schemes ({schemes.length})</h2>
            <p className="text-xs text-gray-500 mt-0.5">List of welfare programs published in the database.</p>
          </div>

          {schemes.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-gray-400 text-4xl">folder_open</span>
              <span className="text-sm font-semibold text-gray-500">No government schemes published yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
              {schemes.map((s) => (
                <div key={s.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-bold py-0.5 px-2.5 rounded-full uppercase">
                      {s.government_level}
                    </span>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      disabled={deletingId === s.id}
                      title="Delete scheme"
                      className="bg-red-100 text-red-700 hover:bg-red-200 text-[10px] font-bold py-0.5 px-2 rounded-full transition disabled:opacity-40"
                    >
                      {deletingId === s.id ? '...' : '🗑 Delete'}
                    </button>
                  </div>
                  
                  <div className="pr-28">
                    <span className="text-orange-700 text-xs font-mono font-bold block">{s.scheme_code}</span>
                    <h4 className="font-bold text-gray-800 mt-0.5">{s.name}</h4>
                    <h5 className="text-sm font-semibold text-gray-600 font-medium">{s.name_mr}</h5>
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.description}</p>
                  
                  <div className="border-t border-gray-100 pt-2.5 mt-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="text-gray-400 block font-semibold text-[10px] uppercase">Benefits</span>
                      <span className="text-gray-700 font-medium">{s.benefits}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold text-[10px] uppercase">Helpline</span>
                      <span className="text-gray-700 font-medium">{s.helpline || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
