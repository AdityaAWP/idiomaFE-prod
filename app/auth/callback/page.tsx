'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens, loadTokens, auth as authApi } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      router.replace('/dashboard');
    } else {
      setError('Google sign-in failed. No tokens received.');
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <a href="/login" className="text-sm text-gray-700 underline">Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
