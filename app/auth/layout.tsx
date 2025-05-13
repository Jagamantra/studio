
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/theme-provider';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { appName, appIconPaths } = useTheme();

  return (
    // Outermost div for full-screen background
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="absolute top-2 right-2 z-50 sm:top-4 sm:right-4 md:top-6 md:right-6">
        <ThemeSwitcher />
      </div>

      {/* Inner container for content centering and padding */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* This div contains all the auth page content (logo, title, form, terms) */}
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="mb-4 sm:mb-6 flex flex-col items-center text-center">
            <Link href="/" className="mb-2 sm:mb-3 inline-block">
              {appIconPaths && appIconPaths.length > 0 && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-6 w-6 sm:h-8 sm:w-8 text-primary"
                >
                  {appIconPaths.map((d, index) => (
                    <path key={index} d={d}></path>
                  ))}
                </svg>
              )}
            </Link>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {appName}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Welcome! Please sign in or create an account.
            </p>
          </div>

          {/* Container for the actual form (login, register, mfa) */}
          <div className="w-full mb-4 sm:mb-6">
              {children}
          </div>

          {/* Terms and Policy links */}
          <p className="px-2 text-center text-[10px] sm:text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-primary"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
