
'use client';

import React, { useEffect, useState } from 'react';
// Link import removed as it's no longer used for app name/icon
// import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  // SidebarTrigger, // This is a general trigger, specific toggle is used below
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
  // DropdownMenuItem, // Not used directly here
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export function AppSidebar() {
  const { appVersion: themeAppVersion, setAppVersion: setThemeAppVersion } = useTheme();
  const { toggleSidebar, state: sidebarState } = useSidebar();
  
  const [appVersion, setAppVersion] = useState(projectConfig.defaultAppVersionId);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Sync with theme provider's version once on client
    // This might cause intended hydration difference for appVersion controlled elements.
    setAppVersion(themeAppVersion); 
  }, [themeAppVersion]);

  const handleAppVersionChange = (newVersion: string) => {
    setAppVersion(newVersion); 
    setThemeAppVersion(newVersion); 
  };
  
  // Safely determine version name for SSR and client
  const resolvedAppVersionForDisplay = isClient ? appVersion : projectConfig.defaultAppVersionId;
  const currentVersionName = 
    projectConfig.availableAppVersions.find(v => v.id === resolvedAppVersionForDisplay)?.name || 
    (isClient ? 'Select Version' : projectConfig.availableAppVersions.find(v=>v.id === projectConfig.defaultAppVersionId)?.name || 'Loading...');


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-between">
          {/* Version Switcher Dropdown - Now on the left */}
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                   <Button 
                      variant="outline" 
                      className="justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                      disabled={!isClient} // Disable if not client-side ready
                    >
                      <GitBranch className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{currentVersionName}</span>
                  </Button>
              </DropdownMenuTrigger>
              {isClient && ( // Render content only on client to avoid hydration issues with DropdownMenuRadioGroup's value
                <DropdownMenuContent className="w-[var(--sidebar-width)] group-data-[collapsible=icon]:w-auto" side="bottom" align="start">
                     <DropdownMenuRadioGroup value={appVersion} onValueChange={handleAppVersionChange}>
                        {projectConfig.availableAppVersions.map(version => (
                        <DropdownMenuRadioItem key={version.id} value={version.id}>
                            {version.name}
                        </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              )}
          </DropdownMenu>

          {/* Desktop sidebar toggle button - Remains on the right */}
          <Button variant="ghost" size="icon" className="hidden md:flex text-sidebar-foreground" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarState === 'expanded' ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <MainNav items={sidebarConfig.items} />
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {/* User profile section was removed as per previous request */}
      </SidebarFooter>
    </Sidebar>
  );
}

