
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

  // Document title is now set per page using dynamic metadata or useEffect
  
  const AuthProviderComponent = projectConfig.mockApiMode ? MockAuthProvider : RealAuthProvider;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon link is now dynamically managed by ThemeProvider */}
      </head>
      <body className={`${GeistSans.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <AuthProviderComponent>
          <ThemeProvider
            storageKey="genesis-theme" // Keep local storage keys consistent if needed
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
