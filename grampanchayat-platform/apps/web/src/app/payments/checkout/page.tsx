'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Bill {
  id: string;
  type: 'TAX' | 'WATER';
  title: string;
  consumerId: string;
  ownerName: string;
  amount: number;
  details: string;
  status: 'UNPAID' | 'PAID';
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('query') || '';
  const billsParam = searchParams.get('bills') || '';
  const billIds = billsParam.split(',').filter(Boolean);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBills, setSelectedBills] = useState<Bill[]>([]);
  const [citizenName, setCitizenName] = useState('');
  
  // Payment states
  const [payerDetails, setPayerDetails] = useState({ name: '', mobile: '', email: '' });
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');

  useEffect(() => {
    if (!query || billIds.length === 0) {
      setError('Invalid checkout link. Missing parameters.');
      setLoading(false);
      return;
    }

    const fetchBills = async () => {
      try {
        const res = await fetch(`/api/payments/query?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'Failed to fetch bills.');
        } else {
          setCitizenName(data.citizenName || '');
          setPayerDetails(prev => ({
            ...prev,
            name: data.citizenName || '',
            mobile: data.mobile || (query.match(/^\d{10}$/) ? query : ''),
          }));

          const filteredBills = (data.bills as Bill[]).filter(b => billIds.includes(b.id) && b.status === 'UNPAID');
          if (filteredBills.length === 0) {
            setError('Selected bills are already paid or invalid.');
          } else {
            setSelectedBills(filteredBills);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Network error while fetching bill details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, billsParam]);

  const totalAmount = selectedBills.reduce((sum, b) => sum + b.amount, 0);

  const handleOpenRazorpay = (orderId: string, amount: number) => {
    const loadScript = () => {
      return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadScript().then((res) => {
      if (!res) {
        setError('Failed to load Razorpay SDK');
        setProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123',
        amount: amount,
        currency: 'INR',
        name: 'Gram Panchayat Quick Pay',
        description: 'Payment of Dues',
        order_id: orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          handleCompletePayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
        prefill: {
          name: payerDetails.name,
          contact: payerDetails.mobile,
          email: payerDetails.email,
        },
        theme: {
          color: '#0ea5e9',
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentObject = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      paymentObject.on('payment.failed', function (response: any) {
        setProcessing(false);
        setError(`Payment Failed: ${response.error.description}`);
      });
      paymentObject.open();
    });
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBills.length === 0) return;
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bills: selectedBills.map((b) => ({
            id: b.id,
            type: b.type,
            amount: b.amount,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.orderId.startsWith('order_mock_')) {
          handleCompletePayment(`pay_mock_${Math.random().toString(36).substring(2, 15)}`, data.orderId, 'mock_signature');
        } else {
          handleOpenRazorpay(data.orderId, data.amount);
        }
      } else {
        setError('Checkout initiation failed. Try again.');
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to payment server.');
      setProcessing(false);
    }
  };

  const handleCompletePayment = async (rPaymentId: string, rOrderId: string, rSignature: string) => {
    setVerifying(true);
    setProcessing(false);

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MULTI',
          razorpayOrderId: rOrderId,
          razorpayPaymentId: rPaymentId,
          razorpaySignature: rSignature,
          payerDetails,
          bills: selectedBills.map((b) => ({
            id: b.id,
            type: b.type,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReceiptUrl(data.receiptUrl);
        setRazorpayPaymentId(rPaymentId);
        setPaymentSuccess(true);
      } else {
        setError(data.error || 'Payment verification failed on server.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection lost during verification. Please check your bank statement before retrying.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !processing && !verifying) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-error-container/10 border border-error/20 p-8 rounded-3xl text-center">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">error_outline</span>
        <h2 className="text-title-large font-bold text-error mb-2">Checkout Error</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="bg-surface hover:bg-surface-container-high border border-outline text-on-surface font-bold py-3 px-8 rounded-full transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-3xl w-full mx-auto bg-surface dark:bg-surface-container-high border border-outline-variant rounded-3xl p-10 shadow-2xl text-center flex flex-col items-center gap-6 animate-fade-in relative overflow-hidden mt-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-2 animate-scale-up border-4 border-green-500/20">
          <span className="material-symbols-outlined text-green-500 text-6xl font-bold">check_circle</span>
        </div>
        <h2 className="text-headline-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
          Payment Successful!
        </h2>
        
        <p className="text-body-lg text-on-surface-variant max-w-lg mt-2">
          Your payment of <span className="font-bold text-on-surface">₹{totalAmount.toFixed(2)}</span> for {selectedBills.length} bill(s) has been securely processed and updated in the municipal records.
        </p>

        <div className="w-full bg-surface-container-lowest dark:bg-[#151c2c] rounded-2xl p-6 my-4 border border-outline-variant/50 text-left grid grid-cols-2 gap-y-4 gap-x-6">
          <div>
            <span className="block text-caption text-on-surface-variant mb-1">Citizen Name</span>
            <span className="font-semibold text-on-surface">{citizenName}</span>
          </div>
          <div>
            <span className="block text-caption text-on-surface-variant mb-1">Transaction ID</span>
            <span className="font-mono text-body-sm text-on-surface-variant break-all">{razorpayPaymentId}</span>
          </div>
          <div>
            <span className="block text-caption text-on-surface-variant mb-1">Date &amp; Time</span>
            <span className="font-semibold text-on-surface">{new Date().toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-caption text-on-surface-variant mb-1">Total Paid</span>
            <span className="font-bold text-green-600 text-title-md">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
          <a
            href={receiptUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="flex-grow bg-primary hover:bg-primary-container text-on-primary font-bold py-4 px-6 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/30"
          >
            <span className="material-symbols-outlined">download</span>
            Download Official Receipt (पावती)
          </a>
          <button
            onClick={() => router.push('/payments')}
            className="border border-outline text-on-surface-variant hover:bg-surface-container-high font-bold py-4 px-6 rounded-full transition-colors flex-grow"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high hover:text-primary transition-all text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Bills
        </button>
        <h1 className="text-title-large font-bold text-on-surface hidden sm:block">Secure Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Order Summary */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface dark:bg-surface-container-high border border-outline-variant rounded-3xl p-8 shadow-sm relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <h2 className="text-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Order Summary
            </h2>

            <div className="flex flex-col gap-4">
              {selectedBills.map((bill) => (
                <div key={bill.id} className="flex gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant hover:border-primary/30 transition-colors">
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                    bill.type === 'TAX' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600'
                  }`}>
                    <span className="material-symbols-outlined">{bill.type === 'TAX' ? 'account_balance' : 'plumbing'}</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-on-surface text-title-sm">{bill.title}</h4>
                      <span className="font-bold text-on-surface">₹{bill.amount.toFixed(2)}</span>
                    </div>
                    <p className="text-caption text-on-surface-variant font-mono mt-1">ID: {bill.consumerId}</p>
                    <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-1">{bill.details}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-end">
              <div>
                <span className="block text-title-medium font-bold text-on-surface">Total Payable Amount</span>
                <span className="text-caption text-on-surface-variant">Includes all taxes and surcharges</span>
              </div>
              <span className="text-headline-lg font-extrabold text-primary">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="lg:col-span-5 bg-surface dark:bg-surface-container-high border border-outline-variant rounded-3xl p-8 shadow-xl relative backdrop-blur-md sticky top-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl pointer-events-none"></div>
          
          <h2 className="text-headline-sm font-bold text-on-surface mb-2 relative">Payer Details</h2>
          <p className="text-body-sm text-on-surface-variant mb-6 relative">
            Please confirm your contact details. The payment receipt will be mapped to this information.
          </p>

          <form onSubmit={handleInitiatePayment} className="flex flex-col gap-5 relative">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-semibold text-on-surface-variant">Full Name</label>
              <input
                type="text"
                required
                value={payerDetails.name}
                onChange={(e) => setPayerDetails({ ...payerDetails, name: e.target.value })}
                className="px-5 py-4 border border-outline rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface shadow-sm"
                placeholder="e.g. Ram Pawar"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-semibold text-on-surface-variant">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">+91</span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={payerDetails.mobile}
                  onChange={(e) => setPayerDetails({ ...payerDetails, mobile: e.target.value })}
                  className="w-full pl-12 pr-5 py-4 border border-outline rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface shadow-sm"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md font-semibold text-on-surface-variant">Email Address (Optional)</label>
              <input
                type="email"
                value={payerDetails.email}
                onChange={(e) => setPayerDetails({ ...payerDetails, email: e.target.value })}
                className="px-5 py-4 border border-outline rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface shadow-sm"
                placeholder="For digital receipt copy"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col gap-4">
              <button
                type="submit"
                disabled={processing || verifying}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-primary/30 flex justify-center items-center gap-3 h-14"
              >
                {processing || verifying ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-on-primary border-t-transparent rounded-full"></span>
                    {verifying ? 'Verifying Securely...' : 'Connecting Gateway...'}
                  </>
                ) : (
                  <>
                    Proceed to Secure Payment
                    <span className="material-symbols-outlined">lock</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-caption text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-green-500">verified_user</span>
                100% Secure Transaction via Razorpay
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-inverse-surface flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow w-full px-md lg:px-lg py-xl">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}
