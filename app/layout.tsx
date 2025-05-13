'use client'; 

import type { ReactNode } from 'react'; 
import React from 'react'; 
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-provider'; 
import { AuthProvider } from '@/contexts/auth-provider';
import { ThemedSonnerToaster } from '@/components/ui/themed-sonner-toaster'; // Updated import path
import { projectConfig } from '@/config/project.config';


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {

  if (typeof document !== 'undefined') {
    document.title = projectConfig.appName;
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${GeistSans.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          storageKey="genesis-theme"
          defaultTheme="system"
        >
          <AuthProvider>
            {children}
            <ThemedSonnerToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
