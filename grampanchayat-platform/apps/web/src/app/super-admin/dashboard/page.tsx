import { headers } from 'next/headers';
import Link from 'next/link';
import { getUsers, getCertificates, getComplaints } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
  const h = await headers();
  const name = h.get('x-user-name') ?? 'Gram Sevak';

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
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;
  const totalCertificates = certificates.length;

  const modules = [
    { title: 'System Config', desc: 'Manage API gateways & platform rules', icon: '⚙️', href: '/super-admin/dashboard/settings', available: true },
    { title: 'Audit Logs',    desc: 'View immutable system activity records', icon: '🔍', href: '/super-admin/dashboard/audit-logs', available: true },
    { title: 'Users',         desc: 'Manage admins, roles, and citizens', icon: '👤', href: '#', available: false },
    { title: 'Certificates',  desc: 'Approve or reject incoming requests', icon: '📜', href: '#', available: false },
    { title: 'Complaints',    desc: 'Track and resolve citizen grievances', icon: '📣', href: '#', available: false },
    { title: 'Finance',       desc: 'Manage panchayat budgets and expenses', icon: '💰', href: '#', available: false },
    { title: 'Projects',      desc: 'Track development projects and tenders', icon: '🏗️', href: '#', available: false },
    { title: 'Reports',       desc: 'Generate analytics and annual reports', icon: '📊', href: '#', available: false },
  ];

  return (
    <main className="flex-1 p-6 md:p-8 bg-gray-50 min-h-screen">

      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
           <h2 className="text-[#111827] text-2xl font-bold mb-1">Panchayat Administration</h2>
           <p className="text-[#6B7280] text-[13px]">Welcome back, {name}. Manage your panchayat data here.</p>
        </div>
      </div>

      {/* Stats Grid - 5 Col Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Registered Users',      value: totalUsers,          icon: '👥', colorBorder: 'border-l-[#2563EB]', colorIconBg: 'bg-blue-50', colorIcon: 'text-[#2563EB]' },
          { label: 'Pending Certificates',  value: pendingCertificates, icon: '📋', colorBorder: 'border-l-[#D97706]', colorIconBg: 'bg-amber-50', colorIcon: 'text-[#D97706]' },
          { label: 'Open Complaints',       value: activeComplaints,    icon: '🚨', colorBorder: 'border-l-[#DC2626]', colorIconBg: 'bg-red-50', colorIcon: 'text-[#DC2626]' },
          { label: 'Resolved Complaints',   value: resolvedComplaints,  icon: '✅', colorBorder: 'border-l-[#059669]', colorIconBg: 'bg-green-50', colorIcon: 'text-[#059669]' },
          { label: 'Total Certificates',    value: totalCertificates,   icon: '📄', colorBorder: 'border-l-[#0F7A4C]', colorIconBg: 'bg-[#E6F4EC]', colorIcon: 'text-[#0F7A4C]' },
        ].map((s) => (
          <div key={s.label} className={`bg-white border-y border-r border-[#E5E7EB] border-l-[4px] ${s.colorBorder} rounded-xl p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] text-[#6B7280] font-medium">{s.label}</div>
              <div className={`w-8 h-8 rounded-full ${s.colorIconBg} ${s.colorIcon} flex items-center justify-center text-sm`}>
                {s.icon}
              </div>
            </div>
            <div className="text-[32px] font-bold text-[#111827] leading-none">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid - 3 Col Desktop */}
      <div className="mb-6">
        <h3 className="text-[#111827] text-lg font-bold mb-4">Platform Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className={`group flex items-start gap-4 p-5 bg-white border border-[#E5E7EB] rounded-xl transition-all duration-200 ${
                m.available
                  ? 'hover:-translate-y-[2px] hover:shadow-md cursor-pointer'
                  : 'opacity-60 pointer-events-none'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg bg-[#E6F4EC] flex-shrink-0 flex items-center justify-center text-xl`}>
                {m.icon}
              </div>
              <div>
                <div className="text-[#111827] font-semibold text-sm mb-1 group-hover:text-[#0F7A4C] transition-colors">{m.title}</div>
                <div className="text-[#6B7280] text-[13px] leading-relaxed">{m.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
