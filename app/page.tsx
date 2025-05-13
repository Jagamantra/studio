
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isMfaVerified } = useAuth(); // Added isMfaVerified

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

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Loading application...</p>
        <p className="text-sm text-muted-foreground">Please wait while we prepare your experience.</p>
      </div>
    </div>
  );
}
