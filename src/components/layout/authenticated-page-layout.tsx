'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';

export function AuthenticatedPageLayout({ children }: { children: ReactNode }) {
  // This component replaces the (app)/layout.tsx functionality
  // It ensures all authenticated pages share the same AppShell structure
  return <AppShell>{children}</AppShell>;
}
