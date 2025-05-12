
'use client';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { UserNav } from '@/components/layout/user-nav';
import { projectConfig } from '@/config/project.config';
import { SidebarTrigger } from '@/components/ui/sidebar'; // From shadcn sidebar
import { cn } from '@/lib/utils';

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
           {/* SidebarTrigger is part of the shadcn/ui Sidebar component, used by AppShell */}
          <div className="mr-2 md:hidden"> {/* Only show on mobile, AppShell handles desktop trigger */}
             <SidebarTrigger />
          </div>
          <Link href="/dashboard" className="flex items-center space-x-2">
            {/* Placeholder for a logo SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="font-bold sm:inline-block text-lg">
              {projectConfig.appName}
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeSwitcher />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
