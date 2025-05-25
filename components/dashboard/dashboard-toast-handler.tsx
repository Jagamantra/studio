
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Function to get last message from sessionStorage
const getLastMessage = () => {
  if (typeof window === 'undefined') return null;
  const message = sessionStorage.getItem('dashboard_message');
  sessionStorage.removeItem('dashboard_message'); // Clear after reading
  return message;
};

export function DashboardToastHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const message = getLastMessage();
    
    if (message === 'access_denied_role') {
      toast({
        title: 'Access Denied',
        message: 'You do not have permission for the requested page.',
        variant: 'destructive',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return null; // This component doesn't render anything itself
}
