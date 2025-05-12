
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isConfigured } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isConfigured) {
        // Potentially show a message or redirect to a setup guide if Firebase isn't configured
        // For now, this will likely fall through to login if user is null.
        console.warn("Firebase not configured, redirecting to login as fallback.");
      }

      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router, isConfigured]);

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
