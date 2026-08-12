import { headers } from 'next/headers';
import Link from 'next/link';
import { getUsers, getCertificates, getComplaints } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const h = await headers();
  const userId = h.get('x-user-id') ?? '';
  const name = h.get('x-user-name') ?? 'Admin';

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

  const totalCerts = certificates.filter((c) => c.ward_no === wardNo).length;
  const resolvedComplaints = complaints.filter(
    (c) => c.ward_no === wardNo && c.status === 'RESOLVED'
  ).length;

  const modules = [
    { title: 'Certificate Approvals', desc: 'Approve or reject citizen applications', icon: '📜', href: '/admin/dashboard/certificates', color: 'from-amber-500 to-orange-500', available: true },
    { title: 'Complaint Management', desc: 'Assign and resolve ward complaints', icon: '📣', href: '/admin/dashboard/complaints', color: 'from-rose-500 to-pink-500', available: true },
    { title: 'Government Schemes', desc: 'Add and manage welfare schemes', icon: '💼', href: '/admin/dashboard/schemes', color: 'from-violet-500 to-purple-500', available: true },
    { title: 'Notice Publishing', desc: 'Publish notices and tenders', icon: '📢', href: '#', color: 'from-sky-500 to-blue-500', available: false },
    { title: 'Project Updates', desc: 'Track progress & upload photos', icon: '🏗️', href: '#', color: 'from-emerald-500 to-teal-500', available: false },
    { title: 'Gram Sabha', desc: 'Record meeting decisions & minutes', icon: '🏛️', href: '#', color: 'from-indigo-500 to-blue-600', available: false },
  ];

  return (
    <main className="flex-1 p-8">

      {/* Page Header */}
      <div className="mb-8">
        <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin Dashboard</p>
        <h2 className="text-white text-2xl font-bold">Welcome back, {name} 👋</h2>
        <p className="text-white/50 text-sm mt-1">Ward {wardNo} — Wandhale Gram Panchayat</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: 'Pending Certificates',
            value: pendingCertificates,
            icon: '📋',
            gradient: 'from-amber-500/20 to-orange-500/10',
            border: 'border-amber-500/30',
            text: 'text-amber-400',
            sub: pendingCertificates > 0 ? '⚠️ Needs review' : '✅ All cleared',
          },
          {
            label: 'Active Complaints',
            value: activeComplaints,
            icon: '🚨',
            gradient: 'from-rose-500/20 to-red-500/10',
            border: 'border-rose-500/30',
            text: 'text-rose-400',
            sub: activeComplaints > 0 ? '⚠️ Action needed' : '✅ All resolved',
          },
          {
            label: 'Total Certificates',
            value: totalCerts,
            icon: '📄',
            gradient: 'from-sky-500/20 to-blue-500/10',
            border: 'border-sky-500/30',
            text: 'text-sky-400',
            sub: 'Ward applications',
          },
          {
            label: 'Resolved Complaints',
            value: resolvedComplaints,
            icon: '✅',
            gradient: 'from-emerald-500/20 to-green-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            sub: 'Closed this cycle',
          },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-2xl p-5 backdrop-blur-sm`}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className={`text-3xl font-bold ${s.text} mb-1`}>{s.value}</div>
            <div className="text-white/70 text-xs font-semibold">{s.label}</div>
            <div className="text-white/40 text-xs mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className={`group relative bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 ${
                m.available
                  ? 'hover:bg-white/10 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-xl'
                  : 'opacity-40 pointer-events-none'
              }`}
            >
              {!m.available && (
                <span className="absolute top-3 right-3 text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full">Soon</span>
              )}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl mb-4 shadow-lg ${m.available ? 'group-hover:scale-110' : ''} transition-transform`}>
                {m.icon}
              </div>
              <div className="text-white font-semibold text-sm mb-1">{m.title}</div>
              <div className="text-white/50 text-xs leading-relaxed">{m.desc}</div>
              {m.available && (
                <div className="mt-3 text-orange-400 text-xs font-medium">Open →</div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-white/10">
        <p className="text-white/25 text-xs">Wandhale Gram Panchayat Digital Platform • Ward {wardNo}</p>
      </div>
    </main>
  );
}
