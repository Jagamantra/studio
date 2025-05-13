
'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth-provider'; 
import * as api from '@/services/api'; 

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface ChangePasswordFormProps {
  anyLoading: boolean;
  setAnyLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChangePasswordForm = React.memo(function ChangePasswordForm({ anyLoading, setAnyLoading }: ChangePasswordFormProps) {
  const { toast } = useToast();
  const { user } = useAuth(); 
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  async function onSubmit(data: PasswordFormValues) {
    if (!user || !user.uid) { 
        toast({ title: 'Error', message: 'User not found. Please log in again.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    setAnyLoading(true);
    try {
      await api.changeUserPassword(user.uid, data.currentPassword, data.newPassword);
      toast({ title: 'Password Updated', message: 'Your password has been changed successfully. (Mocked)', variant: 'success' });
      form.reset();
    } catch (error: any) {
      let desc = error.message || 'An error occurred during password update.';
      toast({ title: 'Password Update Failed', message: desc, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setAnyLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl md:text-2xl">Change Password</CardTitle>
            <CardDescription>Update your account password. Ensure it's strong and unique.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading || anyLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading || anyLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading || anyLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isLoading || anyLoading || !form.formState.isDirty}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
});

ChangePasswordForm.displayName = 'ChangePasswordForm';
