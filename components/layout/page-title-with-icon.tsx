
'use client';
import { useTheme } from '@/contexts/theme-provider';
import type { ReactNode } from 'react';
import { FileText } from 'lucide-react'; 
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PageTitleWithIconProps {
  title: string;
  children?: ReactNode; 
}

export function PageTitleWithIcon({ title, children }: PageTitleWithIconProps) {
  const { appIconPaths, appLogoUrl, appName, interfaceDensity } = useTheme(); 

  const hasConfiguredAppLogo = !!appLogoUrl;
  const hasConfiguredAppIconPaths = appIconPaths && appIconPaths.length > 0;

  const getMarginClasses = () => {
    switch (interfaceDensity) {
      case 'compact':
        return 'mb-3 md:mb-4';
      case 'comfortable':
        return 'mb-4 md:mb-6';
      case 'spacious':
        return 'mb-6 md:mb-8';
      default:
        return 'mb-4 md:mb-6';
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center",
      getMarginClasses()
    )}>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2 self-start sm:self-center">{children}</div>}
    </div>
  );
}
