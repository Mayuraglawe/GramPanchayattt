import { headers } from 'next/headers';
import Link from 'next/link';
import { getUsers, getCertificates, getComplaints } from '@/lib/db';

export default async function AdminDashboard() {
  const h = await headers();
  const userId = h.get('x-user-id') ?? '';
  const name = h.get('x-user-name') ?? 'Admin';

  // Fetch ward-scoped stats on the server
  const allUsers = await getUsers();
  const dbUser = allUsers.find((u) => u.id === userId);
  const wardNo = dbUser?.ward_no ?? 1;

  const certificates = await getCertificates();
  const complaints = await getComplaints();

  const pendingCertificates = certificates.filter(
    (c) => c.ward_no === wardNo && (c.status === 'PENDING' || c.status === 'UNDER_REVIEW')
  ).length;

  const activeComplaints = complaints.filter(
    (c) => c.ward_no === wardNo && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-orange-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Admin Panel</p>
          <h1 className="text-xl font-bold">🏛️ Gram Panchayat</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Welcome, <strong>{name}</strong> (Ward {wardNo} Admin)
          </span>
          <Link
            href="/login"
            onClick={async () => {
              'use server';
              // Logout logic is handled by client-side or middleware redirect,
              // but we can clear cookies on client navigation.
            }}
            className="text-xs bg-white text-orange-700 px-3 py-1 rounded-full font-semibold hover:bg-orange-100 transition"
          >
            Logout
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 mt-1">Sarpanch / Operator — Approvals & management for Ward {wardNo}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Pending Certificates (Ward)', value: pendingCertificates.toString(), icon: '📋', color: 'bg-yellow-50 border-yellow-200' },
            { label: 'Active Complaints (Ward)', value: activeComplaints.toString(), icon: '📣', color: 'bg-red-50 border-red-200' },
            { label: 'Assigned Ward', value: `Ward ${wardNo}`, icon: '📍', color: 'bg-blue-50 border-blue-200' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Certificate Approvals', desc: 'Approve or reject applications', icon: '📜', href: '/dashboard/admin/certificates' },
            { title: 'Complaint Management', desc: 'Assign and resolve complaints', icon: '📣', href: '/dashboard/admin/complaints' },
            { title: 'Notice Publishing', desc: 'Publish notices and tenders', icon: '📢', href: '#' },
            { title: 'Project Updates', desc: 'Update project progress & photos', icon: '🏗️', href: '#' },
            { title: 'Gram Sabha', desc: 'Record meeting decisions & minutes', icon: '🏛️', href: '#' },
            { title: 'Agent Approvals', desc: 'Review AI agent permission requests', icon: '🤖', href: '#' },
          ].map((m) => (
            <Link key={m.title} href={m.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-orange-400 transition group"
            >
              <div className="text-3xl mb-3">{m.icon}</div>
              <div className="font-semibold text-gray-800 group-hover:text-orange-700">{m.title}</div>
              <div className="text-sm text-gray-500 mt-1">{m.desc}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
