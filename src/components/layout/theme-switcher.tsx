
'use client';

import * as React from 'react';
import { Moon, Sun, Palette, SquareRaduis, Check, ChevronsUpDown, GitBranch } from 'lucide-react';
import { useTheme } from '@/contexts/theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { projectConfig } from '@/config/project.config';
import type { AccentColor, BorderRadiusOption } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ThemeSwitcher() {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    borderRadius,
    setBorderRadius,
    appVersion,
    setAppVersion,
    availableAccentColors,
    availableBorderRadii,
  } = useTheme();

  const currentAccent = availableAccentColors.find(ac => ac.hslValue === accentColor);
  const currentRadius = availableBorderRadii.find(br => br.value === borderRadius);
  const currentVersion = projectConfig.availableAppVersions.find(v => v.id === appVersion);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Customize theme">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Theme Mode */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === 'light' && <Sun className="mr-2 h-4 w-4" />}
            {theme === 'dark' && <Moon className="mr-2 h-4 w-4" />}
            {theme === 'system' && <Palette className="mr-2 h-4 w-4" />}
            <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                <DropdownMenuRadioItem value="light">
                  <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Palette className="mr-2 h-4 w-4" /> System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Accent Color */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <div className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${currentAccent?.hslValue})` }} />
            <span>Accent: {currentAccent?.name || 'Default'}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <ScrollArea className="h-48">
                <DropdownMenuRadioGroup value={accentColor} onValueChange={setAccentColor}>
                  {availableAccentColors.map((color: AccentColor) => (
                    <DropdownMenuRadioItem key={color.name} value={color.hslValue}>
                      <div className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${color.hslValue})` }} />
                      {color.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </ScrollArea>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Border Radius */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SquareRaduis className="mr-2 h-4 w-4" />
            <span>Radius: {currentRadius?.name || 'Default'}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={borderRadius} onValueChange={setBorderRadius}>
                {availableBorderRadii.map((radius: BorderRadiusOption) => (
                  <DropdownMenuRadioItem key={radius.name} value={radius.value}>
                    {radius.name} ({radius.value})
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Application</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* App Version */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <GitBranch className="mr-2 h-4 w-4" />
            <span>Version: {currentVersion?.name || 'Unknown'}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={appVersion} onValueChange={setAppVersion}>
                {projectConfig.availableAppVersions.map(version => (
                  <DropdownMenuRadioItem key={version.id} value={version.id}>
                    {version.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
