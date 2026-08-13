'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function PublicFeedbackPage() {
  const [facilityName, setFacilityName] = useState('Gram Panchayat Administration');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [citizenMobile, setCitizenMobile] = useState('');
  const [wardNo, setWardNo] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName || !rating) {
      setError('Please select a facility and rating.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName,
          rating,
          comments,
          citizenMobile,
          wardNo: Number(wardNo),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <div className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
          <span className="text-xs bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full font-semibold">
            Multi-Stakeholder Feedback • सार्वजनिक अभिप्राय
          </span>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="border-b border-outline-variant pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">star_rate</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-on-surface">Rate Services • अभिप्राय नोंदवा</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Help improve village facilities, schools, and sanitation through anonymous ratings.
                </p>
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl">verified</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">Feedback Submitted!</h2>
              <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
                Thank you for rating <strong>{facilityName}</strong>. Your rating helps the Sarpanch and Gram Sevak prioritize local development.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setComments('');
                }}
                className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-xs"
              >
                Rate Another Service
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-error-container/40 border border-error/30 text-error rounded-xl text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Select Service / Facility • सुविधेची निवड <span className="text-error">*</span>
                </label>
                <select
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm font-medium"
                >
                  <option value="Gram Panchayat Administration">Gram Panchayat Office & Staff • प्रशासन</option>
                  <option value="Clean Water Supply">Clean Water Supply • पाणी पुरवठा</option>
                  <option value="Sanitation & Garbage Disposal">Waste Collection & Cleanliness • स्वच्छता</option>
                  <option value="Street Lighting">Streetlight Maintenance • पथदिवे</option>
                  <option value="Zilla Parishad Primary School">Z.P. Primary School • शाळा</option>
                  <option value="Primary Health Sub-Center">Primary Health Center • आरोग्य केंद्र</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Overall Rating • गुणांकन (१ ते ५ स्टार)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl border transition-all ${
                        star <= rating
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl fill-current">
                        {star <= rating ? 'star' : 'star_border'}
                      </span>
                    </button>
                  ))}
                  <span className="text-sm font-bold text-purple-600 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Comments / Suggestions • टिप्पणी किंवा सूचना
                </label>
                <textarea
                  rows={3}
                  placeholder="Share any details on cleanliness, staff helpfulness, or operational issues..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Mobile Number (Optional) • मोबाईल क्र.
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={citizenMobile}
                    onChange={(e) => setCitizenMobile(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Ward Number • प्रभाग क्र.
                  </label>
                  <select
                    value={wardNo}
                    onChange={(e) => setWardNo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm"
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
                className="w-full py-3.5 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base"
              >
                {submitting ? (
                  <>Submitting Feedback...</>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">rate_review</span>
                    Submit Anonymous Rating
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
