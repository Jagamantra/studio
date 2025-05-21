
'use client';
import { useTheme } from '@/contexts/theme-provider';
import type { ReactNode } from 'react';
import { FileText } from 'lucide-react'; 
import Image from 'next/image';

interface PageTitleWithIconProps {
  title: string;
  children?: ReactNode; 
}

export function PageTitleWithIcon({ title, children }: PageTitleWithIconProps) {
  const { appIconPaths, appLogoUrl, appName } = useTheme(); 

  const hasConfiguredAppLogo = !!appLogoUrl;
  const hasConfiguredAppIconPaths = appIconPaths && appIconPaths.length > 0;

  return (
    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center mb-4 md:mb-6">
      <div className="flex items-center gap-2">
        {hasConfiguredAppLogo ? (
          <Image 
            src={appLogoUrl!} 
            alt={`${appName} logo`}
            width={28} 
            height={28} 
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
            data-ai-hint="application logo"
          />
        ) : hasConfiguredAppIconPaths ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0"
            aria-label="Application Icon"
          >
            {appIconPaths.map((d, index) => (
              <path key={index} d={d}></path>
            ))}
          </svg>
        ) : (
          <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" aria-label="Page Icon" />
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2 self-start sm:self-center">{children}</div>}
    </div>
  );
}
