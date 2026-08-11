'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const pin = formData.get('pin') as string;
    const confirmPin = formData.get('confirmPin') as string;

    if (pin !== confirmPin) {
      setError('PINs do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.get('fullName'),
          mobile: formData.get('mobile'),
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      router.push('/login?registered=true');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex justify-center mb-6">
          <Image alt="Gram Panchayat Emblem" className="h-16 w-16 object-contain" width={64} height={64} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwOt3btzGAHdEQqUYDDZKkpFf86hD13iuogwK5sJ6n1mHhFpvadD8fyKz3ofQitSvIvBCLiU2NPyoxgDk7RSvGKrf4kVNScPjE8n0G4SfDiAqxu12bjV7FyuoFMElaBCruoRSICbBWHnyOz2kn-Vy0sRzowqH1n3_IvlafFpvweNAkhbIMcTlmt59uiekLrgEFBfwmmIs3I1pEqxhL-hViuTS6SzNmg1mY_cD3-F7ILpzHTIINaSE"/>
        </div>
        <h2 className="mt-2 text-center text-headline-lg font-headline-lg text-on-surface">
          Citizen Registration
        </h2>
        <p className="mt-2 text-center text-body-md text-on-surface-variant">
          Create an account for Gram Panchayat digital services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface dark:bg-inverse-surface py-8 px-4 shadow-sm border border-outline-variant sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-label-md font-label-md text-on-surface">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-outline-variant rounded-md shadow-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-primary focus:border-primary sm:text-body-md text-on-surface bg-surface-container-lowest"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobile" className="block text-label-md font-label-md text-on-surface">
                Mobile Number
              </label>
              <div className="mt-1">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-outline-variant rounded-md shadow-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-primary focus:border-primary sm:text-body-md text-on-surface bg-surface-container-lowest"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="aadhaar" className="block text-label-md font-label-md text-on-surface">
                Aadhaar Number (Optional)
              </label>
              <div className="mt-1">
                <input
                  id="aadhaar"
                  name="aadhaar"
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-outline-variant rounded-md shadow-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-primary focus:border-primary sm:text-body-md text-on-surface bg-surface-container-lowest"
                  placeholder="12-digit Aadhaar number"
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
              <label htmlFor="confirmPin" className="block text-label-md font-label-md text-on-surface">
                Confirm 4-Digit PIN
              </label>
              <div className="mt-1">
                <input
                  id="confirmPin"
                  name="confirmPin"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-label-md text-on-surface-variant">
              Already have an account?{' '}
              <Link href="/login" className="font-label-md text-primary hover:text-primary-container transition-colors">
                Sign in
              </Link>
            </p>
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
  );
}
