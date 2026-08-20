import { headers } from 'next/headers';
import { getUsers } from '@/lib/db';
import AdminSidebar from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const userId = h.get('x-user-id') ?? '';
  const name = h.get('x-user-name') ?? '';

  const allUsers = await getUsers();
  const dbUser = allUsers.find((u) => u.id === userId);
  const displayName = dbUser?.fullName || (name && name !== 'Admin' ? name : 'Mayur Aglawe');
  const wardNo = dbUser?.ward_no ?? 1;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
      {/* Sidebar */}
      <AdminSidebar name={displayName} wardNo={wardNo} />

      {/* Main Content — offset by sidebar width */}
      <div className="ml-64 flex-1 min-h-screen flex flex-col bg-gray-50">
        {children}
      </div>
    </div>
  );
}
