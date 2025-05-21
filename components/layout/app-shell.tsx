
'use client';

import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; 
import { useTheme } from '@/contexts/theme-provider';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: ReactNode }) {
  const { interfaceDensity } = useTheme();

  const getPaddingClasses = () => {
    switch (interfaceDensity) {
      case 'compact':
        return 'p-2 md:p-3 lg:p-4';
      case 'comfortable':
        return 'p-4 md:p-6 lg:p-8';
      case 'spacious':
        return 'p-6 md:p-8 lg:p-10';
      default:
        return 'p-4 md:p-6 lg:p-8'; // Default to comfortable
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      {/* SidebarInset is the main content wrapper that adapts to the sidebar */}
      <SidebarInset className="flex flex-col flex-1"> {/* Ensures SidebarInset itself is a flex column and takes available width */}
        <Header />
        {/* This div contains the page content and is responsible for scrolling */}
        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden bg-background min-w-0",
          getPaddingClasses()
        )}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
