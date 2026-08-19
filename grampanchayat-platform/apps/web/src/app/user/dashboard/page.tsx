'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { saveToOfflineQueue, syncOfflineQueue } from '@/lib/offline-db';

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
  const { language, setLanguage, t } = useTranslation();
  const [me, setMe] = useState<Me | null>(null);
  
  // Lists
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  // Modals Toggles
  const [showCertModal, setShowCertModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentContext, setPaymentContext] = useState<{ title: string; amount: string }>({ title: 'Property Tax Payment', amount: '₹1,500.00' });
  
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geotagMsg, setGeotagMsg] = useState('');

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

    const handleOnline = () => {
      syncOfflineQueue().then((synced) => {
        if (synced) {
          setMsg({ text: 'Online: Offline complaints synchronized with database successfully!', type: 'success' });
          fetchUserData();
        }
      });
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
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

    const payload = {
      category: complaintForm.category,
      description: complaintForm.desc,
      latitude: coords?.lat,
      longitude: coords?.lng,
    };

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit grievance');

      setMsg({ text: 'Grievance ticket registered successfully!', type: 'success' });
      setShowComplaintModal(false);
      setComplaintForm({ category: 'Water Supply', desc: '' });
      setCoords(null);
      setGeotagMsg('');
      fetchUserData();
    } catch (err: unknown) {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        saveToOfflineQueue(payload);
        setMsg({ text: 'Offline: Your complaint has been saved locally and will auto-sync once network returns.', type: 'info' });
        setShowComplaintModal(false);
        setComplaintForm({ category: 'Water Supply', desc: '' });
        setCoords(null);
        setGeotagMsg('');
      } else {
        setMsg({ text: err instanceof Error ? err.message : 'Error filing grievance', type: 'error' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">{t('citizen.title')}</p>
          <h1 className="text-xl font-bold">🏛️ Gram Panchayat</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="text-xs bg-blue-800 text-white border border-blue-600 px-3 py-1 rounded-full font-semibold hover:bg-blue-900 transition flex items-center gap-1"
          >
            <span>🌐</span> {language === 'en' ? 'मराठी' : 'English'}
          </button>

          {me && (
            <span className="text-sm">
              {t('common.welcome')}, <strong>{me.name}</strong> {me.ward_no && `(Ward ${me.ward_no})`}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full font-semibold hover:bg-blue-100 transition"
          >
            {t('common.logout')}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {me ? `${t('common.welcome')}, ${me.name}! 👋` : t('common.loading')}
          </h2>
          <p className="text-gray-500 mt-1">{t('citizen.subtitle')}</p>
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
              <h3 className="font-bold text-gray-800 text-lg">{t('citizen.applyCert')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('citizen.applyCertDesc')}</p>
            </div>
          </button>

          {/* Grievance Trigger */}
          <button
            onClick={() => setShowComplaintModal(true)}
            className="flex items-center gap-4 bg-white border border-gray-200 p-6 rounded-xl text-left shadow-sm hover:shadow-md hover:border-red-400 transition group"
          >
            <div className="text-4xl bg-red-50 p-3 rounded-full text-red-600 group-hover:scale-105 transition-transform">📣</div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{t('citizen.fileGrievance')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('citizen.fileGrievanceDesc')}</p>
            </div>
          </button>
        </div>

        {/* 💳 Payments & Utility Bills */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-12">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span>💳</span> Payments & Utility Bills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-xl p-5 flex flex-col justify-between bg-gray-50/50">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                  Property Tax
                </span>
                <div className="text-sm text-gray-500 mt-2">Property ID: <strong className="text-gray-700">SRV-1024-W1</strong></div>
                <div className="text-2xl font-bold text-gray-800 mt-2">₹1,500.00</div>
                <div className="text-xs text-red-500 mt-1">Outstanding Arrears (FY-2026-27)</div>
              </div>
              <button
                onClick={async () => {
                  setMsg({ text: '', type: '' });
                  try {
                    const res = await fetch('/api/payments/tax/initiate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ propertyId: 'SRV-1024-W1', amount: 1500 }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to initiate checkout');
                    
                    // Show simulated Razorpay modal
                    const win = window as unknown as { _rzp_payment_id: string; _rzp_order_id: string };
                    win._rzp_payment_id = data.paymentId;
                    win._rzp_order_id = data.orderId;
                    setPaymentContext({ title: 'Property Tax Payment', amount: '₹1,500.00' });
                    setShowPaymentModal(true);
                  } catch (err: unknown) {
                    const msgText = err instanceof Error ? err.message : 'Failed to initiate checkout';
                    setMsg({ text: msgText, type: 'error' });
                  }
                }}
                className="mt-6 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm rounded-full transition w-full text-center"
              >
                Pay Outstanding Tax
              </button>
            </div>

            <div className="border border-gray-100 rounded-xl p-5 flex flex-col justify-between bg-gray-50/50">
              <div>
                <span className="text-xs font-bold text-cyan-600 uppercase bg-cyan-50 px-2 py-0.5 rounded">
                  Water Bill
                </span>
                <div className="text-sm text-gray-500 mt-2">Connection: <strong className="text-gray-700">WTR-CON-9021</strong></div>
                <div className="text-2xl font-bold text-gray-800 mt-2">₹350.00</div>
                <div className="text-xs text-red-500 mt-1">Pending Bill (Aug 2026)</div>
              </div>
              <button
                onClick={async () => {
                  setMsg({ text: '', type: '' });
                  try {
                    const res = await fetch('/api/payments/tax/initiate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ propertyId: 'WTR-CON-9021', amount: 350 }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to initiate checkout');
                    
                    const win = window as unknown as { _rzp_payment_id: string; _rzp_order_id: string };
                    win._rzp_payment_id = data.paymentId;
                    win._rzp_order_id = data.orderId;
                    setPaymentContext({ title: 'Water Bill Payment', amount: '₹350.00' });
                    setShowPaymentModal(true);
                  } catch (err: unknown) {
                    const msgText = err instanceof Error ? err.message : 'Failed to initiate checkout';
                    setMsg({ text: msgText, type: 'error' });
                  }
                }}
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-full transition w-full text-center"
              >
                Pay Water Bill
              </button>
            </div>
          </div>
        </div>

        {/* Live track lists */}
        <div className="space-y-8">
          {/* Certificates Queue */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <span>📜</span> {t('citizen.yourCerts')}
            </h3>
            {certs.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No applications found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {certs.map((c) => (
                  <div key={c.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-semibold text-gray-800">{c.type} Certificate</div>
                      <div className="text-xs text-gray-400">{t('citizen.appliedOn')} {new Date(c.appliedAt).toLocaleDateString()}</div>
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
              <span>📣</span> {t('citizen.yourComplaints')}
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('citizen.certModalTitle')}</h3>
            <form onSubmit={handleCertSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('citizen.certType')}</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('citizen.applicantMr')}</label>
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
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-full bg-blue-700 text-white hover:bg-blue-800 transition font-semibold"
                >
                  {t('common.submit')}
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('citizen.grievanceModalTitle')}</h3>
            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('citizen.grievanceCategory')}</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('citizen.desc')}</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue with exact location details..."
                  value={complaintForm.desc}
                  onChange={(e) => setComplaintForm({ ...complaintForm, desc: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">GPS Geotag Location</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGeotagMsg('Accessing GPS coordinates...');
                      if (!navigator.geolocation) {
                        setGeotagMsg('GPS Geolocation not supported.');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                          setGeotagMsg(`Location Tagged: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                        },
                        (err) => {
                          setGeotagMsg(`GPS Access Blocked: ${err.message}`);
                        }
                      );
                    }}
                    className="text-xs px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-full border border-red-200 transition"
                  >
                    📍 Fetch Location
                  </button>
                </div>
                {geotagMsg && (
                  <p className="text-xs text-gray-500 italic mt-1">{geotagMsg}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 text-sm rounded-full border border-gray-300 hover:bg-gray-100 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition font-semibold"
                >
                  {t('common.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── SIMULATED RAZORPAY BILLING MODAL ───────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center">
            {/* Razorpay Header Branding */}
            <div className="bg-blue-600 w-full py-4 rounded-t-xl -mt-6 -mx-6 flex flex-col items-center text-white mb-6">
              <div className="text-xs uppercase tracking-widest opacity-85">Secure Checkout</div>
              <div className="text-xl font-bold tracking-wide mt-1">Razorpay</div>
            </div>
            
            <div className="text-4xl mb-3">💳</div>
            <h3 className="font-bold text-gray-800 text-lg">{paymentContext.title}</h3>
            <p className="text-xs text-gray-400 mt-1">Order Ref: {((window as unknown) as { _rzp_order_id?: string })._rzp_order_id || 'order_MOCK'}</p>
            <div className="text-2xl font-bold text-gray-900 mt-4">{paymentContext.amount}</div>
            
            <div className="w-full space-y-3 mt-6">
              <button
                onClick={async () => {
                  setShowPaymentModal(false);
                  setMsg({ text: 'Simulating secure transaction processing...', type: 'info' });
                  try {
                    const res = await fetch('/api/payments/tax/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        paymentId: ((window as unknown) as { _rzp_payment_id?: string })._rzp_payment_id,
                        razorpayPaymentId: 'pay_' + Math.floor(100000 + Math.random() * 900000).toString(),
                        success: true,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to verify transaction');

                    setMsg({ text: 'Property tax payment verified successfully! Arrears updated to 0.', type: 'success' });
                    fetchUserData();
                  } catch (err: unknown) {
                    const msgText = err instanceof Error ? err.message : 'Failed to verify transaction';
                    setMsg({ text: msgText, type: 'error' });
                  }
                }}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-full transition"
              >
                Simulate Successful Payment
              </button>
              
              <button
                onClick={async () => {
                  setShowPaymentModal(false);
                  try {
                    await fetch('/api/payments/tax/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        paymentId: ((window as unknown) as { _rzp_payment_id?: string })._rzp_payment_id,
                        razorpayPaymentId: 'pay_fail',
                        success: false,
                      }),
                    });
                    setMsg({ text: 'Payment transaction failed or cancelled by user.', type: 'error' });
                  } catch (err: unknown) {
                    const msgText = err instanceof Error ? err.message : 'Payment verify failed';
                    setMsg({ text: msgText, type: 'error' });
                  }
                }}
                className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-sm rounded-full transition"
              >
                Simulate Failure / Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
