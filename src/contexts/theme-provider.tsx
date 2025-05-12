
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { projectConfig } from '@/config/project.config';
import type { ThemeSettings, AccentColor, BorderRadiusOption } from '@/types';

interface ThemeProviderState extends ThemeSettings {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (accentHslValue: string) => void;
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
      root.style.setProperty('--accent', accentColor);
      // Assuming accent-foreground is derived or fixed for simplicity, or you can add logic to calculate it
      // For teal (180 100% 25%), a light foreground like 0 0% 98% works.
      // For a more dynamic approach, this might need a mapping or calculation.
      // For now, we use the pre-defined one in globals.css. The primary accent variable is --accent.
      // If the accent color makes the default ring color unsuitable, update --ring as well
      // Example: root.style.setProperty('--ring', accentColor); // or a lighter/darker shade
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
