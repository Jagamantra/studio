
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { projectConfig } from '@/config/project.config';
import type { ThemeSettings, AccentColor, BorderRadiusOption, FontSizeOption, ScaleOption } from '@/types';
import { hexToHsl } from '@/lib/utils'; 

interface ThemeProviderState extends ThemeSettings {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (accentValue: string) => void; 
  setBorderRadius: (radiusValue: string) => void;
  setAppVersion: (versionId: string) => void;
  setAppName: (appName: string) => void; 
  setAppIconPaths: (paths: string[]) => void; 
  setFontSize: (fontSizeValue: string) => void;
  setAppScale: (scaleValue: string) => void;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
  availableFontSizes: FontSizeOption[];
  availableScales: ScaleOption[];
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

const getInitialFontSize = () => {
  return projectConfig.availableFontSizes.find(f => f.name === projectConfig.defaultFontSizeName)?.value || projectConfig.availableFontSizes[1]?.value || '16px';
}

const getInitialScale = () => {
  return projectConfig.availableScales.find(s => s.name === projectConfig.defaultScaleName)?.value || projectConfig.availableScales[1]?.value || '1.0';
}

const initialState: ThemeProviderState = {
  theme: 'system',
  accentColor: getInitialAccentHsl(),
  borderRadius: getInitialBorderRadius(),
  appVersion: projectConfig.defaultAppVersionId,
  appName: projectConfig.appName, 
  appIconPaths: getInitialAppIconPaths(), 
  fontSize: getInitialFontSize(),
  appScale: getInitialScale(),
  setTheme: () => null,
  setAccentColor: () => null,
  setBorderRadius: () => null,
  setAppVersion: () => null,
  setAppName: () => null, 
  setAppIconPaths: () => null, 
  setFontSize: () => null,
  setAppScale: () => null,
  availableAccentColors: projectConfig.availableAccentColors,
  availableBorderRadii: projectConfig.availableBorderRadii,
  availableFontSizes: projectConfig.availableFontSizes,
  availableScales: projectConfig.availableScales,
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
    initialState.appIconPaths
  );
  const [fontSize, setFontSizeInternal] = useLocalStorage<string>(
    `${storageKey}-font-size`,
    initialState.fontSize
  );
  const [appScale, setAppScaleInternal] = useLocalStorage<string>(
    `${storageKey}-scale`,
    initialState.appScale
  );


  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => setThemeState(newTheme), [setThemeState]);
  const setAccentColor = useCallback((newAccentColor: string) => setAccentColorInternal(newAccentColor), [setAccentColorInternal]);
  const setBorderRadius = useCallback((newBorderRadius: string) => setBorderRadiusInternal(newBorderRadius), [setBorderRadiusInternal]);
  const setAppVersion = useCallback((newAppVersion: string) => setAppVersionInternal(newAppVersion), [setAppVersionInternal]);
  const setAppName = useCallback((newAppName: string) => setAppNameInternal(newAppName), [setAppNameInternal]);
  const setAppIconPaths = useCallback((newPaths: string[]) => setAppIconPathsInternal(newPaths), [setAppIconPathsInternal]);
  const setFontSize = useCallback((newFontSize: string) => setFontSizeInternal(newFontSize), [setFontSizeInternal]);
  const setAppScale = useCallback((newScale: string) => setAppScaleInternal(newScale), [setAppScaleInternal]);


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

  useEffect(() => {
    if (appName && typeof document !== 'undefined') {
      document.title = appName; 
    }
  }, [appName]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (fontSize) {
      root.style.fontSize = fontSize;
    }
  }, [fontSize]);

  useEffect(() => {
    const body = window.document.body;
    if (appScale) {
      body.style.zoom = appScale;
    }
  }, [appScale]);

  const value = useMemo(() => ({
    theme,
    accentColor,
    borderRadius,
    appVersion,
    appName, 
    appIconPaths, 
    fontSize,
    appScale,
    setTheme,
    setAccentColor,
    setBorderRadius,
    setAppVersion,
    setAppName, 
    setAppIconPaths, 
    setFontSize,
    setAppScale,
    availableAccentColors: projectConfig.availableAccentColors,
    availableBorderRadii: projectConfig.availableBorderRadii,
    availableFontSizes: projectConfig.availableFontSizes,
    availableScales: projectConfig.availableScales,
  }), [theme, accentColor, borderRadius, appVersion, appName, appIconPaths, fontSize, appScale,
      setTheme, setAccentColor, setBorderRadius, setAppVersion, setAppName, setAppIconPaths, setFontSize, setAppScale]);

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
