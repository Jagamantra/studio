'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { KeyRound, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mfaFormSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits.').regex(/^\d+$/, 'OTP must be numeric.'),
});

type MfaFormValues = z.infer<typeof mfaFormSchema>;

export default function MfaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mockOtp, setMockOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate a mock OTP on client mount
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtp(generatedOtp);
    document.title = 'Verify Your Identity | Genesis Template';
  }, []);

  const form = useForm<MfaFormValues>({
    resolver: zodResolver(mfaFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  async function onSubmit(data: MfaFormValues) {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.otp === mockOtp) {
      toast({
        title: 'Verification Successful',
        description: 'You have been successfully verified. Redirecting...',
      });
      // In a real app, you'd update auth state here (e.g., using useAuth context)
      // For this mock, simply redirect.
      router.push('/dashboard');
    } else {
      toast({
        title: 'Verification Failed',
        description: 'The OTP entered is incorrect. Please try again.',
        variant: 'destructive',
      });
      form.setError('otp', { type: 'manual', message: 'Invalid OTP.' });
    }
    setIsLoading(false);
  }

  if (!isClient) {
    // Basic loading state until client-side effects run
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {mockOtp && (
        <Alert variant="default" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Mock MFA Code</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            For testing purposes, your One-Time Password is: <strong className="text-lg font-semibold tracking-wider">{mockOtp}</strong>
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Enter the 6-digit code shown in the alert above.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        {...field}
                        className="h-12 text-center text-lg sm:text-xl tracking-[0.3em] sm:tracking-[0.5em]"
                        disabled={isLoading}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              This is a mock MFA screen. No real authentication is performed.
            </p>
            <Button variant="link" className="mt-2 p-0 h-auto" asChild>
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
