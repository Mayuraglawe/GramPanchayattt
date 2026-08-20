import { redirect } from 'next/navigation';

export default function SuperAdminRootRedirect() {
  redirect('/super-admin/dashboard');
}
