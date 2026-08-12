'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const NAV_ITEMS = [
  { label: 'Dashboard',           href: '/super-admin/dashboard',                   icon: '📊', group: 'Overview' },
  { label: 'Departments',         href: '#',                                        icon: '🏢', group: 'Management', disabled: true },
  { label: 'Staff & Faculty',     href: '#',                                        icon: '👥', group: 'Management', disabled: true },
  { label: 'Certificates',        href: '#',                                        icon: '📜', group: 'Management', disabled: true },
  { label: 'Complaints',          href: '#',                                        icon: '📣', group: 'Management', disabled: true },
  { label: 'Audit Logs',          href: '/super-admin/dashboard/audit-logs',        icon: '🔍', group: 'Platform' },
  { label: 'System Settings',     href: '/super-admin/dashboard/settings',          icon: '⚙️', group: 'Platform' },
  { label: 'User Management',     href: '#',                                        icon: '👤', group: 'Platform', disabled: true },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  
  const renderItem = (item: typeof NAV_ITEMS[0]) => {
    const isActive = pathname === item.href;

    if (item.disabled) {
      return (
        <div key={item.label} className="flex items-center gap-3 px-4 py-2.5 opacity-40 cursor-not-allowed border-l-[3px] border-transparent">
          <span className="text-lg w-5 text-center grayscale">{item.icon}</span>
          <span className="text-white/50 font-medium text-[13px]">{item.label}</span>
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 transition-colors font-medium text-[13px] ${
          isActive
            ? 'bg-white/10 text-white border-l-[3px] border-white'
            : 'text-white/70 hover:bg-white/5 border-l-[3px] border-transparent hover:text-white'
        }`}
      >
        <span className="text-lg w-5 text-center">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
      </Link>
    );
  };

  const overviewItems = NAV_ITEMS.filter(i => i.group === 'Overview');
  const managementItems = NAV_ITEMS.filter(i => i.group === 'Management');
  const platformItems = NAV_ITEMS.filter(i => i.group === 'Platform');

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-[#0F7A4C] via-[#0F7A4C] via-60% to-white border-r border-gray-200/50 flex flex-col z-40 shadow-sm">
      <nav className="flex-1 py-6 overflow-y-auto space-y-6">
        
        <div className="space-y-1">
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider px-6 mb-2">Overview</p>
          {overviewItems.map(renderItem)}
        </div>

        <div className="space-y-1">
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider px-6 mb-2">Management</p>
          {managementItems.map(renderItem)}
        </div>

        <div className="space-y-1">
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider px-6 mb-2">Platform</p>
          {platformItems.map(renderItem)}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-white/40 backdrop-blur-sm">
        <LogoutButton
          label="Logout"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-red-600 font-bold hover:bg-red-50 hover:text-red-700 transition-colors text-[13px] border border-red-100 bg-white shadow-sm"
        />
      </div>
    </aside>
  );
}
