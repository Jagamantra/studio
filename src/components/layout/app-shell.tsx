
'use client';

import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'; // Using shadcn's SidebarProvider

export function AppShellFinal({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar /> {/* This uses shadcn's <Sidebar> which is position:fixed or similar */}
      <SidebarInset> {/* This is the main content area, which will have margin-left adjusted by <Sidebar> */}
        <Header /> {/* Header for the content area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto"> {/* Ensured overflow and responsive padding */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Use the final version as it aligns best with shadcn/ui/sidebar behavior
export { AppShellFinal as AppShell };
