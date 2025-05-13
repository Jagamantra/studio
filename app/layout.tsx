'use client'; // Required for useTheme hook

import type { ReactNode } from 'react'; // Import ReactNode
import React from 'react'; // Import React for useMemo
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider, useTheme } from '@/contexts/theme-provider'; // Import useTheme
import { AuthProvider } from '@/contexts/auth-provider';
import { Toaster as SonnerToaster } from 'sonner';
// Removed projectConfig import as appName is handled by page metadata

// Static metadata cannot be used in a client component.
// If appName needs to be dynamic in metadata, this needs to be handled differently,
// possibly by moving metadata to a server component parent or using generateMetadata.

// Create a client component to consume the theme for SonnerToaster
function ThemedSonnerToaster() {
  const { theme, accentColor } = useTheme(); 

  // Memoize toastOptions to ensure it's stable unless theme or accentColor changes.
  const toastOptions = React.useMemo(() => ({
    classNames: {
      actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
  }), [accentColor]);

  const sonnerKey = `${theme}-${accentColor}`;

  return (
    <SonnerToaster
      key={sonnerKey}
      richColors
      closeButton={false}
      theme={theme as 'light' | 'dark' | 'system'}
      toastOptions={toastOptions}
    />
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Generic title and description. Specific pages will override. */}
        <title>Genesis Template</title>
        <meta name="description" content={`A dynamic project template powered by Next.js, Tailwind CSS, and shadcn/ui.`} />
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

