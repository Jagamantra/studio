
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { KeyRound, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-provider';
import { projectConfig } from '@/config/project.config';

const mfaFormSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits.')
    .regex(/^\d+$/, 'OTP must be numeric.'),
});

type MfaFormValues = z.infer<typeof mfaFormSchema>;

export default function MfaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, verifyMfa, logout, loading: authLoading, error: authError } = useAuth();
  const { appName } = useTheme();
  const [mockOtp, setMockOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Only generate mock OTP if in mockApiMode
    if (projectConfig.mockApiMode) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setMockOtp(generatedOtp);
    }
  }, []);

  useEffect(() => {
    document.title = `Verify Your Identity | ${appName}`;
  }, [appName]);


  const form = useForm<MfaFormValues>({
    resolver: zodResolver(mfaFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: MfaFormValues) => {
    setIsLoading(true);
    if (!user?.uid) {
        toast({title: "Error", message: "User session not found. Please log in again.", variant: "destructive"});
        setIsLoading(false);
        await logout();
        return;
    }

    try {
        const response = await verifyMfa(user.uid, data.otp);
        if (response.success) {
            toast({
                title: 'Verification Successful',
                message: 'You have been successfully verified. Redirecting...',
                variant: 'success',
            });
            // AuthProvider's verifyMfa should handle redirection to dashboard
        } else {
            const errMsg = response.message || authError?.message || 'The OTP entered is incorrect. Please try again.';
            toast({ title: 'Verification Failed', message: errMsg, variant: 'destructive' });
            form.setError('otp', { type: 'manual', message: 'Invalid OTP.' });
        }
    } catch (err: any) {
        toast({ title: 'Verification Error', message: err.message || "An unexpected error occurred.", variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    await logout(); // AuthProvider's logout will redirect to login
  };

  if (!isClient || authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {projectConfig.mockApiMode && mockOtp && (
        <Alert variant="default" className="mb-6 sm:mb-8 p-2 sm:p-3">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Mock MFA Code (Mock Mode Only)</AlertTitle>
          <AlertDescription className="text-[10px] sm:text-[11px] leading-tight">
            Your One-Time Password is:{' '}
            <strong className="text-sm sm:text-base font-semibold tracking-wider">
              {mockOtp}
            </strong>
          </AlertDescription>
        </Alert>
      )}
      {!projectConfig.mockApiMode && (
         <Alert variant="default" className="mb-6 sm:mb-8 p-2 sm:p-3">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Check Your Authentication Device</AlertTitle>
          <AlertDescription className="text-[10px] sm:text-[11px] leading-tight">
            A One-Time Password has been sent to your registered MFA method.
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center p-3 sm:p-4">
          <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <CardTitle className="text-base sm:text-lg">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-[10px] sm:text-xs">
            Enter the 6-digit code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">One-Time Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        {...field}
                        className="h-9 sm:h-10 text-center text-sm sm:text-base tracking-[0.15em] sm:tracking-[0.2em]"
                        disabled={isLoading}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-9 sm:h-10 text-sm"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
            </form>
          </Form>
          <div className="text-center text-xs sm:text-sm mt-3">
             {projectConfig.mockApiMode && (
                <p className="text-muted-foreground text-[10px] sm:text-xs mb-1">
                This is a mock MFA screen.
                </p>
             )}
            <Button variant="link" className="p-0 h-auto text-xs sm:text-sm" onClick={handleBackToLogin} disabled={isLoading}>
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
