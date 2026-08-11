import { headers } from 'next/headers';
import Link from 'next/link';
import { getUsers, getCertificates, getComplaints } from '@/lib/db';

export default async function SuperAdminDashboard() {
  const h = await headers();
  const name = h.get('x-user-name') ?? 'Gram Sevak';

  // Fetch all stats on the server
  const allUsers = await getUsers();
  const certificates = await getCertificates();
  const complaints = await getComplaints();

  const totalUsers = allUsers.length;
  const pendingCertificates = certificates.filter(
    (c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW'
  ).length;
  const activeComplaints = complaints.filter(
    (c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-75 uppercase tracking-widest">Super Admin Panel</p>
          <h1 className="text-xl font-bold">🏛️ Gram Panchayat</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, <strong>{name}</strong> (Gram Sevak)</span>
          <form action="/api/auth/login" method="DELETE">
            <Link
              href="/api/auth/login"
              onClick={async () => {
                await fetch('/api/auth/login', { method: 'DELETE' });
                window.location.href = '/login';
              }}
              className="text-xs bg-white text-green-800 px-3 py-1 rounded-full font-semibold hover:bg-green-100 transition"
            >
              Logout
            </Link>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Super Admin DashboardCenter</h2>
          <p className="text-gray-500 mt-1">Full platform control — Gram Sevak access</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Users', value: totalUsers.toString(), icon: '👥', color: 'bg-blue-50 border-blue-200' },
            { label: 'Pending Certificates (All)', value: pendingCertificates.toString(), icon: '📋', color: 'bg-yellow-50 border-yellow-200' },
            { label: 'Open Complaints (All)', value: activeComplaints.toString(), icon: '📣', color: 'bg-red-50 border-red-200' },
            { label: 'Village Wards', value: '6 Wards', icon: '📍', color: 'bg-green-50 border-green-200' },
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
            { title: 'User Management', desc: 'Create / edit admins & users, assign roles', icon: '👤', href: '#' },
            { title: 'Certificate Approvals', desc: 'Review and approve all applications', icon: '📜', href: '#' },
            { title: 'Complaint Management', desc: 'Assign, escalate & resolve complaints', icon: '📣', href: '#' },
            { title: 'Budget & Finance', desc: 'Budget heads, entries, reconciliation', icon: '💰', href: '#' },
            { title: 'Projects & Works', desc: 'Create and track all GP projects', icon: '🏗️', href: '#' },
            { title: 'System Configuration', desc: 'Configure Gateway APIs, DSC, Identity rules', icon: '⚙️', href: '/dashboard/super-admin/settings' },
            { title: 'Security Audit Logs', desc: 'Immutable records for RTI transparency', icon: '🔍', href: '/dashboard/super-admin/audit-logs' },
            { title: 'Gram Sabha', desc: 'Meeting records, decisions, minutes', icon: '🏛️', href: '#' },
            { title: 'Reports', desc: 'Daily, monthly, annual platform reports', icon: '📊', href: '#' },
          ].map((m) => (
            <Link key={m.title} href={m.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-green-400 transition group"
            >
              <div className="text-3xl mb-3">{m.icon}</div>
              <div className="font-semibold text-gray-800 group-hover:text-green-700">{m.title}</div>
              <div className="text-sm text-gray-500 mt-1">{m.desc}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
