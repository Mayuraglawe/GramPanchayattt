'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Settings {
  smsProvider: string;
  smsApiKey: string;
  smsSenderId: string;
  enableAadhaarVerification: boolean;
  enableDigilockerSync: boolean;
  enableDscSigning: boolean;
  dscSignerName: string;
}

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setSettings(d);
      })
      .catch((err) => setMessage({ text: err.message, type: 'error' }))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      setMessage({ text: 'Settings updated successfully! Logged to audit trail.', type: 'success' });
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'An error occurred', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 font-semibold">Loading settings config...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Super Admin Control Panel</p>
          <h1 className="text-xl font-bold">🏛️ System Config Settings</h1>
        </div>
        <Link
          href="/dashboard/super-admin"
          className="text-xs bg-white text-green-800 px-4 py-2 rounded-full font-semibold hover:bg-green-100 transition"
        >
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">🏛️ System Integrations Config</h2>
          <p className="text-gray-500 mt-1">Configure SMS Gateway APIs, DSC Digital Signatures, and Aadhaar Verifications.</p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {settings && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* SMS GATEWAY */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>💬</span> SMS & WhatsApp Gateway Config
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">SMS Provider</label>
                  <select
                    value={settings.smsProvider}
                    onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="MSG91">MSG91 (Govt Preferred)</option>
                    <option value="Fast2SMS">Fast2SMS</option>
                    <option value="Twilio">Twilio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sender ID</label>
                  <input
                    type="text"
                    value={settings.smsSenderId}
                    onChange={(e) => setSettings({ ...settings, smsSenderId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. GMPNCH"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gateway API Key</label>
                  <input
                    type="password"
                    value={settings.smsApiKey}
                    onChange={(e) => setSettings({ ...settings, smsApiKey: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter API Secret Key"
                  />
                </div>
              </div>
            </div>

            {/* AADHAAR & DIGILOCKER */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔒</span> Identity & Verifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-gray-800 block">Enable Aadhaar OTP Verification</label>
                    <span className="text-xs text-gray-500">Requires users to input the last 4 digits of Aadhaar for profile matching.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAadhaarVerification}
                    onChange={(e) => setSettings({ ...settings, enableAadhaarVerification: e.target.checked })}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <hr className="border-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-gray-800 block">Digilocker Verification Sync</label>
                    <span className="text-xs text-gray-500">Pull validated certificates directly from citizen Digilocker handles.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableDigilockerSync}
                    onChange={(e) => setSettings({ ...settings, enableDigilockerSync: e.target.checked })}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* DIGITAL SIGNATURE / DSC */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>✍️</span> e-Sign & DSC (Digital Signature Certificate)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-gray-800 block">Require DSC Counter-Signature</label>
                    <span className="text-xs text-gray-500">Enable e-Sign module. Certificates will require a cryptographically secure DSC before download link goes live.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableDscSigning}
                    onChange={(e) => setSettings({ ...settings, enableDscSigning: e.target.checked })}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Authorized DSC Signer Name</label>
                  <input
                    type="text"
                    value={settings.dscSignerName}
                    disabled={!settings.enableDscSigning}
                    onChange={(e) => setSettings({ ...settings, dscSignerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Name as registered on DSC Token"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link
                href="/dashboard/super-admin"
                className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-sm font-semibold"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition text-sm font-semibold disabled:opacity-50"
              >
                {isSaving ? 'Saving Configurations...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
