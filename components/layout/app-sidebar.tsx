
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
    // Initialize appVersion from theme context, fallback to projectConfig default
    setAppVersion(themeAppVersion || projectConfig.defaultAppVersionId); 
  }, [themeAppVersion]);

  const handleAppVersionChange = (newVersion: string) => {
    setAppVersion(newVersion); 
    setThemeAppVersion(newVersion); 
  };
  
  const currentVersionDetails = projectConfig.availableAppVersions.find(v => v.id === appVersion);
  const currentVersionName = isClient && currentVersionDetails ? currentVersionDetails.name : (projectConfig.availableAppVersions.find(v=>v.id === projectConfig.defaultAppVersionId)?.name || 'Loading...');


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-2">
        {/* This div controls the layout of header items */}
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-stretch group-data-[collapsible=icon]:gap-2">
          
          {/* Desktop sidebar toggle button */}
          {/* When collapsed, this will be ordered first (top) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex text-sidebar-foreground group-data-[collapsible=icon]:order-first group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-8" 
            onClick={toggleSidebar} 
            aria-label="Toggle sidebar"
          >
            {sidebarState === 'expanded' ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>

          {/* Version Switcher Dropdown */}
          {/* When collapsed, this will be ordered last (bottom) */}
          <div className="group-data-[collapsible=icon]:order-last"> {/* Wrapper for ordering */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        className="w-40 justify-start group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                        disabled={!isClient}
                      >
                        <GitBranch className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{currentVersionName}</span>
                    </Button>
                </DropdownMenuTrigger>
                {isClient && (
                  <DropdownMenuContent 
                    className="w-[var(--sidebar-width)] group-data-[collapsible=icon]:w-auto" 
                    side="bottom" 
                    align="start"
                    sideOffset={sidebarState === 'collapsed' ? 4 : 5} // Adjust offset slightly for collapsed
                    // alignOffset={sidebarState === 'collapsed' ? -10 : 0} // Align to center of icon better
                  >
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
          </div>
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
