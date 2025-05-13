'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/contexts/theme-provider';

export function ThemedSonnerToaster() {
  const { theme } = useTheme(); // theme can be 'light', 'dark', 'system'

  return (
    <SonnerToaster
      theme={theme as 'light' | 'dark' | 'system'}
      richColors
      // closeButton={false} // Per user request "here x button dont need" - Sonner does not show global close by default.
      // Individual toasts can have close buttons. If this refers to the Radix <ToastClose>, it's not used here.
      // The action button styling with accent color is handled in `hooks/use-toast.tsx`.
    />
  );
}
