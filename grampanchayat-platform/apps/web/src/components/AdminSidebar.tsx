'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const NAV_ITEMS = [
  { label: 'Dashboard',          href: '/admin/dashboard',               icon: '🏠' },
  { label: 'Certificates',       href: '/admin/dashboard/certificates',  icon: '📜' },
  { label: 'Complaints',         href: '/admin/dashboard/complaints',    icon: '📣' },
  { label: 'Schemes',            href: '/admin/dashboard/schemes',       icon: '💼' },
  { label: 'Notice Publishing',  href: '#',                              icon: '📢', disabled: true },
  { label: 'Project Updates',    href: '#',                              icon: '🏗️', disabled: true },
  { label: 'Gram Sabha',         href: '#',                              icon: '🏛️', disabled: true },
  { label: 'Agent Approvals',    href: '#',                              icon: '🤖', disabled: true },
];

interface AdminSidebarProps {
  name: string;
  wardNo: number;
}

export default function AdminSidebar({ name, wardNo }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 flex flex-col z-40" style={{ backgroundColor: '#018749' }}>

      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0 border border-white/30">🏛️</div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">ग्रामपंचायत</p>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{name}</p>
            <p className="text-white/60 text-xs">Ward {wardNo} — Sarpanch</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold px-3 mb-3">Navigation</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          if (item.disabled) {
            return (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-40 cursor-not-allowed">
                <span className="text-sm w-5 text-center">{item.icon}</span>
                <span className="text-white/70 text-sm truncate">{item.label}</span>
                <span className="ml-auto text-[9px] text-white/40 bg-white/10 px-1.5 py-0.5 rounded-full shrink-0">Soon</span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-white text-[#018749] font-semibold shadow-md'
                  : 'text-white/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              <span className="text-sm w-5 text-center">{item.icon}</span>
              <span className="text-sm truncate">{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#018749] shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/20 space-y-0.5">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/15 transition-all text-sm">
          <span className="text-sm w-5 text-center">🌐</span>
          <span>Public Portal</span>
        </Link>
        <LogoutButton
          label="Logout"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all text-sm text-left"
        />
      </div>
    </aside>
  );
}
