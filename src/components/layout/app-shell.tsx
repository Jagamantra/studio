'use client';

import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; 

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      {/* SidebarInset is the main content wrapper that adapts to the sidebar */}
      <SidebarInset className="flex flex-col"> {/* Ensures SidebarInset itself is a flex column */}
        <Header />
        {/* This div contains the page content and is responsible for scrolling */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden bg-background">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
