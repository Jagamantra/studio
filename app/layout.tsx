'use client';

import type { ReactNode } from 'react';
import React from 'react';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-provider';
import { AuthProvider as RealAuthProvider } from '@/contexts/auth-provider';
import { MockAuthProvider } from '@/contexts/mock-auth-provider';
import { ThemedSonnerToaster } from '@/components/ui/themed-sonner-toaster';
import { projectConfig } from '@/config/project.config'; // Import projectConfig

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const AuthProviderComponent = projectConfig.mockApiMode ? MockAuthProvider : RealAuthProvider;

  // Determine initial favicon href based on projectConfig
  // This provides a server-rendered default. ThemeProvider will update it client-side.
  let initialFaviconHref = '/favicon.svg'; // Ultimate fallback
  let initialFaviconType = 'image/svg+xml';

  if (projectConfig.appLogoUrl) {
    initialFaviconHref = projectConfig.appLogoUrl;
    // Determine type from URL (basic check)
    if (projectConfig.appLogoUrl.startsWith('data:image/svg+xml')) {
      initialFaviconType = 'image/svg+xml';
    } else if (projectConfig.appLogoUrl.startsWith('data:image/png')) {
      initialFaviconType = 'image/png';
    } else if (projectConfig.appLogoUrl.endsWith('.ico')) {
      initialFaviconType = 'image/x-icon';
    } else {
      // Assume common image types or let browser infer if not a data URI or known extension
      // For data URIs without explicit svg/png, image/x-icon is a safe default
      initialFaviconType = projectConfig.appLogoUrl.startsWith('data:') ? 'image/x-icon' : 'image/png'; 
    }
  } else if (projectConfig.appIconPaths && projectConfig.appIconPaths.length > 0) {
    // If only appIconPaths are defined, ThemeProvider will generate the dynamic SVG client-side.
    // For SSR, we stick to the /favicon.svg default.
    initialFaviconHref = '/favicon.svg';
    initialFaviconType = 'image/svg+xml';
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={initialFaviconHref} type={initialFaviconType} />
        {/* ThemeProvider will find and update this link client-side if necessary */}
      </head>
      <body className={`${GeistSans.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <AuthProviderComponent> {/* This needs to wrap ThemeProvider if ThemeProvider uses useAuth */}
          <ThemeProvider
            storageKey="genesis-theme"
            defaultTheme="system"
          >
            {children}
            <ThemedSonnerToaster />
          </ThemeProvider>
        </AuthProviderComponent>
      </body>
    </html>
  );
}
