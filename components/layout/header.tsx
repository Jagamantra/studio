
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
import { usePathname, useSearchParams } from 'next/navigation';

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  customers: 'Customer Management',
  profile: 'profile',
  'customers/form?mode=create': 'Add Customer',
  'config-advisor': 'Application Settings',
  // Add more as needed
};

export function Header({ className }: { className?: string }) {
  const { appName, appIconPaths, appLogoUrl } = useTheme(); 
   const pathname = usePathname();
    const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  let title = routeMap[cleanPath] || "";

  // Optional: customize title further based on query params
  if (cleanPath === 'customers/form' && mode === 'create') {
    title = 'Add Customer';
  } else if (cleanPath === 'customers/form' && mode === 'edit') {
    title = 'Edit Customer'
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="mr-2 md:hidden"> 
             <SidebarTrigger />
          </div>
          <div  className="flex items-center space-x-2 justify-center mt-6">
          <PageTitleWithIcon title={title}/>
          </div>
          {/* <Link href="/dashboard" className="flex items-center space-x-2">
            {appLogoUrl ? (
              <Image 
                src={appLogoUrl} 
                alt={`${appName} logo`} 
                width={24} 
                height={24} 
                className="h-6 w-6 object-contain" 
                data-ai-hint="application logo"
              />
            ) : appIconPaths && appIconPaths.length > 0 ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6 text-primary"
              >
                {appIconPaths.map((d, index) => (
                  <path key={index} d={d}></path>
                ))}
              </svg>
            ) : (
              <FileText className="h-6 w-6 text-primary" /> 
            )}
            <span className="font-bold sm:inline-block text-lg">
              {appName}
            </span>
          </Link> */}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeSwitcher />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
