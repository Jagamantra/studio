
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types';

interface UserDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deletingUser: UserProfile | null;
  onConfirmDelete: () => Promise<void>;
  isLoading: boolean;
}

export function UserDeleteDialog({ isOpen, onOpenChange, deletingUser, onConfirmDelete, isLoading }: UserDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg md:text-xl">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm">
            This action cannot be undone. This will permanently delete the user account 
            for <span className="font-semibold">{deletingUser?.displayName}</span> and remove their data from our servers (mock deletion).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} size="sm">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isLoading} size="sm">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
