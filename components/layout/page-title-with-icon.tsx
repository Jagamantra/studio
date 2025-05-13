'use client';
import { useTheme } from '@/contexts/theme-provider';
import type { ReactNode } from 'react';

interface PageTitleWithIconProps {
  title: string;
  children?: ReactNode; // For additional elements like buttons next to title
}

export function PageTitleWithIcon({ title, children }: PageTitleWithIconProps) {
  const { appIconPaths } = useTheme();
  return (
    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center mb-4 md:mb-6">
      <div className="flex items-center gap-2">
        {appIconPaths && appIconPaths.length > 0 && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" // Added flex-shrink-0
          >
            {appIconPaths.map((d, index) => (
              <path key={index} d={d}></path>
            ))}
          </svg>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2 self-start sm:self-center">{children}</div>}
    </div>
  );
}
