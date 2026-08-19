import { updateUser } from '@/actions/admin/users';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PrismaUserRole } from '@/lib/db';

export default async function AdminUsersEditPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id }
  });

  if (!user) {
    redirect('/admin/dashboard/users');
  }

  // Bind the id to the server action
  const updateUserWithId = updateUser.bind(null, user.id);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard/users" className="text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-[#018749]">Edit User</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form action={updateUserWithId} className="space-y-4">
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              required 
              defaultValue={user.name}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#018749]"
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input 
              type="tel" 
              name="mobile" 
              id="mobile" 
              required 
              pattern="[0-9]{10}"
              defaultValue={user.mobile}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#018749]"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              name="role" 
              id="role" 
              required
              defaultValue={user.role}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#018749]"
            >
              <option value={PrismaUserRole.USER}>Citizen (USER)</option>
              <option value={PrismaUserRole.ADMIN}>Admin (ADMIN)</option>
              <option value={PrismaUserRole.SUPER_ADMIN}>Super Admin (SUPER_ADMIN)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link 
              href="/admin/dashboard/users"
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="px-4 py-2 bg-[#018749] text-white rounded-md shadow hover:bg-[#006400] transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
