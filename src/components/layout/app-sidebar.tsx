
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/main-nav';
import { sidebarConfig } from '@/config/sidebar.config';
import { projectConfig } from '@/config/project.config';
import { useTheme } from '@/contexts/theme-provider';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose, GitBranch } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export function AppSidebar() {
  const { appVersion: themeAppVersion, setAppVersion: setThemeAppVersion } = useTheme();
  const { toggleSidebar, state: sidebarState } = useSidebar();
  
  // Local state for appVersion to avoid hydration issues
  const [appVersion, setAppVersion] = useState(projectConfig.defaultAppVersionId);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Sync with theme provider's version once on client
    setAppVersion(themeAppVersion); 
  }, [themeAppVersion]);

  const handleAppVersionChange = (newVersion: string) => {
    setAppVersion(newVersion); // Update local state
    setThemeAppVersion(newVersion); // Update theme provider state
  };
  
  const currentAppVersionDetails = projectConfig.availableAppVersions.find(v => v.id === appVersion);

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-between ">
           <Link href="/dashboard" className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:hidden">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-sidebar-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            <h1 className="text-lg font-semibold text-sidebar-foreground">{projectConfig.appName}</h1>
          </Link>
          {/* Desktop sidebar toggle button */}
          <Button variant="ghost" size="icon" className="hidden md:flex text-sidebar-foreground" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarState === 'expanded' ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </div>

        {/* Version Switcher Dropdown */}
        {isClient && ( // Only render on client to avoid hydration mismatch for DropdownMenu content
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                   <Button variant="outline" className="w-full justify-start mt-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                      <GitBranch className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{currentAppVersionDetails?.name || 'Select Version'}</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--sidebar-width)] group-data-[collapsible=icon]:w-auto" side="bottom" align="start">
                   <DropdownMenuRadioGroup value={appVersion} onValueChange={handleAppVersionChange}>
                      {projectConfig.availableAppVersions.map(version => (
                      <DropdownMenuRadioItem key={version.id} value={version.id}>
                          {version.name}
                      </DropdownMenuRadioItem>
                      ))}
                  </DropdownMenuRadioGroup>
              </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        <MainNav items={sidebarConfig.items} />
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {/* User profile section removed as per request */}
      </SidebarFooter>
    </Sidebar>
  );
}
