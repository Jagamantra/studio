'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoadingScreen } from '@/components/common/loading-screen';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isMfaVerified } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) { 
        if (!isMfaVerified) {
          router.replace('/auth/mfa');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/auth/login');
      }
    }
  }, [user, loading, router, isMfaVerified]);

  return <LoadingScreen />;
}
