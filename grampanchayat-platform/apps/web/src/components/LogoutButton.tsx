'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ label = 'Logout', className }: { label?: string; className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className={className}>
      {label}
    </button>
  );
}
