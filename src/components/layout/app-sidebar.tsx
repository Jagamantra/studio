
'use client';

import React, { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
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
    setAppVersion(themeAppVersion); 
  }, [themeAppVersion]);

  const handleAppVersionChange = (newVersion: string) => {
    setAppVersion(newVersion); 
    setThemeAppVersion(newVersion); 
  };
  
  const resolvedAppVersionForDisplay = isClient ? appVersion : projectConfig.defaultAppVersionId;
  const currentVersionDetails = projectConfig.availableAppVersions.find(v => v.id === resolvedAppVersionForDisplay);
  const currentVersionName = currentVersionDetails?.name || (isClient ? 'Select Version' : projectConfig.availableAppVersions.find(v=>v.id === projectConfig.defaultAppVersionId)?.name || 'Loading...');


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-between">
          {/* Version Switcher Dropdown - Now on the left */}
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                   <Button 
                      variant="outline" 
                      className="w-40 justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                      disabled={!isClient}
                    >
                      <GitBranch className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{currentVersionName}</span>
                  </Button>
              </DropdownMenuTrigger>
              {isClient && (
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

