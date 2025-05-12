
'use client';

import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'; // Using shadcn's SidebarProvider

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}> {/* Manage sidebar open state here */}
      <AppSidebar />
      <SidebarInset className="flex flex-col"> {/* This is where main content will go */}
        <Header className="md:hidden" /> {/* Show header for mobile view inside content area */}
        <div className="hidden md:flex items-center justify-between border-b h-16 px-6"> {/* Desktop header portion */}
          <SidebarTrigger/> {/* Desktop toggle for sidebar, inside content area */}
          <div className="flex-grow"></div> {/* Spacer */}
          {/* Desktop header elements (ThemeSwitcher, UserNav) are in the main Header component, 
              but AppSidebar may also need UserNav for its footer. Consider structure.
              For now, global Header is fine for desktop, and mobile header is separate.
              This is a common pattern for sidebars that push content.
              Let's ensure Header is structured to be usable in both contexts or have variants.
              The current Header is sticky.
              The main content area will have its own Header for mobile, distinct from global sticky header.
              Alternative: a single Header that adapts.
              For now, Header is global, and SidebarInset takes the rest of the space.
              Let's simplify: Header is always outside SidebarInset. SidebarInset contains only page content.
          */}
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Revised AppShell to use a single global Header and AppSidebar from shadcn ui/sidebar
export function AppShellRevised({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
        <AppSidebar /> {/* This will render fixed or as part of the flow based on its internal logic */}
        <div className="flex flex-col flex-1 min-h-0"> {/* This div takes remaining space */}
            <Header /> {/* Sticky Header on top of content */}
            <SidebarInset> {/* main content area */}
                 {children}
            </SidebarInset>
        </div>
    </SidebarProvider>
  );
}

// Simpler AppShell with shadcn/ui/sidebar:
// SidebarProvider wraps everything.
// AppSidebar is the actual sidebar component.
// SidebarInset is the main content area that resizes.
// Header is placed *inside* SidebarInset or above it.
// Let's place Header inside SidebarInset for typical dashboard layouts.

export function AppShellFinal({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true} 
      // Example of controlling open state from outside (e.g. via URL param or global state)
      // open={true} 
      // onOpenChange={(isOpen) => console.log("Sidebar open state:", isOpen)}
    >
      <AppSidebar /> {/* This uses shadcn's <Sidebar> which is position:fixed or similar */}
      <SidebarInset> {/* This is the main content area, which will have margin-left adjusted by <Sidebar> */}
        <Header /> {/* Header for the content area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Use the final version as it aligns best with shadcn/ui/sidebar behavior
export { AppShellFinal as AppShell };
