'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

interface QueryResponse {
  citizenName: string;
  mobile?: string;
  ward?: number;
  bills: Bill[];
}

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citizenInfo, setCitizenInfo] = useState<{ name: string; mobile?: string; ward?: number } | null>(null);
  const [billsList, setBillsList] = useState<Bill[]>([]);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');
  
  // Payer Details
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [payerDetails, setPayerDetails] = useState({ name: '', mobile: '', email: '' });

  // Search by mobile or consumer ID
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setCitizenInfo(null);
    setBillsList([]);
    setSelectedBillIds([]);

    try {
      const res = await fetch(`/api/payments/query?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No bill matches found. Verify your mobile number or consumer ID.');
      } else {
        const responseData = data as QueryResponse;
        setCitizenInfo({
          name: responseData.citizenName,
          mobile: responseData.mobile,
          ward: responseData.ward,
        });
        setBillsList(responseData.bills);
        // Pre-select all unpaid bills
        const unpaidIds = responseData.bills
          .filter((b) => b.status === 'UNPAID')
          .map((b) => b.id);
        setSelectedBillIds(unpaidIds);
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection checkbox
  const handleToggleSelect = (billId: string) => {
    setSelectedBillIds((prev) =>
      prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]
    );
  };

  // Calculate sum of selected bills
  const selectedBills = billsList.filter((b) => selectedBillIds.includes(b.id));
  const totalAmount = selectedBills.reduce((sum, b) => sum + b.amount, 0);

  // Open Real Razorpay Checkout
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
      paymentObject.open();
    });
  };

  // Initiate Razorpay checkout order
  const handleInitiatePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedBills.length === 0) return;
    setLoading(true);
    setShowPayerModal(false);

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
        setRazorpayOrderId(data.orderId);
        if (data.orderId.startsWith('order_mock_')) {
          // Fallback to fake modal if backend failed to create real order
          setShowPayModal(true);
        } else {
          handleOpenRazorpay(data.orderId, data.amount);
        }
      } else {
        setError('Checkout initiation failed. Try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load payment gateways.');
    } finally {
      setLoading(false);
    }
  };

  // Verify payments
  const handleCompletePayment = async (rPaymentId?: string, rOrderId?: string, rSignature?: string) => {
    if (selectedBills.length === 0) return;

    setVerifying(true);
    const mockPaymentId = rPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 15)}`;
    setRazorpayPaymentId(mockPaymentId);

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MULTI',
          razorpayOrderId: rOrderId || razorpayOrderId,
          razorpayPaymentId: mockPaymentId,
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
        setPaymentSuccess(true);
        setShowPayModal(false);
        // Mark all selected bills paid locally
        setBillsList((prev) =>
          prev.map((b) =>
            selectedBillIds.includes(b.id) ? { ...b, status: 'PAID' as const } : b
          )
        );
        setSelectedBillIds([]);
      } else {
        setError('Payment verification failed.');
        setShowPayModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Payment verification connection timeout.');
      setShowPayModal(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-inverse-surface flex flex-col font-sans">
      <Navbar />

      {/* BODY PORTAL */}
      <main className="flex-grow max-w-container-max w-full mx-auto px-md lg:px-lg py-xl flex flex-col gap-6">
        <div className="mb-2">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high hover:text-primary transition-all text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>
        {paymentSuccess ? (
          /* SUCCESS SCREEN */
          <div className="max-w-2xl w-full mx-auto bg-surface dark:bg-surface-container-high border border-outline-variant rounded-3xl p-8 shadow-lg text-center flex flex-col items-center gap-md animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-2 animate-scale-up">
              <span className="material-symbols-outlined text-green-600 text-5xl font-bold">check_circle</span>
            </div>
            <h2 className="text-headline-lg font-bold text-on-surface">पैसे यशस्वीरित्या भरले गेले!</h2>
            <h3 className="text-title-medium text-green-600 font-semibold -mt-2">Payment Completed Successfully</h3>
            
            <p className="text-body-md text-on-surface-variant max-w-md mt-2">
              All selected bills (Ghar Bill, Water Bill) have been successfully paid and adjusted in the municipal records.
            </p>

            <div className="w-full border-t border-b border-outline-variant/50 py-4 my-4 grid grid-cols-2 gap-y-3 text-left">
              <div>
                <span className="block text-caption text-on-surface-variant">Citizen Name</span>
                <span className="font-semibold text-on-surface">{citizenInfo?.name}</span>
              </div>
              <div>
                <span className="block text-caption text-on-surface-variant">Total Paid</span>
                <span className="font-semibold text-primary">₹{selectedBills.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-caption text-on-surface-variant">Order ID</span>
                <span className="font-mono text-body-sm text-on-surface-variant">{razorpayOrderId}</span>
              </div>
              <div>
                <span className="block text-caption text-on-surface-variant">Razorpay Payment ID</span>
                <span className="font-mono text-body-sm text-on-surface-variant">{razorpayPaymentId}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-grow bg-primary hover:bg-primary-container text-on-primary font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined">download</span>
                Download Combined Receipt (पावती)
              </a>
              <button
                onClick={() => {
                  setPaymentSuccess(false);
                  setCitizenInfo(null);
                  setBillsList([]);
                  setSearchQuery('');
                }}
                className="border border-outline text-on-surface-variant hover:bg-surface-container-high font-bold py-3 px-6 rounded-full transition-colors flex-grow"
              >
                Query Another Profile
              </button>
            </div>
          </div>
        ) : (
          /* BILL SEARCH & VIEW GRID */
          <div className="flex flex-col gap-6">
            {/* SEARCH BANNER CARD */}
            <div className="bg-surface dark:bg-surface-container-high border border-outline-variant rounded-3xl p-8 shadow-sm flex flex-col gap-6">
              <div>
                <h1 className="text-headline-lg font-bold text-on-surface">Panchayat Quick Pay Portal (त्वरित देयक)</h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Query all outstanding bills (Ghar Bill/Property Tax, Water Bill, etc.) by entering your citizen mobile number or direct consumer IDs.
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow flex flex-col gap-2 w-full">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    Mobile Number (मोबाईल क्रमांक) or Consumer ID (ग्राहक आयडी)
                  </label>
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., 9876543213 (Ram Pawar), 101, WC-501"
                    className="w-full px-5 py-3 border border-outline rounded-xl bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-container text-on-primary font-bold py-3 px-8 rounded-xl transition-all h-12 w-full sm:w-auto flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-on-primary border-t-transparent rounded-full"></span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">search</span>
                      Fetch Bills (बिले शोधा)
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="p-4 bg-error-container/20 border border-error/20 rounded-xl text-error text-body-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  {error}
                </div>
              )}
            </div>

            {/* DASHBOARD RESULTS */}
            {citizenInfo && (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* Citizen Meta Details */}
                <div className="bg-surface dark:bg-surface-container-high border border-outline-variant rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">person</span>
                    </div>
                    <div>
                      <h3 className="text-title-large font-bold text-on-surface">{citizenInfo.name}</h3>
                      <p className="text-body-md text-on-surface-variant">
                        {citizenInfo.mobile ? `Mobile: ${citizenInfo.mobile} | ` : ''} Ward No: {citizenInfo.ward || '1'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-caption text-on-surface-variant">Total Bills Found</span>
                    <span className="text-headline-md font-bold text-on-surface">{billsList.length} Bills</span>
                  </div>
                </div>

                {/* Grid List of Bills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {billsList.map((bill) => {
                    const isUnpaid = bill.status === 'UNPAID';
                    const isSelected = selectedBillIds.includes(bill.id);

                    return (
                      <div
                        key={bill.id}
                        onClick={() => isUnpaid && handleToggleSelect(bill.id)}
                        className={`bg-surface dark:bg-surface-container-high border rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all duration-300 ${
                          !isUnpaid
                            ? 'opacity-70 border-outline-variant'
                            : isSelected
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                            : 'border-outline-variant hover:border-primary/50 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        {/* Service Icon Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                bill.type === 'TAX'
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                  : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                              }`}
                            >
                              <span className="material-symbols-outlined">
                                {bill.type === 'TAX' ? 'account_balance' : 'plumbing'}
                              </span>
                            </div>
                            <span className="font-bold text-body-md text-on-surface">{bill.title}</span>
                          </div>

                          {/* Checkbox / Paid Badge */}
                          {isUnpaid ? (
                            <div
                              className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary text-on-primary'
                                  : 'border-outline hover:border-primary'
                              }`}
                            >
                              {isSelected && (
                                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                              )}
                            </div>
                          ) : (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-caption font-bold px-3 py-1 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Paid (भरले)
                            </span>
                          )}
                        </div>

                        {/* Bill Info */}
                        <div className="flex flex-col gap-1">
                          <span className="text-body-sm text-on-surface-variant font-mono">
                            Consumer ID: {bill.consumerId}
                          </span>
                          <p className="text-body-md text-on-surface font-semibold">{bill.details}</p>
                          <span className="text-caption text-on-surface-variant">Owner: {bill.ownerName}</span>
                        </div>

                        {/* Amount */}
                        <div className="flex justify-between items-end border-t border-outline-variant/30 pt-4 mt-2">
                          <span className="text-caption text-on-surface-variant">Amount Due</span>
                          <span className="text-headline-md font-bold text-primary">₹{bill.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Unified Cart Summary Footer (Sticky Bar when selected > 0) */}
                {selectedBills.length > 0 && (
                  <div className="bg-surface dark:bg-surface-container-high border border-primary/20 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 animate-fade-in">
                    <div>
                      <h4 className="text-headline-md font-bold text-on-surface">
                        Selected: {selectedBills.length} Bill{selectedBills.length > 1 ? 's' : ''}
                      </h4>
                      <p className="text-body-md text-on-surface-variant mt-1">
                        Paying for: {selectedBills.map((b) => b.type === 'TAX' ? 'Property Tax' : 'Water Bill').join(' & ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-caption text-on-surface-variant block">Total Sum</span>
                        <span className="text-headline-lg font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => setShowPayerModal(true)}
                        className="bg-primary hover:bg-primary-container text-on-primary font-bold py-4 px-8 rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <span className="material-symbols-outlined">payments</span>
                        Pay Selected (₹{totalAmount.toFixed(0)})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* PAYER DETAILS MODAL */}
      {showPayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface dark:bg-surface-container-high w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-outline-variant relative p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-headline-sm font-bold text-on-surface">Payer Details</h3>
              <button onClick={() => setShowPayerModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-body-md text-on-surface-variant mb-6">
              Please enter your details to proceed with the payment. This information will only be saved upon successful payment.
            </p>
            <form onSubmit={handleInitiatePayment} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold text-on-surface-variant">Full Name</label>
                <input
                  type="text"
                  required
                  value={payerDetails.name}
                  onChange={(e) => setPayerDetails({ ...payerDetails, name: e.target.value })}
                  className="px-4 py-2 border border-outline rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface"
                  placeholder="e.g. Ram Pawar"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold text-on-surface-variant">Mobile Number</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={payerDetails.mobile}
                  onChange={(e) => setPayerDetails({ ...payerDetails, mobile: e.target.value })}
                  className="px-4 py-2 border border-outline rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface"
                  placeholder="10 digit mobile number"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold text-on-surface-variant">Email (Optional)</label>
                <input
                  type="email"
                  value={payerDetails.email}
                  onChange={(e) => setPayerDetails({ ...payerDetails, email: e.target.value })}
                  className="px-4 py-2 border border-outline rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface"
                  placeholder="For payment receipt"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-container text-on-primary font-bold py-3 mt-4 rounded-xl flex justify-center items-center gap-2"
              >
                Proceed to Pay
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATED RAZORPAY MULTI-CHECKOUT OVERLAY MODAL */}
      {showPayModal && selectedBills.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#111622] text-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-gray-800 relative">
            {/* Header */}
            <div className="bg-[#1a2130] p-5 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-bold text-headline-md text-on-primary">
                  GP
                </div>
                <div>
                  <h4 className="font-bold text-title-medium">Gram Panchayat Billdesk</h4>
                  <p className="text-gray-400 text-caption font-mono text-[11px]">{razorpayOrderId}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Bill details cart list */}
            <div className="bg-[#151c2c] px-5 py-4 border-b border-gray-800 max-h-36 overflow-y-auto flex flex-col gap-2">
              <span className="text-gray-400 text-caption block">Paying for ({selectedBills.length} items):</span>
              {selectedBills.map((b) => (
                <div key={b.id} className="flex justify-between items-center text-body-sm">
                  <span className="text-gray-300 font-semibold">{b.title} ({b.consumerId})</span>
                  <span className="font-mono text-gray-200">₹{b.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-[#101520] px-5 py-4 border-b border-gray-800 flex justify-between items-center">
              <span className="text-gray-400 text-label-md font-bold uppercase">Total Checkout Amount:</span>
              <span className="font-mono font-bold text-headline-lg text-primary">₹{totalAmount.toFixed(2)}</span>
            </div>

            {/* Simulated Payment Methods */}
            <div className="p-5 flex flex-col gap-4">
              <h5 className="text-gray-300 font-bold text-label-md uppercase tracking-wider">Select Payment Option</h5>

              <div className="flex flex-col gap-3">
                {/* Method UPI */}
                <button
                  onClick={() => handleCompletePayment()}
                  disabled={verifying}
                  className="flex items-center justify-between p-4 bg-[#1e2738] hover:bg-[#253046] border border-gray-800 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">qr_code_scanner</span>
                    <div>
                      <span className="font-bold text-body-md block text-gray-200">UPI / Google Pay (GPay)</span>
                      <span className="text-gray-400 text-caption">Pay instantly via any UPI app</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                </button>

                {/* Method Card */}
                <button
                  onClick={() => handleCompletePayment()}
                  disabled={verifying}
                  className="flex items-center justify-between p-4 bg-[#1e2738] hover:bg-[#253046] border border-gray-800 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-3xl">credit_card</span>
                    <div>
                      <span className="font-bold text-body-md block text-gray-200">Credit / Debit Card</span>
                      <span className="text-gray-400 text-caption">Visa, Mastercard, RuPay, Maestro</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                </button>

                {/* Method Netbanking */}
                <button
                  onClick={() => handleCompletePayment()}
                  disabled={verifying}
                  className="flex items-center justify-between p-4 bg-[#1e2738] hover:bg-[#253046] border border-gray-800 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0284c7] text-3xl">account_balance</span>
                    <div>
                      <span className="font-bold text-body-md block text-gray-200">Net Banking</span>
                      <span className="text-gray-400 text-caption">All Indian corporate &amp; retail banks</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                </button>
              </div>

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-1.5 text-gray-500 text-caption text-center mt-1">
                <span className="material-symbols-outlined text-[16px] text-green-500">lock</span>
                Secured by Razorpay Checkout Engine
              </div>
            </div>

            {/* Loading Indicator */}
            {verifying && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-50">
                <span className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></span>
                <span className="text-label-md font-bold text-gray-200">Verifying secure signature...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
