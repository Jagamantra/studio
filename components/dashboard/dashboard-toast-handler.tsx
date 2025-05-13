
'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const TOAST_MESSAGE_KEY = 'toast_message';

export function DashboardToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Ensure this effect only runs on the client after initial mount
    if (typeof window === 'undefined') {
      return;
    }
    
    const messageType = searchParams.get(TOAST_MESSAGE_KEY);
    
    if (messageType === 'access_denied_role') {
      toast({
        title: 'Access Denied',
        message: 'You do not have permission for the requested page.',
        variant: 'destructive',
      });
      // Clean up the URL by removing the toast_message query parameter
      const currentPath = window.location.pathname;
      const params = new URLSearchParams(searchParams.toString()); // searchParams.toString() is safe
      if (params.has(TOAST_MESSAGE_KEY)) {
          params.delete(TOAST_MESSAGE_KEY);
          const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
          router.replace(newUrl, { shallow: true }); 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // router and toast are stable, so not including them.

  return null; // This component doesn't render anything itself
}
