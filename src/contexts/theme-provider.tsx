
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
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
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
}

const defaultAccentHslValue = projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName)?.hslValue || projectConfig.availableAccentColors[0].hslValue;

const initialState: ThemeProviderState = {
  theme: 'system',
  accentColor: defaultAccentHslValue,
  borderRadius: projectConfig.availableBorderRadii.find(r => r.name === projectConfig.defaultBorderRadiusName)?.value || projectConfig.availableBorderRadii[0].value,
  appVersion: projectConfig.defaultAppVersionId,
  appName: projectConfig.appName, 
  setTheme: () => null,
  setAccentColor: () => null,
  setBorderRadius: () => null,
  setAppVersion: () => null,
  setAppName: () => null, 
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
  const [appName, setAppNameState] = useLocalStorage<string>(
    `${storageKey}-app-name`,
    initialState.appName
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
    if (!accentColor) return;

    let h: string, s: string, l: string;

    const applyDefaultAccent = () => {
      const defaultColor = projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName) || projectConfig.availableAccentColors[0];
      const parts = defaultColor.hslValue.match(/(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?%)\s*(\d+(?:\.\d+)?%)/);
      if (parts && parts.length === 4) {
        h = parts[1]; 
        s = parts[2]; 
        l = parts[3]; 
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
        h = parts[1]; 
        s = parts[2]; 
        l = parts[3]; 
      } else {
        console.warn(`Invalid HSL string format: ${accentColor}. Reverting to default.`);
        applyDefaultAccent();
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

  const value = useMemo(() => ({
    theme,
    accentColor,
    borderRadius,
    appVersion,
    appName, 
    setTheme: setThemeState,
    setAccentColor: setAccentColorState,
    setBorderRadius: setBorderRadiusState,
    setAppVersion: setAppVersionState,
    setAppName: setAppNameState, 
    availableAccentColors: projectConfig.availableAccentColors,
    availableBorderRadii: projectConfig.availableBorderRadii,
  }), [theme, accentColor, borderRadius, appVersion, appName, setThemeState, setAccentColorState, setBorderRadiusState, setAppVersionState, setAppNameState]);

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
