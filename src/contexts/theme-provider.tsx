
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { projectConfig } from '@/config/project.config';
import type { ThemeSettings, AccentColor, BorderRadiusOption } from '@/types';
import { hexToHsl } from '@/lib/utils'; 

interface ThemeProviderState extends ThemeSettings {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (accentValue: string) => void; 
  setBorderRadius: (radiusValue: string) => void;
  setAppVersion: (versionId: string) => void;
  setAppName: (appName: string) => void; 
  setAppIconPaths: (paths: string[]) => void; // Setter for icon paths
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
}

const getInitialAccentHsl = () => {
  return projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName)?.hslValue || projectConfig.availableAccentColors[0]?.hslValue || '180 100% 25%';
};

const getInitialBorderRadius = () => {
  return projectConfig.availableBorderRadii.find(r => r.name === projectConfig.defaultBorderRadiusName)?.value || projectConfig.availableBorderRadii[0]?.value || '0.5rem';
};

const getInitialAppIconPaths = () => {
  return projectConfig.appIconPaths || [];
}

const initialState: ThemeProviderState = {
  theme: 'system',
  accentColor: getInitialAccentHsl(),
  borderRadius: getInitialBorderRadius(),
  appVersion: projectConfig.defaultAppVersionId,
  appName: projectConfig.appName, 
  appIconPaths: getInitialAppIconPaths(), // Initialize icon paths
  setTheme: () => null,
  setAccentColor: () => null,
  setBorderRadius: () => null,
  setAppVersion: () => null,
  setAppName: () => null, 
  setAppIconPaths: () => null, // Placeholder setter
  availableAccentColors: projectConfig.availableAccentColors,
  availableBorderRadii: projectConfig.availableBorderRadii,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'genesis-theme',
}: {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}) {
  const [theme, setThemeState] = useLocalStorage<'light' | 'dark' | 'system'>(
    `${storageKey}-mode`,
    defaultTheme
  );
  const [accentColor, setAccentColorInternal] = useLocalStorage<string>(
    `${storageKey}-accent`,
    initialState.accentColor 
  );
  const [borderRadius, setBorderRadiusInternal] = useLocalStorage<string>(
    `${storageKey}-radius`,
    initialState.borderRadius
  );
  const [appVersion, setAppVersionInternal] = useLocalStorage<string>(
    `${storageKey}-version`,
    initialState.appVersion
  );
  const [appName, setAppNameInternal] = useLocalStorage<string>(
    `${storageKey}-app-name`,
    initialState.appName
  );
  const [appIconPaths, setAppIconPathsInternal] = useLocalStorage<string[]>(
    `${storageKey}-app-icon-paths`,
    initialState.appIconPaths || []
  );


  // Create stable setters
  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => setThemeState(newTheme), [setThemeState]);
  const setAccentColor = useCallback((newAccentColor: string) => setAccentColorInternal(newAccentColor), [setAccentColorInternal]);
  const setBorderRadius = useCallback((newBorderRadius: string) => setBorderRadiusInternal(newBorderRadius), [setBorderRadiusInternal]);
  const setAppVersion = useCallback((newAppVersion: string) => setAppVersionInternal(newAppVersion), [setAppVersionInternal]);
  const setAppName = useCallback((newAppName: string) => setAppNameInternal(newAppName), [setAppNameInternal]);
  const setAppIconPaths = useCallback((newPaths: string[]) => setAppIconPathsInternal(newPaths), [setAppIconPathsInternal]);


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
    if (!accentColor) return;

    let h: string, s: string, l: string;

    const applyDefaultAccent = () => {
      const defaultColor = projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName) || projectConfig.availableAccentColors[0];
      const parts = defaultColor.hslValue.match(/(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?%)\s*(\d+(?:\.\d+)?%)/);
      if (parts && parts.length === 4) {
        [ , h, s, l] = parts;
      } else {
        h = "180"; s = "100%"; l = "25%"; 
      }
    };

    if (accentColor.startsWith('#')) {
      const hsl = hexToHsl(accentColor);
      if (hsl) {
        h = String(hsl.h);
        s = `${hsl.s}%`;
        l = `${hsl.l}%`;
      } else {
        console.warn(`Invalid HEX color: ${accentColor}. Reverting to default.`);
        applyDefaultAccent();
      }
    } else {
      const parts = accentColor.match(/(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?%)\s*(\d+(?:\.\d+)?%)/);
      if (parts && parts.length === 4) {
        [ , h, s, l] = parts;
      } else {
        // Check if it's a valid HSL without % for S and L, try to parse if so
        const plainHslParts = accentColor.match(/(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)/);
        if (plainHslParts && plainHslParts.length === 4) {
            h = plainHslParts[1];
            s = `${plainHslParts[2]}%`;
            l = `${plainHslParts[3]}%`;
        } else {
            console.warn(`Invalid HSL string format: ${accentColor}. Reverting to default.`);
            applyDefaultAccent();
        }
      }
    }

    root.style.setProperty('--accent-h', h);
    root.style.setProperty('--accent-s', s);
    root.style.setProperty('--accent-l', l);
    
    root.style.setProperty('--primary-h', h);
    root.style.setProperty('--primary-s', s);
    root.style.setProperty('--primary-l', l);
    
    const lightnessValue = parseFloat(l); 
    const isDarkTheme = root.classList.contains('dark');
    
    let fgLightnessVarKey: string;
    if (isDarkTheme) {
        fgLightnessVarKey = lightnessValue > 55 ? '--accent-foreground-l-dark-theme' : '--accent-foreground-l-light-theme';
    } else {
        fgLightnessVarKey = lightnessValue < 50 ? '--accent-foreground-l-light-theme' : '--accent-foreground-l-dark-theme';
    }
    
    const finalFgHslString = `hsl(0, 0%, var(${fgLightnessVarKey}))`;
    root.style.setProperty('--accent-foreground', finalFgHslString);
    root.style.setProperty('--primary-foreground', finalFgHslString);

    root.style.setProperty('--ring-h', h); 

  }, [accentColor, theme]);


  useEffect(() => {
    const root = window.document.documentElement;
    if (borderRadius) {
      root.style.setProperty('--radius', borderRadius);
    }
  }, [borderRadius]);

  // Update document title dynamically
  useEffect(() => {
    if (appName) {
      document.title = appName;
    }
  }, [appName]);

  const value = useMemo(() => ({
    theme,
    accentColor,
    borderRadius,
    appVersion,
    appName, 
    appIconPaths, // Provide icon paths
    setTheme,
    setAccentColor,
    setBorderRadius,
    setAppVersion,
    setAppName, 
    setAppIconPaths, // Provide setter
    availableAccentColors: projectConfig.availableAccentColors,
    availableBorderRadii: projectConfig.availableBorderRadii,
  }), [theme, accentColor, borderRadius, appVersion, appName, appIconPaths, 
      setTheme, setAccentColor, setBorderRadius, setAppVersion, setAppName, setAppIconPaths]);

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

