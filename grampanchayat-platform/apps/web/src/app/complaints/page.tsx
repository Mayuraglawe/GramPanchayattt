'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function PublicComplaintsPage() {
  const [filerName, setFilerName] = useState('');
  const [filerMobile, setFilerMobile] = useState('');
  const [category, setCategory] = useState('Water Supply');
  const [wardNo, setWardNo] = useState('1');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filerMobile || !category || !description) {
      setError('Please fill in your mobile number, category, and grievance details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filerName: filerName || 'Gram Villager',
          filerMobile,
          category,
          wardNo: Number(wardNo),
          description,
          photoUrls: photoUrl ? [photoUrl] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint.');
      }

      setTrackingId(data.trackingId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (trackingId) {
      navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <div className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high hover:text-primary transition-all text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
            No Login Required • थेट सार्वजनिक सेवा
          </span>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="border-b border-outline-variant pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-error/15 text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">campaign</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-on-surface">File a Grievance • तक्रार नोंदवा</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Report infrastructure issues directly to Gram Panchayat administration.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container/40 border border-error/30 text-error rounded-xl text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Your Full Name • नाव (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Pawar"
                  value={filerName}
                  onChange={(e) => setFilerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Mobile Number • मोबाईल क्र. <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={filerMobile}
                  onChange={(e) => setFilerMobile(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Category • तक्रारीचा प्रकार <span className="text-error">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="Water Supply">Water Supply • पाणी पुरवठा</option>
                  <option value="Roads & Sanitation">Roads & Cleanliness • रस्ते व स्वच्छता</option>
                  <option value="Streetlights">Streetlights • पथदिवे</option>
                  <option value="Drainage">Drainage & Garbage • सांडपाणी व कचरा</option>
                  <option value="General">Other / General • इतर माहिती</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Ward Number • प्रभाग क्र.
                </label>
                <select
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="1">Ward 1 (प्रभाग १)</option>
                  <option value="2">Ward 2 (प्रभाग २)</option>
                  <option value="3">Ward 3 (प्रभाग ३)</option>
                  <option value="4">Ward 4 (प्रभाग ४)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Grievance Description • सविस्तर माहिती <span className="text-error">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe the issue, location details, landmark, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Photo URL (Optional) • फोटो लिंक
              </label>
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-error hover:bg-error/90 text-on-error font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base"
            >
              {submitting ? (
                <>Submitting Grievance...</>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Submit Grievance & Get Ticket ID
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal with Copyable Tracking ID */}
      {trackingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-md w-full rounded-2xl p-6 border border-outline-variant shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <h2 className="text-xl font-bold text-center text-on-surface">Grievance Registered!</h2>
            <p className="text-sm text-center text-on-surface-variant mt-1">
              Your grievance has been received. Please save your Tracking ID below to monitor resolution.
            </p>

            <div className="my-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center">
              <span className="text-xs text-on-surface-variant block uppercase font-semibold">Your Tracking ID</span>
              <span className="text-2xl font-mono font-bold text-primary block mt-1 tracking-wider">{trackingId}</span>
              <button
                onClick={copyToClipboard}
                className="mt-3 px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">{copied ? 'done' : 'content_copy'}</span>
                {copied ? 'Copied to Clipboard!' : 'Copy Tracking ID'}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/track-status?id=${trackingId}&mobile=${filerMobile}`}
                className="w-full py-2.5 bg-primary text-on-primary font-semibold rounded-xl text-center text-sm shadow-xs"
              >
                Track Status Now 🔍
              </Link>
              <button
                onClick={() => {
                  setTrackingId(null);
                  setDescription('');
                  setPhotoUrl('');
                }}
                className="w-full py-2.5 border border-outline-variant text-on-surface font-medium rounded-xl text-sm"
              >
                Submit Another Complaint
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
