
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isConfigured } = useAuth(); // isConfigured will be false

  useEffect(() => {
    if (!loading) {
      if (!isConfigured) { // This will always be true as Firebase is removed
        // For now, this will fall through to login if user is null or previewAdmin.
        console.warn("Application is in mock API mode. All data is dummy data. Redirecting based on auth state.");
      }

      // If user exists and is not the previewAdmin, or if it is the previewAdmin but we want to show dashboard
      if (user) { 
        router.replace('/dashboard');
      } else {
        // This case should ideally not be hit if AuthProvider correctly sets a previewAdmin/default user
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

