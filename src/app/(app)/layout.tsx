
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { redirect } from 'next/navigation'; // For server-side redirect if needed
// import { checkAuth } from '@/lib/auth-server'; // Hypothetical server-side auth check

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side auth check example (if implemented)
  // const { isAuthenticated, userRole } = await checkAuth();
  // if (!isAuthenticated) {
  //   redirect('/login');
  // }

  // For this template, client-side auth check is primary via AuthProvider.
  // This layout assumes AuthProvider has already handled redirection if not authenticated.

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
