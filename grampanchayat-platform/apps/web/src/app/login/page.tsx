'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const from = searchParams.get('from');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: formData.get('mobile'),
          pin: formData.get('pin'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to original destination or role-based dashboard
      router.push(from || data.redirectTo || '/dashboard/user');
      router.refresh();

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex justify-center mb-6">
          <Image
            alt="Gram Panchayat Emblem"
            className="h-16 w-16 object-contain"
            width={64} height={64}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwOt3btzGAHdEQqUYDDZKkpFf86hD13iuogwK5sJ6n1mHhFpvadD8fyKz3ofQitSvIvBCLiU2NPyoxgDk7RSvGKrf4kVNScPjE8n0G4SfDiAqxu12bjV7FyuoFMElaBCruoRSICbBWHnyOz2kn-Vy0sRzowqH1n3_IvlafFpvweNAkhbIMcTlmt59uiekLrgEFBfwmmIs3I1pEqxhL-hViuTS6SzNmg1mY_cD3-F7ILpzHTIINaSE"
          />
        </div>
        <h2 className="mt-2 text-center text-headline-lg font-headline-lg text-on-surface">
          Sign In
        </h2>
        <p className="mt-2 text-center text-body-md text-on-surface-variant">
          Gram Panchayat Digital Services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface dark:bg-inverse-surface py-8 px-4 shadow-sm border border-outline-variant sm:rounded-xl sm:px-10">

          {/* Success banner after registration */}
          {registered && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md text-center">
              ✅ Registration successful! Please sign in.
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="mobile" className="block text-label-md font-label-md text-on-surface">
                Mobile Number
              </label>
              <div className="mt-1">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-outline-variant rounded-md shadow-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-primary focus:border-primary sm:text-body-md text-on-surface bg-surface-container-lowest"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pin" className="block text-label-md font-label-md text-on-surface">
                4-Digit PIN
              </label>
              <div className="mt-1">
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-outline-variant rounded-md shadow-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-primary focus:border-primary sm:text-body-md text-on-surface bg-surface-container-lowest text-center tracking-widest text-lg"
                  placeholder="••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-label-md font-label-md text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-on-surface-variant text-label-md font-label-md">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center py-2 px-4 border border-primary rounded-full shadow-sm text-label-md font-label-md text-primary bg-surface hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Create a new account
              </Link>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
