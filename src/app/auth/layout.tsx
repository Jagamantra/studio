
'use client'; 

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/theme-provider'; 

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { appName } = useTheme(); 

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-4 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 sm:h-10 sm:w-10 text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {appName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome! Please sign in or create an account.
          </p>
        </div>
        {children}
        <p className="mt-6 sm:mt-8 px-4 sm:px-8 text-center text-xs sm:text-sm text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
