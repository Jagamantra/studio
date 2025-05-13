'use client';
import { useTheme } from '@/contexts/theme-provider';
import type { ReactNode } from 'react';
import { FileText } from 'lucide-react'; // Import a generic icon

interface PageTitleWithIconProps {
  title: string;
  children?: ReactNode; // For additional elements like buttons next to title
}

export function PageTitleWithIcon({ title, children }: PageTitleWithIconProps) {
  const { appIconPaths } = useTheme(); // These come from projectConfig.appIconPaths

  // Determine if a global app icon is configured
  const hasGlobalAppIcon = appIconPaths && appIconPaths.length > 0;

  return (
    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center mb-4 md:mb-6">
      <div className="flex items-center gap-2">
        {!hasGlobalAppIcon && ( // Show generic icon ONLY if NO global app icon is set
          <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
        )}
        {/* If hasGlobalAppIcon, no icon is rendered here by PageTitleWithIcon, as the app icon is in the main header */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2 self-start sm:self-center">{children}</div>}
    </div>
  );
}
