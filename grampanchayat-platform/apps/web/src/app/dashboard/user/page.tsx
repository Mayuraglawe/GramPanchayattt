'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Me {
  name: string;
  role: string;
  mobile: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d))
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Citizen Portal</p>
          <h1 className="text-xl font-bold">🏛️ Gram Panchayat</h1>
        </div>
        <div className="flex items-center gap-4">
          {me && (
            <span className="text-sm">Welcome, <strong>{me.name}</strong></span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full font-semibold hover:bg-blue-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {me ? `Hello, ${me.name}! 👋` : 'Loading…'}
          </h2>
          <p className="text-gray-500 mt-1">Your Gram Panchayat digital services</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Apply for Certificate', desc: 'Birth, Death, Income, Caste, Domicile, Residence', icon: '📜', href: '#', color: 'hover:border-blue-400' },
            { title: 'Track Application', desc: 'Check status of your certificate applications', icon: '🔍', href: '#', color: 'hover:border-indigo-400' },
            { title: 'Pay Property Tax', desc: 'View and pay your property tax online', icon: '🏠', href: '#', color: 'hover:border-green-400' },
            { title: 'Pay Water Bill', desc: 'View and pay your water connection bill', icon: '💧', href: '#', color: 'hover:border-cyan-400' },
            { title: 'File a Complaint', desc: 'Report road, sanitation, water or other issues', icon: '📣', href: '#', color: 'hover:border-red-400' },
            { title: 'Track Complaint', desc: 'Check the status of your complaint', icon: '📍', href: '#', color: 'hover:border-orange-400' },
            { title: 'Notices & Tenders', desc: 'Read latest GP announcements', icon: '📢', href: '#', color: 'hover:border-yellow-400' },
            { title: 'Government Schemes', desc: 'Find schemes you may be eligible for', icon: '📋', href: '#', color: 'hover:border-purple-400' },
            { title: 'RTI Request', desc: 'File a Right to Information request', icon: '📩', href: '#', color: 'hover:border-gray-400' },
          ].map((m) => (
            <Link key={m.title} href={m.href}
              className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md ${m.color} transition group`}
            >
              <div className="text-3xl mb-3">{m.icon}</div>
              <div className="font-semibold text-gray-800">{m.title}</div>
              <div className="text-sm text-gray-500 mt-1">{m.desc}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
