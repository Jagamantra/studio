'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function LoadingScreen({ 
  message = 'Loading application...',
  submessage = 'Please wait while we prepare your experience.'
}: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">{submessage}</p>
      </div>
    </div>
  );
}
