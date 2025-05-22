
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

  // Determine initial favicon href based on projectConfig for SSR
  // This provides a server-rendered default. ThemeProvider will update it client-side.
  let initialFaviconHref = '/favicon.ico'; // Default to the static SVG in /public
  let initialFaviconType = 'image/x-icon';

  if (projectConfig.appLogoUrl) { // Check projectConfig for a globally set logo URL first
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
      initialFaviconType = projectConfig.appLogoUrl.startsWith('data:') ? 'image/x-icon' : 'image/png'; 
    }
  }
  // If no projectConfig.appLogoUrl, it defaults to /favicon.svg.
  // The ThemeProvider will handle dynamic updates using theme context's appIconPaths or appLogoUrl client-side.

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" id="app-favicon" />
        {/* ThemeProvider will find and update this link with id="app-favicon" client-side */}
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
