'use client'; 

import type { ReactNode } from 'react'; 
import React from 'react'; 
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-provider'; 
import { AuthProvider as RealAuthProvider } from '@/contexts/auth-provider';
import { MockAuthProvider } from '@/contexts/mock-auth-provider';
import { ThemedSonnerToaster } from '@/components/ui/themed-sonner-toaster';
import { projectConfig } from '@/config/project.config';


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  
  const AuthProviderComponent = projectConfig.mockApiMode ? MockAuthProvider : RealAuthProvider;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon link is now dynamically managed by ThemeProvider based on appLogoUrl or appIconPaths */}
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
