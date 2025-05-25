
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarTrigger } from '@/components/ui/sidebar'; 
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-provider'; 
import { FileText } from 'lucide-react'; // Default icon
import { PageTitleWithIcon } from './page-title-with-icon';
import { usePathname } from 'next/navigation';

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  customers: 'Customer Management',
  profile: 'Profile',
  'customers/create': 'Add Customer',
  'config-advisor': 'Application Settings',
  // Add more as needed
};

export function Header({ className }: { className?: string }) {
  const { appName, appIconPaths, appLogoUrl } = useTheme(); 
  const pathname = usePathname();

  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const pathSegments = cleanPath.split('/');

  let title = routeMap[cleanPath] || "";

  // Handle dynamic routes with better path segment checking
  if (pathSegments[0] === 'customers') {
    if (pathSegments[1] === 'create') {
      title = 'Add Customer';
    } else if (pathSegments[2] === 'edit') {
      title = 'Edit Customer';
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {/* The main container for header content. Uses justify-between to push left and right groups apart. */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Group: SidebarTrigger and App Logo/Name */}
        <div className="flex items-center">
          <div className="mr-2 md:hidden">
             <SidebarTrigger />
          </div>
         <div className="flex items-center space-x-2 justify-center mt-6">
          <PageTitleWithIcon title={title} />
        </div>
        </div>

       {/* Right Group: ThemeSwitcher and UserNav. */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeSwitcher />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
