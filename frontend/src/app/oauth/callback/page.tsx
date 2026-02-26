'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Save token to localStorage
      localStorage.setItem('authToken', token);

      // Refresh user data and redirect
      refreshUser().then(() => {
        router.push('/products');
      });
    } else {
      router.push('/login');
    }
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Completing sign in...</div>
    </div>
  );
}