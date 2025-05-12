
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { projectConfig } from '@/config/project.config';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-4 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {projectConfig.appName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome! Please sign in or create an account.
          </p>
        </div>
        {children}
        <p className="mt-8 px-8 text-center text-sm text-muted-foreground">
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
