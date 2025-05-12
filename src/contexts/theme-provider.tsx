
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { projectConfig } from '@/config/project.config';
import type { ThemeSettings, AccentColor, BorderRadiusOption } from '@/types';

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

    if (accentColor.startsWith('#')) {
      // Handle HEX input from custom color picker
      // This directly sets --accent and --primary, bypassing the HSL component system for this custom color.
      root.style.setProperty('--accent', accentColor);
      root.style.setProperty('--primary', accentColor); // Make primary follow accent directly with HEX
      // Foreground and ring for HEX would need more advanced logic (e.g., contrast check, color manipulation)
      // For simplicity, they might fall back to globals.css defaults or previously set HSL-derived values if not explicitly set here.
      // To ensure ring also changes, we could try to parse HEX to HSL for hue, or set a generic ring.
      // This is a simplified fallback for custom HEX.
      const isDark = root.classList.contains('dark');
      root.style.setProperty('--accent-foreground', isDark ? 'hsl(0 0% 95%)' : 'hsl(0 0% 10%)');
      root.style.setProperty('--primary-foreground', isDark ? 'hsl(0 0% 95%)' : 'hsl(0 0% 10%)');
      root.style.setProperty('--ring', accentColor); // Ring can be the same as accent for HEX

    } else {
      // Handle HSL component string "H S% L%"
      const parts = accentColor.match(/(\d+)\s*(\d+%)\s*(\d+%)/);
      if (parts && parts.length === 4) {
        const h = parts[1];
        const s = parts[2];
        const l = parts[3];
        root.style.setProperty('--accent-h', h);
        root.style.setProperty('--accent-s', s);
        root.style.setProperty('--accent-l', l);

        // primary follows accent by using the same HSL components
        root.style.setProperty('--primary-h', h);
        root.style.setProperty('--primary-s', s);
        root.style.setProperty('--primary-l', l);
        
        // Update full CSS properties that use these components
        root.style.setProperty('--accent', `hsl(${h}, ${s}, ${l})`);
        root.style.setProperty('--primary', `hsl(${h}, ${s}, ${l})`);

        // Dynamic foreground determination
        const lightnessValue = parseFloat(l);
        const isDarkTheme = root.classList.contains('dark');
        
        let fgLightnessVar = isDarkTheme
          ? (lightnessValue > 55 ? '--accent-foreground-l-dark-theme' : '--accent-foreground-l-light-theme')
          : (lightnessValue < 50 ? '--accent-foreground-l-light-theme' : '--accent-foreground-l-dark-theme');
        
        const finalFg = `hsl(0, 0%, var(${fgLightnessVar}))`;
        root.style.setProperty('--accent-foreground', finalFg);
        root.style.setProperty('--primary-foreground', finalFg);

        // Ring color (using accent's hue, with modified S/L from globals.css via --ring-s, --ring-l)
        root.style.setProperty('--ring-h', h); // Update --ring-h to follow accent's hue
        // --ring-s and --ring-l are defined in globals.css and combine with --ring-h
        // No need to set --ring directly here if it's derived from --ring-h/s/l in globals.css
      }
    }
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
