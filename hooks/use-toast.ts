
'use client';

import { toast as sonnerToast, type ExternalToast } from 'sonner';
import type { ReactNode } from 'react';
import { format } from 'date-fns';

interface CustomToastProps {
  title?: ReactNode; // Optional title
  message: ReactNode; // Main message content
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  duration?: number;
  // Allow any other props Sonner might accept
  [key: string]: any;
}

export function useToast() {
  const toast = ({ title, message, variant, action, duration, ...rest }: CustomToastProps) => {
    const now = new Date();
    const dateTimeString = format(now, "EEE, MMM d 'at' h:mm a");

    // Isolate the potentially problematic part
    const messageContainer = <div>{message}</div>;

    const descriptionContent = (
      <div>
        {messageContainer}
        <p className="mt-1 text-xs text-muted-foreground">{dateTimeString}</p>
      </div>
    );

    const toastOptions: ExternalToast = {
      description: descriptionContent,
      duration: duration || 5000, // Default duration
      ...rest, // Pass through other sonner options
    };

    if (action) {
      toastOptions.action = {
        label: action.label,
        onClick: action.onClick,
      };
    }
    
    const toastTitle = title || undefined; 

    switch (variant) {
      case 'destructive':
        sonnerToast.error(toastTitle, toastOptions);
        break;
      case 'success':
        sonnerToast.success(toastTitle, toastOptions);
        break;
      case 'warning':
        sonnerToast.warning(toastTitle, toastOptions);
        break;
      case 'info':
        sonnerToast.info(toastTitle, toastOptions);
        break;
      default:
        // If no title, the description (which includes the message and date) becomes the main content for sonner
        // sonnerToast function expects the first argument to be the message if no title is provided.
        // If a title exists, it's the first argument.
        if (toastTitle) {
             sonnerToast(toastTitle, toastOptions);
        } else {
            // Pass the description content directly as the main message to Sonner
            // Ensure other options like duration and action are still passed correctly.
            sonnerToast(toastOptions.description, { duration: toastOptions.duration, action: toastOptions.action, ...rest });
        }
        break;
    }
  };

  return { toast };
}

