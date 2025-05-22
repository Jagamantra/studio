
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { projectConfig } from '@/config/project.config';
import type { ThemeProviderState, ThemeSettings } from '@/types';
import { hexToHsl } from '@/lib/utils';
import { useAuth } from './auth-context';
import * as Api from '@/services/api';

const getInitialAccentHsl = () => {
  return projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName)?.hslValue || projectConfig.availableAccentColors[0]?.hslValue || '180 100% 25%';
};

const getInitialBorderRadius = () => {
  return projectConfig.availableBorderRadii.find(r => r.name === projectConfig.defaultBorderRadiusName)?.value || projectConfig.availableBorderRadii[0]?.value || '0.5rem';
};

const initialState: ThemeProviderState = {
  theme: 'system',
  accentColor: getInitialAccentHsl(),
  borderRadius: getInitialBorderRadius(),
  appVersion: projectConfig.defaultAppVersionId,
  appName: projectConfig.appName,
  appIconPaths: projectConfig.appIconPaths || [], // Ensure it's always an array
  appLogoUrl: projectConfig.appLogoUrl || null,
  fontSize: projectConfig.availableFontSizes.find(f => f.name === projectConfig.defaultFontSizeName)?.value || projectConfig.availableFontSizes[1]?.value || '16px',
  appScale: projectConfig.availableScales.find(s => s.name === projectConfig.defaultScaleName)?.value || projectConfig.availableScales[1]?.value || '1.0',
  interfaceDensity: projectConfig.defaultInterfaceDensity,
  setTheme: () => null,
  setAccentColor: () => null,
  setBorderRadius: () => null,
  setAppVersion: () => null,
  setAppName: () => null,
  setAppIconPaths: () => null,
  setAppLogoUrl: () => null,
  setFontSize: () => null,
  setAppScale: () => null,
  setInterfaceDensity: () => null,
  availableAccentColors: projectConfig.availableAccentColors,
  availableBorderRadii: projectConfig.availableBorderRadii,
  availableFontSizes: projectConfig.availableFontSizes,
  availableScales: projectConfig.availableScales,
  availableInterfaceDensities: projectConfig.availableInterfaceDensities,
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
  const { user, updateUserPreferencesInContext } = useAuth();

  const [theme, setThemeState] = useLocalStorage<'light' | 'dark' | 'system'>(`${storageKey}-mode`, defaultTheme);
  const [accentColor, setAccentColorInternal] = useLocalStorage<string>(`${storageKey}-accent`, initialState.accentColor);
  const [borderRadius, setBorderRadiusInternal] = useLocalStorage<string>(`${storageKey}-radius`, initialState.borderRadius);
  const [appVersion, setAppVersionInternal] = useLocalStorage<string>(`${storageKey}-version`, initialState.appVersion);
  const [appName, setAppNameInternal] = useLocalStorage<string>(`${storageKey}-app-name`, initialState.appName);
  // Ensure appIconPaths is always initialized as an array, falling back to projectConfig or empty array
  const [appIconPaths, setAppIconPathsInternal] = useLocalStorage<string[]>(`${storageKey}-app-icon-paths`, projectConfig.appIconPaths || []);
  const [appLogoUrl, setAppLogoUrlInternal] = useLocalStorage<string | null>(`${storageKey}-app-logo-url`, initialState.appLogoUrl);
  const [fontSize, setFontSizeInternal] = useLocalStorage<string>(`${storageKey}-font-size`, initialState.fontSize);
  const [appScale, setAppScaleInternal] = useLocalStorage<string>(`${storageKey}-scale`, initialState.appScale);
  const [interfaceDensity, setInterfaceDensityInternal] = useLocalStorage<'compact' | 'comfortable' | 'spacious'>(`${storageKey}-density`, initialState.interfaceDensity);

  const persistPreference = useCallback(async <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    if (user && user.uid) {
      try {
        updateUserPreferencesInContext({ [key]: value });
        await Api.updateUserPreferences(user.uid, { [key]: value });
      } catch (error) {
        console.error(`Failed to save preference ${key} via API:`, error);
      }
    }
  }, [user, updateUserPreferencesInContext]);


  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    persistPreference('theme', newTheme);
  }, [setThemeState, persistPreference]);

  const setAccentColor = useCallback((newAccentColor: string) => {
    setAccentColorInternal(newAccentColor);
    persistPreference('accentColor', newAccentColor);
  }, [setAccentColorInternal, persistPreference]);

  const setBorderRadius = useCallback((newBorderRadius: string) => {
    setBorderRadiusInternal(newBorderRadius);
    persistPreference('borderRadius', newBorderRadius);
  }, [setBorderRadiusInternal, persistPreference]);
  
  const setAppVersion = useCallback((newAppVersion: string) => {
    setAppVersionInternal(newAppVersion);
    persistPreference('appVersion', newAppVersion);
  }, [setAppVersionInternal, persistPreference]);

  const setAppName = useCallback((newAppName: string) => {
    setAppNameInternal(newAppName);
    persistPreference('appName', newAppName);
  }, [setAppNameInternal, persistPreference]);

  const setAppIconPaths = useCallback((newPaths: string[] | undefined) => {
    const pathsToSet = newPaths || projectConfig.appIconPaths || []; // Fallback to projectConfig or empty array
    setAppIconPathsInternal(pathsToSet);
    persistPreference('appIconPaths', pathsToSet);
  }, [setAppIconPathsInternal, persistPreference]);
  
  const setAppLogoUrl = useCallback((newUrl: string | null) => {
    setAppLogoUrlInternal(newUrl);
    persistPreference('appLogoUrl', newUrl);
  }, [setAppLogoUrlInternal, persistPreference]);

  const setFontSize = useCallback((newFontSize: string) => {
    setFontSizeInternal(newFontSize);
    persistPreference('fontSize', newFontSize);
  }, [setFontSizeInternal, persistPreference]);

  const setAppScale = useCallback((newScale: string) => {
    setAppScaleInternal(newScale);
    persistPreference('appScale', newScale);
  }, [setAppScaleInternal, persistPreference]);

  const setInterfaceDensity = useCallback((newDensity: 'compact' | 'comfortable' | 'spacious') => {
    setInterfaceDensityInternal(newDensity);
    persistPreference('interfaceDensity', newDensity);
  }, [setInterfaceDensityInternal, persistPreference]);

  useEffect(() => {
    if (user && user.preferences) {
      const prefs = user.preferences;
      if (prefs.theme) setThemeState(prefs.theme);
      if (prefs.accentColor) setAccentColorInternal(prefs.accentColor);
      if (prefs.borderRadius) setBorderRadiusInternal(prefs.borderRadius);
      if (prefs.appVersion) setAppVersionInternal(prefs.appVersion);
      if (prefs.appName) setAppNameInternal(prefs.appName);
      // Handle appIconPaths carefully: if undefined in prefs, use projectConfig default or empty array
      setAppIconPathsInternal(prefs.appIconPaths !== undefined ? prefs.appIconPaths : (projectConfig.appIconPaths || []));
      if (prefs.appLogoUrl !== undefined) setAppLogoUrlInternal(prefs.appLogoUrl);
      if (prefs.fontSize) setFontSizeInternal(prefs.fontSize);
      if (prefs.appScale) setAppScaleInternal(prefs.appScale);
      if (prefs.interfaceDensity) setInterfaceDensityInternal(prefs.interfaceDensity);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only re-sync when user object changes. Setters are stable.

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
      const defaultColorDef = projectConfig.availableAccentColors.find(c => c.name === projectConfig.defaultAccentColorName) || projectConfig.availableAccentColors[0];
      const parts = defaultColorDef.hslValue.match(/(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?%)\s*(\d+(?:\.\d+)?%)/);
      if (parts && parts.length === 4) [, h, s, l] = parts;
      else { h = "180"; s = "100%"; l = "25%"; }
    };

    if (accentColor.startsWith('#')) {
      const hsl = hexToHsl(accentColor);
      if (hsl) { h = String(hsl.h); s = `${hsl.s}%`; l = `${hsl.l}%`; }
      else applyDefaultAccent();
    } else {
      const parts = accentColor.match(/(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?%)\s*(\d+(?:\.\d+)?%)/);
      if (parts && parts.length === 4) [, h, s, l] = parts;
      else {
        const plainHslParts = accentColor.match(/(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)/);
        if (plainHslParts && plainHslParts.length === 4) { h = plainHslParts[1]; s = `${plainHslParts[2]}%`; l = `${plainHslParts[3]}%`; }
        else applyDefaultAccent();
      }
    }
    root.style.setProperty('--accent-h', h); root.style.setProperty('--accent-s', s); root.style.setProperty('--accent-l', l);
    root.style.setProperty('--primary-h', h); root.style.setProperty('--primary-s', s); root.style.setProperty('--primary-l', l);
    const lightnessValue = parseFloat(l);
    const isDarkTheme = root.classList.contains('dark');
    let fgLightnessVarKey = isDarkTheme ? (lightnessValue > 55 ? '--accent-foreground-l-dark-theme' : '--accent-foreground-l-light-theme') : (lightnessValue < 50 ? '--accent-foreground-l-light-theme' : '--accent-foreground-l-dark-theme');
    const finalFgHslString = `hsl(0, 0%, var(${fgLightnessVarKey}))`;
    root.style.setProperty('--accent-foreground', finalFgHslString); root.style.setProperty('--primary-foreground', finalFgHslString);
    root.style.setProperty('--ring-h', h);
  }, [accentColor, theme]);

  useEffect(() => { if (borderRadius) window.document.documentElement.style.setProperty('--radius', borderRadius); }, [borderRadius]);
  useEffect(() => { if (fontSize) window.document.documentElement.style.fontSize = fontSize; }, [fontSize]);
  useEffect(() => { if (appScale) window.document.body.style.zoom = appScale; }, [appScale]);
  useEffect(() => { if (interfaceDensity) window.document.documentElement.dataset.density = interfaceDensity; else delete window.document.documentElement.dataset.density; }, [interfaceDensity]);

  // useEffect(() => {
  //   if (typeof window === 'undefined') return;
  //   let faviconLink = document.querySelector<HTMLLinkElement>('link#app-favicon');
  //   if (!faviconLink) {
  //     faviconLink = document.createElement('link'); 
  //     faviconLink.rel = 'icon'; 
  //     faviconLink.id = 'app-favicon';
  //     document.head.appendChild(faviconLink);
  //   }

  //   const currentAccentColorForFavicon = accentColor || getInitialAccentHsl();
  //   const oldObjectUrl = (faviconLink as any)._objectUrl; // Store to revoke later

  //   if (appLogoUrl) { // Prioritize user-uploaded/configured logo URL
  //     faviconLink.href = appLogoUrl;
  //     if (appLogoUrl.startsWith('data:image/svg+xml')) {
  //       faviconLink.type = 'image/svg+xml';
  //     } else if (appLogoUrl.startsWith('data:image/png')) {
  //       faviconLink.type = 'image/png';
  //     } else if (appLogoUrl.endsWith('.ico')) {
  //       faviconLink.type = 'image/x-icon';
  //     } else {
  //       faviconLink.type = appLogoUrl.startsWith('data:') ? 'image/x-icon' : 'image/png';
  //     }
  //   } else if (appIconPaths && appIconPaths.length > 0) { // Then theme's appIconPaths
  //     const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(${currentAccentColorForFavicon})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${appIconPaths.map(d => `<path d="${d}"></path>`).join('')}</svg>`;
  //     const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' }); 
  //     const newObjectUrl = URL.createObjectURL(svgBlob);
  //     faviconLink.href = newObjectUrl; 
  //     faviconLink.type = 'image/svg+xml';
  //     (faviconLink as any)._objectUrl = newObjectUrl;
  //   } else { // Fallback to static default
  //     faviconLink.href = '/favicon.ico'; 
  //     faviconLink.type = 'image/x-icon';
  //   }

  //   if (oldObjectUrl && oldObjectUrl !== faviconLink.href) { // Revoke old only if it's different and was an object URL
  //      URL.revokeObjectURL(oldObjectUrl);
  //      if (faviconLink.href !== (faviconLink as any)._objectUrl) { // If new href is not the new object URL (e.g. it's a static path or data URI)
  //        delete (faviconLink as any)._objectUrl;
  //      }
  //   }
  // }, [appLogoUrl, appIconPaths, accentColor, theme]);


  const value = useMemo(() => ({
    theme, accentColor, borderRadius, appVersion, appName, appIconPaths, appLogoUrl, fontSize, appScale, interfaceDensity,
    setTheme, setAccentColor, setBorderRadius, setAppVersion, setAppName, setAppIconPaths, setAppLogoUrl, setFontSize, setAppScale, setInterfaceDensity,
    availableAccentColors: projectConfig.availableAccentColors,
    availableBorderRadii: projectConfig.availableBorderRadii,
    availableFontSizes: projectConfig.availableFontSizes,
    availableScales: projectConfig.availableScales,
    availableInterfaceDensities: projectConfig.availableInterfaceDensities,
  }), [
      theme, accentColor, borderRadius, appVersion, appName, appIconPaths, appLogoUrl, fontSize, appScale, interfaceDensity,
      setTheme, setAccentColor, setBorderRadius, setAppVersion, setAppName, setAppIconPaths, setAppLogoUrl, setFontSize, setAppScale, setInterfaceDensity
    ]);

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
