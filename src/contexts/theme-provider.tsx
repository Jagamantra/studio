'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { projectConfig } from '@/config/project.config';
import type { ThemeSettings, AccentColor, BorderRadiusOption } from '@/types';
import { hexToHsl } from '@/lib/utils'; // Import the new utility

interface ThemeProviderState extends ThemeSettings {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (accentValue: string) => void; // Can be HSL component string "H S% L%" or HEX string
  setBorderRadius: (radiusValue: string) => void;
  setAppVersion: (versionId: string) => void;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
}

const defaultAccentHslValue = projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName)?.hslValue || projectConfig.availableAccentColors[0].hslValue;

const initialState: ThemeProviderState = {
  theme: 'system',
  accentColor: defaultAccentHslValue,
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
    if (!accentColor) return;

    let h: string, s: string, l: string;

    const applyDefaultAccent = () => {
      const defaultColor = projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName) || projectConfig.availableAccentColors[0];
      const parts = defaultColor.hslValue.match(/(\d+)\s*(\d+%)\s*(\d+%)/);
      if (parts && parts.length === 4) {
        h = parts[1];
        s = parts[2];
        l = parts[3];
      } else {
        // Fallback for ultimate safety, should not be reached if config is valid
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
      const parts = accentColor.match(/(\d+)\s*(\d+%)\s*(\d+%)/);
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
    
    // These lines ensure --accent and --primary are full HSL strings for Tailwind
    // They are now derived from the h,s,l components set above
    // root.style.setProperty('--accent', `hsl(${h}, ${s}, ${l})`);
    // root.style.setProperty('--primary', `hsl(${h}, ${s}, ${l})`);
    // The above are not strictly needed if globals.css defines --accent: hsl(var(--accent-h), var(--accent-s), var(--accent-l))
    // and Tailwind consumes those definitions. Assuming globals.css is set up that way.

    const lightnessValue = parseFloat(l);
    const isDarkTheme = root.classList.contains('dark');
    
    let fgLightnessVarKey: string;
    if (isDarkTheme) {
      fgLightnessVarKey = lightnessValue > 55 ? '--accent-foreground-l-dark-theme' : '--accent-foreground-l-light-theme';
    } else {
      fgLightnessVarKey = lightnessValue < 50 ? '--accent-foreground-l-light-theme' : '--accent-foreground-l-dark-theme';
    }
    
    // The foreground color is always a shade of gray, its lightness determined by fgLightnessVarKey
    // This CSS variable will contain a percentage like "95%" or "10%".
    // The full HSL string for foreground is constructed here directly.
    const finalFgHslString = `hsl(0, 0%, var(${fgLightnessVarKey}))`;
    root.style.setProperty('--accent-foreground', finalFgHslString);
    root.style.setProperty('--primary-foreground', finalFgHslString);

    root.style.setProperty('--ring-h', h);
    // --ring-s and --ring-l are defined in globals.css. --ring itself is also defined there as hsl(var(--ring-h), var(--ring-s), var(--ring-l)).
    // So, setting --ring-h is sufficient for the --ring variable to update, which Tailwind then consumes.

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
