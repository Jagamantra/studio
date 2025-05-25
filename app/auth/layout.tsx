'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/theme-provider';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { FileText } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { appName, appIconPaths, appLogoUrl } = useTheme();

  return (
    <div className="min-h-screen w-full grid grid-rows-[auto,1fr]">
      <div className="absolute top-2 right-2 z-50 sm:top-4 sm:right-4 md:top-6 md:right-6">
        <ThemeSwitcher />
      </div>
      
      {/* Header Section with Logo and Welcome Message */}
      <div className="w-full flex justify-center p-4 pt-8 sm:pt-12 bg-background">
        <div className="w-full max-w-md flex flex-col items-center space-y-4">
          <Link href="/" className="inline-block">
            {appLogoUrl ? (
              <Image 
                src={appLogoUrl} 
                alt={`${appName} logo`} 
                width={36} 
                height={36} 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                data-ai-hint="application logo"
              />
            ) : appIconPaths && appIconPaths.length > 0 ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-8 w-8 sm:h-10 sm:w-10 text-primary"
              >
                {appIconPaths.map((d, index) => (
                  <path key={index} d={d}></path>
                ))}
              </svg>
            ) : (
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            )}
          </Link>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {appName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome! Please sign in or create an account.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full flex justify-center px-4 pb-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
