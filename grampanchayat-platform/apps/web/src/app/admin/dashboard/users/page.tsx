import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteUser } from '@/actions/admin/users';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className="flex-1 bg-gray-50 flex flex-col min-h-screen">
      {/* Header Bar matching standard Admin UI */}
      <header className="bg-orange-700 text-white px-8 py-5 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">Admin Control Panel</p>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>👥</span> Users Management
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/dashboard/users/create"
            className="text-xs bg-white text-orange-700 px-4 py-2 rounded-full font-bold hover:bg-orange-100 transition shadow-xs flex items-center gap-1"
          >
            + Add New User
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-xs bg-orange-800 text-white border border-orange-600/60 px-4 py-2 rounded-full font-semibold hover:bg-orange-900 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8 w-full flex-1">
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.mobile}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/dashboard/users/${user.id}/edit`} className="text-orange-600 hover:text-orange-900 font-bold text-xs">
                        Edit
                      </Link>
                      <form action={async () => {
                        'use server';
                        await deleteUser(user.id);
                      }}>
                        <button type="submit" className="text-red-600 hover:text-red-900 font-bold text-xs">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
