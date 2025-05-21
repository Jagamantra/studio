
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { projectConfig } from '@/config/project.config';
import type { ThemeProviderState, AccentColor, BorderRadiusOption, FontSizeOption, ScaleOption, ThemeSettings } from '@/types';
import { hexToHsl } from '@/lib/utils'; 

const getInitialAccentHsl = () => {
  return projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName)?.hslValue || projectConfig.availableAccentColors[0]?.hslValue || '180 100% 25%';
};

const getInitialBorderRadius = () => {
  return projectConfig.availableBorderRadii.find(r => r.name === projectConfig.defaultBorderRadiusName)?.value || projectConfig.availableBorderRadii[0]?.value || '0.5rem';
};

const getInitialAppIconPaths = () => {
  return projectConfig.appIconPaths || [];
};

const getInitialAppLogoUrl = () => {
  return projectConfig.appLogoUrl || null;
};

const getInitialFontSize = () => {
  return projectConfig.availableFontSizes.find(f => f.name === projectConfig.defaultFontSizeName)?.value || projectConfig.availableFontSizes[1]?.value || '16px';
};

const getInitialScale = () => {
  return projectConfig.availableScales.find(s => s.name === projectConfig.defaultScaleName)?.value || projectConfig.availableScales[1]?.value || '1.0';
};

const initialState: ThemeProviderState = {
  theme: 'system',
  accentColor: getInitialAccentHsl(),
  borderRadius: getInitialBorderRadius(),
  appVersion: projectConfig.defaultAppVersionId,
  appName: projectConfig.appName, 
  appIconPaths: getInitialAppIconPaths(),
  appLogoUrl: getInitialAppLogoUrl(),
  fontSize: getInitialFontSize(),
  appScale: getInitialScale(),
  setTheme: () => null,
  setAccentColor: () => null,
  setBorderRadius: () => null,
  setAppVersion: () => null,
  setAppName: () => null, 
  setAppIconPaths: () => null,
  setAppLogoUrl: () => null,
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
  const [appIconPaths, setAppIconPathsInternal] = useLocalStorage<string[] | undefined>(
    `${storageKey}-app-icon-paths`,
    initialState.appIconPaths
  );
  const [appLogoUrl, setAppLogoUrlInternal] = useLocalStorage<string | null>(
    `${storageKey}-app-logo-url`,
    initialState.appLogoUrl
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
  const setAppIconPaths = useCallback((newPaths: string[] | undefined) => setAppIconPathsInternal(newPaths), [setAppIconPathsInternal]);
  const setAppLogoUrl = useCallback((newUrl: string | null) => setAppLogoUrlInternal(newUrl), [setAppLogoUrlInternal]);
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
      // Do not set document.title here directly as it conflicts with page-specific titles
      // It's better to set it in individual pages or a global Head component
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

  // Update favicon based on appIconPaths or appLogoUrl (simplified for now)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }

    if (appLogoUrl) {
      // If it's a data URI, it can be used directly for some browsers.
      // For production, a real URL to an optimized .ico or .png would be better.
      // This is a simplified approach for client-side logo URL.
      faviconLink.href = appLogoUrl;
      faviconLink.type = appLogoUrl.startsWith('data:image/svg+xml') ? 'image/svg+xml' : (appLogoUrl.startsWith('data:image/png') ? 'image/png' : 'image/x-icon');
    } else if (appIconPaths && appIconPaths.length > 0) {
      // Create a dynamic SVG for favicon from paths
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-h) var(--primary-s) var(--primary-l))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${appIconPaths.map(d => `<path d="${d}"></path>`).join('')}</svg>`;
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      faviconLink.href = url;
      faviconLink.type = 'image/svg+xml';
      // It's good practice to revoke the object URL when it's no longer needed,
      // but for a favicon, it might be kept for the session.
      // Consider revoking if the icon paths change frequently.
    } else {
      faviconLink.href = '/favicon.svg'; // Default static favicon
      faviconLink.type = 'image/svg+xml';
    }
  }, [appIconPaths, appLogoUrl, accentColor, theme]); // Re-generate if paths, logo, or primary color changes


  const value = useMemo(() => ({
    theme,
    accentColor,
    borderRadius,
    appVersion,
    appName, 
    appIconPaths,
    appLogoUrl,
    fontSize,
    appScale,
    setTheme,
    setAccentColor,
    setBorderRadius,
    setAppVersion,
    setAppName, 
    setAppIconPaths,
    setAppLogoUrl,
    setFontSize,
    setAppScale,
    availableAccentColors: projectConfig.availableAccentColors,
    availableBorderRadii: projectConfig.availableBorderRadii,
    availableFontSizes: projectConfig.availableFontSizes,
    availableScales: projectConfig.availableScales,
  }), [
      theme, accentColor, borderRadius, appVersion, appName, appIconPaths, appLogoUrl, fontSize, appScale,
      setTheme, setAccentColor, setBorderRadius, setAppVersion, setAppName, setAppIconPaths, setAppLogoUrl, setFontSize, setAppScale
    ]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
