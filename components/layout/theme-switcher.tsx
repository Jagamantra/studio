
'use client';

import * as React from 'react';
import { Moon, Sun, Palette, SquareRadical, Check, ChevronsUpDown, GitBranch, ZoomIn, ZoomOut, CaseSensitive } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { projectConfig } from '@/config/project.config';
import type { AccentColor, BorderRadiusOption, FontSizeOption, ScaleOption } from '@/types';
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
    fontSize,
    setFontSize,
    appScale,
    setAppScale,
    availableAccentColors,
    availableBorderRadii,
    availableFontSizes,
    availableScales,
  } = useTheme();

  const colorInputRef = React.useRef<HTMLInputElement>(null);

  const currentRadius = availableBorderRadii.find(br => br.value === borderRadius);
  const currentVersion = projectConfig.availableAppVersions.find(v => v.id === appVersion);
  const currentFontSize = availableFontSizes.find(f => f.value === fontSize);
  const currentScale = availableScales.find(s => s.value === appScale);


  const currentPredefinedAccent = availableAccentColors.find(ac => ac.hslValue === accentColor);
  
  const colorInputValue = currentPredefinedAccent 
    ? currentPredefinedAccent.hexValue 
    : (accentColor.startsWith('#') ? accentColor : projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName)?.hexValue || '#008080');


  const accentDisplayName = currentPredefinedAccent ? currentPredefinedAccent.name : 'Custom';
  const accentDisplayColorValue = currentPredefinedAccent 
    ? `hsl(${currentPredefinedAccent.hslValue})` 
    : (accentColor.includes(' ') && !accentColor.startsWith('hsl(') ? `hsl(${accentColor})` : accentColor);


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
        
        {/* Accent Color Section */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <div className="mr-2 h-4 w-4 rounded-full border" style={{ backgroundColor: accentDisplayColorValue }} />
            <span>Accent: {accentDisplayName}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="p-2">
              <ScrollArea className="h-auto max-h-40">
                <DropdownMenuRadioGroup
                  value={currentPredefinedAccent ? currentPredefinedAccent.hslValue : ""} 
                  onValueChange={(newHslValue) => { 
                    setAccentColor(newHslValue);
                  }}
                >
                  {availableAccentColors.map((colorOption: AccentColor) => (
                    <DropdownMenuRadioItem key={colorOption.name} value={colorOption.hslValue}>
                      <div className="mr-2 h-4 w-4 rounded-full border" style={{ backgroundColor: `hsl(${colorOption.hslValue})` }} />
                      {colorOption.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </ScrollArea>
              <div className="mt-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="custom-color-trigger" className="text-xs font-medium text-muted-foreground">
                    Custom Color
                  </Label>
                  <Button
                    id="custom-color-trigger"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full p-0 border"
                    onClick={() => colorInputRef.current?.click()}
                    aria-label="Pick custom accent color"
                  >
                    <div 
                      className="h-4 w-4 rounded-full" 
                      style={{ backgroundColor: colorInputValue }}
                    /> 
                  </Button>
                </div>
                <Input
                  ref={colorInputRef}
                  id="custom-color-picker-hidden"
                  type="color"
                  className="hidden" 
                  value={colorInputValue} 
                  onChange={(e) => setAccentColor(e.target.value)} 
                />
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Border Radius */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SquareRadical className="mr-2 h-4 w-4" />
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

        {/* Font Size */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CaseSensitive className="mr-2 h-4 w-4" />
            <span>Font Size: {currentFontSize?.name || 'Default'}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={fontSize} onValueChange={setFontSize}>
                {availableFontSizes.map((sizeOption: FontSizeOption) => (
                  <DropdownMenuRadioItem key={sizeOption.name} value={sizeOption.value}>
                    {sizeOption.name} ({sizeOption.value})
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Screen Scale */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ZoomIn className="mr-2 h-4 w-4" /> {/* Or use a different icon like Maximize2 */}
            <span>Scale: {currentScale?.name || 'Default'}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={appScale} onValueChange={setAppScale}>
                {availableScales.map((scaleOption: ScaleOption) => (
                  <DropdownMenuRadioItem key={scaleOption.name} value={scaleOption.value}>
                    {scaleOption.name}
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
