'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function PublicCertificatesPage() {
  const [applicantName, setApplicantName] = useState('');
  const [applicantNameMr, setApplicantNameMr] = useState('');
  const [applicantMobile, setApplicantMobile] = useState('');
  const [type, setType] = useState('INCOME');
  const [address, setAddress] = useState('');
  const [wardNo, setWardNo] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantMobile || !type) {
      setError('Please fill in applicant name, mobile number, and certificate type.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          applicantNameMr: applicantNameMr || applicantName,
          applicantMobile,
          type,
          address: address || 'Gram Panchayat Jurisdiction',
          wardNo: Number(wardNo),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setTrackingId(data.tracking_id);
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
            <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full font-semibold">
              No Login Required • दाखला अर्ज
            </span>
          </div>

        <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="border-b border-outline-variant pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-on-surface">Apply for Certificate • प्रमाणपत्र अर्ज</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Request official Gram Panchayat certificates online without account registration.
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
                  Applicant Name (English) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Shivaji Shinde"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  नाव (मराठीत) • Applicant Name in Marathi
                </label>
                <input
                  type="text"
                  placeholder="उदा. आनंद शिवाजी शिंदे"
                  value={applicantNameMr}
                  onChange={(e) => setApplicantNameMr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Mobile Number • मोबाईल क्र. <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={applicantMobile}
                  onChange={(e) => setApplicantMobile(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Certificate Type • दाखल्याचा प्रकार <span className="text-error">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary text-sm font-medium"
                >
                  <option value="INCOME">Income Certificate • उत्पन्नाचा दाखला</option>
                  <option value="BIRTH">Birth Certificate • जन्म दाखला</option>
                  <option value="DEATH">Death Certificate • मृत्यू दाखला</option>
                  <option value="DOMICILE">Residence / Domicile • रहिवासी दाखला</option>
                  <option value="CASTE">Caste Recommendation • जात शिफारस दाखला</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Resident Address • पत्ता
                </label>
                <input
                  type="text"
                  placeholder="House No, Ward No, Village"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Ward Number • प्रभाग क्र.
                </label>
                <select
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                >
                  <option value="1">Ward 1 (प्रभाग १)</option>
                  <option value="2">Ward 2 (प्रभाग २)</option>
                  <option value="3">Ward 3 (प्रभाग ३)</option>
                  <option value="4">Ward 4 (प्रभाग ४)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base"
            >
              {submitting ? (
                <>Submitting Application...</>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Submit Application & Get Application ID
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {trackingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-md w-full rounded-2xl p-6 border border-outline-variant shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>
            <h2 className="text-xl font-bold text-center text-on-surface">Application Submitted!</h2>
            <p className="text-sm text-center text-on-surface-variant mt-1">
              Your certificate application has been recorded. Save your Application Tracking ID below.
            </p>

            <div className="my-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center">
              <span className="text-xs text-on-surface-variant block uppercase font-semibold">Application Tracking ID</span>
              <span className="text-2xl font-mono font-bold text-secondary block mt-1 tracking-wider">{trackingId}</span>
              <button
                onClick={copyToClipboard}
                className="mt-3 px-4 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">{copied ? 'done' : 'content_copy'}</span>
                {copied ? 'Copied to Clipboard!' : 'Copy Tracking ID'}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/track-status?id=${trackingId}&mobile=${applicantMobile}`}
                className="w-full py-2.5 bg-secondary text-on-secondary font-semibold rounded-xl text-center text-sm shadow-xs"
              >
                Track Status Now 🔍
              </Link>
              <button
                onClick={() => {
                  setTrackingId(null);
                  setApplicantName('');
                  setApplicantNameMr('');
                }}
                className="w-full py-2.5 border border-outline-variant text-on-surface font-medium rounded-xl text-sm"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
