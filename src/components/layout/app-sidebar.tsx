
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger, // Desktop sidebar trigger
  // SidebarMenuButton, // For version switcher like button. Not used directly here anymore.
  useSidebar,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/main-nav';
import { sidebarConfig } from '@/config/sidebar.config';
import { projectConfig } from '@/config/project.config';
import { useTheme } from '@/contexts/theme-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, PanelLeftOpen, PanelLeftClose, GitBranch } from 'lucide-react';
import { useAuth } from '@/contexts/auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, // Added missing import
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export function AppSidebar() {
  const { user, logout } = useAuth();
  const { appVersion, setAppVersion } = useTheme();
  const { toggleSidebar, state: sidebarState } = useSidebar();
  const currentAppVersionDetails = projectConfig.availableAppVersions.find(v => v.id === appVersion);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };


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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-full justify-start mt-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                    <GitBranch className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{currentAppVersionDetails?.name || 'Select Version'}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--sidebar-width)] group-data-[collapsible=icon]:w-auto" side="bottom" align="start">
                 <DropdownMenuRadioGroup value={appVersion} onValueChange={setAppVersion}>
                    {projectConfig.availableAppVersions.map(version => (
                    <DropdownMenuRadioItem key={version.id} value={version.id}>
                        {version.name}
                    </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <MainNav items={sidebarConfig.items} />
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2">
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden truncate">
                    <span className="text-sm font-medium text-sidebar-foreground truncate">{user.displayName || "User"}</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate">{user.email}</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(var(--sidebar-width)_-_1rem)] mb-2" side="top" align="start">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
