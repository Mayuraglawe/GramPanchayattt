'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citizenInfo, setCitizenInfo] = useState<{ name: string; mobile?: string; ward?: number } | null>(null);
  const [billsList, setBillsList] = useState<Bill[]>([]);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);

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

  const handleCheckout = () => {
    if (selectedBillIds.length === 0) return;
    router.push(`/payments/checkout?query=${encodeURIComponent(searchQuery)}&bills=${selectedBillIds.join(',')}`);
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

        {/* BILL SEARCH & VIEW GRID */}
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
                      onClick={handleCheckout}
                      className="bg-primary hover:bg-primary-container text-on-primary font-bold py-4 px-8 rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <span className="material-symbols-outlined">payments</span>
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
