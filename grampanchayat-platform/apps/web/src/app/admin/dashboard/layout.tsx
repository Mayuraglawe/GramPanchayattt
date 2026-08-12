import { headers } from 'next/headers';
import { getUsers } from '@/lib/db';
import AdminSidebar from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const userId = h.get('x-user-id') ?? '';
  const name = h.get('x-user-name') ?? 'Admin';

  const allUsers = await getUsers();
  const dbUser = allUsers.find((u) => u.id === userId);
  const wardNo = dbUser?.ward_no ?? 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-950/30 to-slate-900 font-sans">
      {/* Sidebar */}
      <AdminSidebar name={name} wardNo={wardNo} />

      {/* Main Content — offset by sidebar width */}
      <div className="ml-64 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
