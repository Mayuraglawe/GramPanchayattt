'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface AssetBooking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Asset {
  id: string;
  name: string;
  name_mr: string;
  type: string;
  capacity?: number;
  description?: string;
  photo_url?: string;
  bookings: AssetBooking[];
}

export default function PublicAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Form State
  const [bookerName, setBookerName] = useState('');
  const [bookerMobile, setBookerMobile] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (asset: Asset) => {
    setSelectedAsset(asset);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !bookerName || !bookerMobile || !startDate || !endDate) {
      setError('Please fill in your name, mobile number, start date, and end date.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          bookerName,
          bookerMobile,
          startDate,
          endDate,
          purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking request.');
      }

      setTrackingId(data.tracking_id);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong.');
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
        <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
          <span className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-semibold">
            Public Availability Calendar • सार्वजनिक मालमत्ता आरक्षण
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface">Community Asset Booking • मालमत्ता बुकिंग</h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Check public availability calendar and submit reservation requests for Gram Panchayat assets without logging in.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-on-surface-variant">Loading community assets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div
                    className="h-44 bg-cover bg-center border-b border-outline-variant relative"
                    style={{ backgroundImage: `url(${asset.photo_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'})` }}
                  >
                    <span className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full text-on-surface border border-outline-variant">
                      {asset.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-bold text-on-surface leading-snug">{asset.name}</h2>
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">{asset.name_mr}</p>

                    <p className="text-xs text-on-surface-variant mt-3 line-clamp-2">
                      {asset.description}
                    </p>

                    {/* Bookings badge */}
                    <div className="mt-4 pt-3 border-t border-outline-variant/50 flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant">Active Reservations:</span>
                      <span className="font-semibold text-primary">{asset.bookings?.length || 0} Booked</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleBook(asset)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-xs text-sm flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Reserve Dates
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedAsset && !trackingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full rounded-2xl p-6 sm:p-8 border border-outline-variant shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Book: {selectedAsset.name}</h2>
                <p className="text-xs text-emerald-600 font-medium">{selectedAsset.name_mr}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-container/40 border border-error/30 text-error rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Booker Name • आपले नाव <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={bookerName}
                    onChange={(e) => setBookerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Mobile Number • मोबाईल क्र. <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={bookerMobile}
                    onChange={(e) => setBookerMobile(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs bg-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Start Date • सुरुवातीची तारीख <span className="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    End Date • शेवटची तारीख <span className="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs bg-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Purpose of Booking • आरक्षणाचा उद्देश
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wedding ceremony, Farming, Cultural event"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs bg-surface"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsset(null)}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {trackingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-md w-full rounded-2xl p-6 border border-outline-variant shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">event_available</span>
            </div>
            <h2 className="text-xl font-bold text-center text-on-surface">Booking Requested!</h2>
            <p className="text-sm text-center text-on-surface-variant mt-1">
              Your reservation request is in <strong>PENDING</strong> state awaiting Gram Panchayat admin confirmation.
            </p>

            <div className="my-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center">
              <span className="text-xs text-on-surface-variant block uppercase font-semibold">Booking Tracking ID</span>
              <span className="text-2xl font-mono font-bold text-emerald-600 block mt-1 tracking-wider">{trackingId}</span>
              <button
                onClick={copyToClipboard}
                className="mt-3 px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">{copied ? 'done' : 'content_copy'}</span>
                {copied ? 'Copied to Clipboard!' : 'Copy Tracking ID'}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/track-status?id=${trackingId}&mobile=${bookerMobile}`}
                className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-center text-sm shadow-xs"
              >
                Track Status Now 🔍
              </Link>
              <button
                onClick={() => {
                  setTrackingId(null);
                  setSelectedAsset(null);
                }}
                className="w-full py-2.5 border border-outline-variant text-on-surface font-medium rounded-xl text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
