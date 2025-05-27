'use client';

import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-provider';
import { AuthProvider as RealAuthProvider } from '@/contexts/auth-provider';
import { MockAuthProvider } from '@/contexts/mock-auth-provider';
import { ThemedSonnerToaster } from '@/components/ui/themed-sonner-toaster';
import { projectConfig } from '@/config/project.config'; // Import projectConfig
import { Loader2 } from 'lucide-react';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const AuthProviderComponent = projectConfig.mockApiMode ? MockAuthProvider : RealAuthProvider;

  // Dynamically update the favicon on client-side mount
  useEffect(() => {
    if (!projectConfig.faviconUrl) return;

    const favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;

    if (favicon) {
      favicon.href = projectConfig.faviconUrl;

      if (projectConfig.faviconUrl.endsWith('.svg')) {
        favicon.type = 'image/svg+xml';
      } else if (projectConfig.faviconUrl.endsWith('.png')) {
        favicon.type = 'image/png';
      } else if (projectConfig.faviconUrl.endsWith('.ico')) {
        favicon.type = 'image/x-icon';
      } else {
        favicon.type = 'image/png'; // Fallback
      }
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Default favicon; will be updated dynamically on client-side if projectConfig.faviconUrl is set */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" id="app-favicon" />
      </head>
      <body className={`${GeistSans.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <AuthProviderComponent>
          <ThemeProvider
            storageKey="genesis-theme"
            defaultTheme="system"
          >
            <React.Suspense fallback={
              <div className="flex flex-1 items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              {children}
            </React.Suspense>
            <ThemedSonnerToaster />
          </ThemeProvider>
        </AuthProviderComponent>
      </body>
    </html>
  );
}
