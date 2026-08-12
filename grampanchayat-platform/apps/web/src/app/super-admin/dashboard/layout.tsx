import { headers } from 'next/headers';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const name = h.get('x-user-name') ?? 'Gram Sevak';

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-[#0F7A4C] fixed top-0 w-full z-50 flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm">
            🏛️
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">
            Gram Panchayat
          </span>
        </div>
        <div className="flex items-center gap-5">
          {/* Search Icon */}
          <button className="text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          
          {/* Notification Bell */}
          <button className="relative text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span className="absolute -top-0.5 -right-0.5 block w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#0F7A4C]" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-1" />

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden md:block">
              <div className="text-white text-[13px] font-bold leading-tight">{name}</div>
              <div className="text-white/70 text-[11px] font-medium leading-tight">Gram Sevak</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white text-[#0F7A4C] font-bold text-sm flex items-center justify-center shadow-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 group-hover:text-white transition-colors"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SuperAdminSidebar />

        {/* Main Content — offset by sidebar width */}
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
