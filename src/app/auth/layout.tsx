'use client'; 

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/theme-provider'; 
import { ThemeSwitcher } from '@/components/layout/theme-switcher';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { appName } = useTheme(); 

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted/40 px-2 py-8 sm:p-4 md:p-6"> {/* Changed justify-center to py-8, added px-2 */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-4 sm:mb-6 flex flex-col items-center text-center">
          <Link href="/" className="mb-2 sm:mb-3 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 sm:h-8 sm:w-8 text-primary"> {/* Slightly smaller icon */}
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground"> {/* Slightly smaller title */}
            {appName}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Welcome! Please sign in or create an account.
          </p>
        </div>
        
        <div className="w-full mb-8">
            {children}
        </div>

        <p className="mt-3 sm:mt-4 px-2 text-center text-[10px] sm:text-xs text-muted-foreground"> {/* Reduced margin and padding */}
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
  );
}
