'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

type TrackResult = {
  success: boolean;
  message?: string;
  data?: {
    type: 'COMPLAINT' | 'CERTIFICATE' | 'ASSET_BOOKING';
    status: string;
    details: string;
    appliedAt: string;
  };
};

export default function TrackStatusPage() {
  const [type, setType] = useState<'COMPLAINT' | 'CERTIFICATE' | 'ASSET_BOOKING'>('COMPLAINT');
  const [mobile, setMobile] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/track?type=${type}&mobile=${mobile}&id=${trackingId}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: 'Failed to fetch status. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high hover:text-primary transition-all text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Track Your Application
          </h2>
        
        <form onSubmit={handleTrack} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">What are you tracking?</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'COMPLAINT' | 'CERTIFICATE' | 'ASSET_BOOKING')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md border"
            >
              <option value="COMPLAINT">Grievance / Complaint</option>
              <option value="CERTIFICATE">Certificate Application</option>
              <option value="ASSET_BOOKING">Asset Booking</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="text"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tracking ID</label>
            <input
              type="text"
              required
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Enter your Tracking ID"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400"
          >
            {loading ? 'Tracking...' : 'Track Status'}
          </button>
        </form>

        {result && (
          <div className="mt-8">
            {result.success && result.data ? (
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <h3 className="text-lg font-medium text-green-800">Status Found</h3>
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p><strong>Type:</strong> {result.data.type}</p>
                  <p><strong>Status:</strong> <span className="uppercase font-bold">{result.data.status}</span></p>
                  <p><strong>Details:</strong> {result.data.details}</p>
                  <p><strong>Date:</strong> {new Date(result.data.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <h3 className="text-sm font-medium text-red-800">
                  {result.message || 'No record found with those details.'}
                </h3>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
