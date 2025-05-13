
'use client'; 

import type { ReactNode } from 'react'; 
import React from 'react'; 
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider, useTheme } from '@/contexts/theme-provider'; 
import { AuthProvider } from '@/contexts/auth-provider';
import { Toaster as SonnerToaster } from 'sonner';


function ThemedSonnerToaster() {
  const { theme, accentColor } = useTheme(); 

  const toastOptions = React.useMemo(() => ({
    classNames: {
      toast: ``, 
      title: ``, 
      description: ``, 
      actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90', 
      cancelButton: ``, 
      closeButton: ``, 
      error: ``, 
      success: ``, 
      warning: ``, 
      info: ``, 
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
        <title>Genesis Template</title>
        <meta name="description" content="A dynamic project template powered by Next.js, Tailwind CSS, and shadcn/ui." />
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

