
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { projectConfig } from '@/config/project.config';
import type { ThemeSettings, AccentColor, BorderRadiusOption } from '@/types';

interface ThemeProviderState extends ThemeSettings {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (accentValue: string) => void; // Can be HSL string or HEX string
  setBorderRadius: (radiusValue: string) => void;
  setAppVersion: (versionId: string) => void;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
}

const initialState: ThemeProviderState = {
  theme: 'system',
  accentColor: projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName)?.hslValue || projectConfig.availableAccentColors[0].hslValue,
  borderRadius: projectConfig.availableBorderRadii.find(r => r.name === projectConfig.defaultBorderRadiusName)?.value || projectConfig.availableBorderRadii[0].value,
  appVersion: projectConfig.defaultAppVersionId,
  setTheme: () => null,
  setAccentColor: () => null,
  setBorderRadius: () => null,
  setAppVersion: () => null,
  availableAccentColors: projectConfig.availableAccentColors,
  availableBorderRadii: projectConfig.availableBorderRadii,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}) {
  const [theme, setThemeState] = useLocalStorage<'light' | 'dark' | 'system'>(
    `${storageKey}-mode`,
    defaultTheme
  );
  const [accentColor, setAccentColorState] = useLocalStorage<string>(
    `${storageKey}-accent`,
    initialState.accentColor 
  );
  const [borderRadius, setBorderRadiusState] = useLocalStorage<string>(
    `${storageKey}-radius`,
    initialState.borderRadius
  );
  const [appVersion, setAppVersionState] = useLocalStorage<string>(
    `${storageKey}-version`,
    initialState.appVersion
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (accentColor) {
      // If accentColor is an HSL string like "180 100% 25%" (without 'hsl()' wrapper), wrap it.
      // If it's a HEX string like "#RRGGBB" or already `hsl(...)`, use as is.
      if (accentColor.includes(' ') && !accentColor.startsWith('hsl(') && !accentColor.startsWith('#')) {
        root.style.setProperty('--accent', `hsl(${accentColor})`);
        // Also update --ring to match the primary part of HSL or a related color
        const primaryHue = accentColor.split(' ')[0];
        root.style.setProperty('--ring', `hsl(${primaryHue} 100% 35%)`); // Example: Keep saturation & lightness for ring related to hue
      } else {
        root.style.setProperty('--accent', accentColor);
        // If HEX, derive a ring color or use a fixed offset.
        // For simplicity, if it's hex, the ring might take this directly or be a theme default.
        // Here, we'll make --ring also follow --accent directly if it's a direct value like HEX
        // Consider a more sophisticated mapping for --ring if specific shades are needed per accent.
         if (accentColor.startsWith('#')) {
           root.style.setProperty('--ring', accentColor); // For HEX, ring might directly use it or a derived value
         } else if (accentColor.startsWith('hsl(')) {
            // If accentColor is already like 'hsl(180 100% 25%)', parse and adjust for ring
            const matches = accentColor.match(/hsl\(\s*(\d+)\s*,\s*(\d+%)\s*,\s*(\d+%)\s*\)/);
            if (matches) {
                root.style.setProperty('--ring', `hsl(${matches[1]}, 100%, 35%)`);
            } else {
                 root.style.setProperty('--ring', projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName)?.hslValue || projectConfig.availableAccentColors[0].hslValue);
            }
         }
      }
    }
  }, [accentColor]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (borderRadius) {
      root.style.setProperty('--radius', borderRadius);
    }
  }, [borderRadius]);

  const value = useMemo(() => ({
    theme,
    accentColor,
    borderRadius,
    appVersion,
    setTheme: setThemeState,
    setAccentColor: setAccentColorState,
    setBorderRadius: setBorderRadiusState,
    setAppVersion: setAppVersionState,
    availableAccentColors: projectConfig.availableAccentColors,
    availableBorderRadii: projectConfig.availableBorderRadii,
  }), [theme, accentColor, borderRadius, appVersion, setThemeState, setAccentColorState, setBorderRadiusState, setAppVersionState]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
