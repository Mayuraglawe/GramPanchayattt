import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteUser } from '@/actions/admin/users';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#018749]">Manage Users</h1>
        <Link 
          href="/admin/dashboard/users/create"
          className="bg-[#018749] text-white px-4 py-2 rounded shadow hover:bg-[#006400] transition"
        >
          + Add User
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mobile}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/dashboard/users/${user.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </Link>
                    <form action={async () => {
                      'use server';
                      await deleteUser(user.id);
                    }}>
                      <button type="submit" className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
