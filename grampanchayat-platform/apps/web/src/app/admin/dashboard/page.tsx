import { headers } from 'next/headers';
import Link from 'next/link';
import { getUsers, getCertificates, getComplaints } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const h = await headers();
  const userId = h.get('x-user-id') ?? '';
  const nameHeader = h.get('x-user-name') ?? '';

  const allUsers = await getUsers();
  const dbUser = allUsers.find((u) => u.id === userId);
  const userName = dbUser?.fullName || (nameHeader && nameHeader !== 'Admin' ? nameHeader : 'Mayur Aglawe');
  const wardNo = dbUser?.ward_no ?? 1;

  const certificates = await getCertificates();
  const complaints = await getComplaints();

  const pendingCertificates = certificates.filter(
    (c) => c.ward_no === wardNo && (c.status === 'PENDING' || c.status === 'UNDER_REVIEW')
  ).length;

  const activeComplaints = complaints.filter(
    (c) => c.ward_no === wardNo && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')
  ).length;

  const totalCerts = certificates.filter((c) => c.ward_no === wardNo).length;
  const resolvedComplaints = complaints.filter(
    (c) => c.ward_no === wardNo && c.status === 'RESOLVED'
  ).length;

  const modules = [
    { title: 'Certificate Approvals', desc: 'Approve or reject citizen applications', icon: '📜', href: '/admin/dashboard/certificates', color: 'from-amber-500 to-orange-500', available: true },
    { title: 'Complaint Management', desc: 'Assign and resolve ward complaints', icon: '📣', href: '/admin/dashboard/complaints', color: 'from-rose-500 to-pink-500', available: true },
    { title: 'Government Schemes', desc: 'Add and manage welfare schemes', icon: '💼', href: '/admin/dashboard/schemes', color: 'from-violet-500 to-purple-500', available: true },
    { title: 'Notice Publishing', desc: 'Publish notices and tenders', icon: '📢', href: '/admin/dashboard/notices', color: 'from-sky-500 to-blue-500', available: true },
    { title: 'Project Updates', desc: 'Track progress & upload photos', icon: '🏗️', href: '/admin/dashboard/projects', color: 'from-emerald-500 to-teal-500', available: true },
    { title: 'Gram Sabha', desc: 'Record meeting decisions & minutes', icon: '🏛️', href: '/admin/dashboard/gram-sabha', color: 'from-indigo-500 to-blue-600', available: true },
  ];

  return (
    <div className="flex-1 bg-gray-50 flex flex-col min-h-screen">
      {/* Top Header Bar (Matching Certificates & Admin Modules Header) */}
      <header className="bg-orange-700 text-white px-8 py-5 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">Admin Control Panel</p>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>🏛️</span> Admin Dashboard Overview
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-orange-800 border border-orange-600/60 px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider">
            WARD {wardNo} SCOPE
          </span>
          <Link
            href="/"
            className="text-xs bg-white text-orange-700 px-4 py-2 rounded-full font-bold hover:bg-orange-100 transition shadow-xs"
          >
            Public Portal ↗
          </Link>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-8 py-8 w-full flex-1">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {userName} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Ward {wardNo} — Wandhale Gram Panchayat
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          {/* Pending Certificates */}
          <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl mb-3 font-bold">
              📜
            </div>
            <div className="text-3xl font-extrabold text-amber-700">{pendingCertificates}</div>
            <div className="text-gray-700 text-xs font-bold uppercase tracking-wider mt-1">Pending Certificates</div>
            <div className="text-xs font-semibold text-amber-600 mt-2 flex items-center gap-1">
              {pendingCertificates > 0 ? '⚠️ Needs review' : '✅ All cleared'}
            </div>
          </div>

          {/* Active Complaints */}
          <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl mb-3 font-bold">
              🚨
            </div>
            <div className="text-3xl font-extrabold text-rose-700">{activeComplaints}</div>
            <div className="text-gray-700 text-xs font-bold uppercase tracking-wider mt-1">Active Complaints</div>
            <div className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1">
              {activeComplaints > 0 ? '⚠️ Action needed' : '✅ All clear'}
            </div>
          </div>

          {/* Total Certificates */}
          <div className="bg-white border border-sky-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl mb-3 font-bold">
              📄
            </div>
            <div className="text-3xl font-extrabold text-sky-700">{totalCerts}</div>
            <div className="text-gray-700 text-xs font-bold uppercase tracking-wider mt-1">Total Certificates</div>
            <div className="text-xs font-medium text-sky-600 mt-2">Ward applications</div>
          </div>

          {/* Resolved Complaints */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-3 font-bold">
              ✅
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">{resolvedComplaints}</div>
            <div className="text-gray-700 text-xs font-bold uppercase tracking-wider mt-1">Resolved Complaints</div>
            <div className="text-xs font-medium text-emerald-600 mt-2">Closed this cycle</div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-gray-800 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Administrative Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {modules.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:shadow-lg hover:border-orange-500/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-105 transition-transform`}>
                    {m.icon}
                  </div>
                  <h4 className="text-gray-900 font-bold text-base mb-1 group-hover:text-orange-600 transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{m.desc}</p>
                </div>
                <div className="text-orange-600 font-bold text-xs mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open Module →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center sm:text-left">
          <p className="text-gray-500 text-xs font-medium">
            Wandhale Gram Panchayat Digital Platform • Ward {wardNo} Admin Scope
          </p>
        </div>
      </main>
    </div>
  );
}
