
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) { 
        // User object exists. This means the login/registration process has started.
        // AuthProvider will redirect to /auth/mfa if necessary.
        // MfaPage will redirect to /dashboard upon successful verification.
        // If the user lands on '/' and has a user object, assume they should go to dashboard
        // as AuthProvider should have already handled the MFA redirection if needed.
        router.replace('/dashboard');
      } else {
        // No user object, means not authenticated.
        router.replace('/auth/login');
      }
    }
  }, [user, loading, router]);

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
