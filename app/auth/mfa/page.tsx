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
import { KeyRound, Info, Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
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
  const {
    verifyMfa,
    logout,
    loading: authLoading,
    error: authContextError,
    authEmailForMfa,
  } = useAuth();
  const { appName } = useTheme();
  const [mockOtp, setMockOtp] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false); // <-- added

  useEffect(() => {
    setIsClient(true);
    if (projectConfig.mockApiMode) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setMockOtp(generatedOtp);
    }
  }, []);

  useEffect(() => {
    document.title = `Verify Your Identity | ${appName}`;
  }, [appName]);

  useEffect(() => {
    if (authContextError) {
      setFormError(authContextError.message);
    }
  }, [authContextError]);

  const form = useForm<MfaFormValues>({
    resolver: zodResolver(mfaFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: MfaFormValues) => {
    if (authLoading || isVerifying) return; // block if already verifying
    setFormError(null);
    setIsVerifying(true); // start loading spinner

    if (!authEmailForMfa && !projectConfig.mockApiMode) {
      setFormError('Session context lost. Please log in again.');
      await logout();
      setIsVerifying(false);
      return;
    }

    if (projectConfig.mockApiMode && data.otp !== mockOtp) {
      setFormError('Invalid OTP for mock mode.');
      form.setError('otp', { type: 'manual', message: 'Invalid OTP for mock mode.' });
      setIsVerifying(false);
      return;
    }

    try {
      const response = await verifyMfa(data.otp);
      if (response && response.accessToken) {
        // Success: AuthProvider likely handles redirect or state update
        // Keep loading spinner until redirect happens to avoid flicker
      } else {
        const errMsg =
          authContextError?.message ||
          (response as any)?.message ||
          'The OTP entered is incorrect or an error occurred.';
        setFormError(errMsg);
        form.setError('otp', { type: 'manual', message: 'Invalid OTP.' });
        setIsVerifying(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred during MFA verification.');
      setIsVerifying(false);
    }
  };

  const handleBackToLogin = async () => {
    await logout();
  };

  // Show loading if:
  // - page is not client yet
  // - auth context loading
  // - or MFA verify request in flight
  if (!isClient || authLoading || isVerifying) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show session expired ONLY if session is truly missing and NOT verifying
  if (
    (!authEmailForMfa && !projectConfig.mockApiMode) ||
    authContextError?.message?.toLowerCase().includes('session')
  ) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session Expired</CardTitle>
          <CardDescription>
            Your login session is incomplete or has expired. Please log in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackToLogin} className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {projectConfig.mockApiMode && mockOtp && (
        <Alert variant="default" className="mb-3 p-1.5">
          <Info className="h-3.5 w-3.5" />
          <AlertTitle className="text-xs font-semibold">Mock MFA Code</AlertTitle>
          <AlertDescription className="text-[10px] leading-tight">
            Your One-Time Password is:{' '}
            <strong className="text-sm font-semibold tracking-wider">{mockOtp}</strong>
          </AlertDescription>
        </Alert>
      )}
      {!projectConfig.mockApiMode && authEmailForMfa && (
        <Alert variant="default" className="mb-3 p-1.5">
          <Info className="h-3.5 w-3.5" />
          <AlertTitle className="text-xs font-semibold">Check Your Authentication Device</AlertTitle>
          <AlertDescription className="text-[10px] leading-tight">
            A One-Time Password has been sent to{' '}
            {authEmailForMfa ? `your email (${authEmailForMfa})` : 'your registered MFA method'}.
          </AlertDescription>
        </Alert>
      )}
      {formError && (
        <Alert variant="destructive" className="mb-3 p-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          <AlertTitle className="text-xs font-semibold">Verification Error</AlertTitle>
          <AlertDescription className="text-[10px] leading-tight">{formError}</AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center p-3">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-[10px]">Enter the 6-digit code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2"
              noValidate
            >
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">One-Time Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^0-9]/g, '')
                            .slice(0, 6);
                          field.onChange(value);
                          if (value.length === 6 && !authLoading && !isVerifying) {
                            onSubmit({ otp: value });
                          }
                        }}
                        className="h-8 text-center text-sm tracking-[0.15em]"
                        disabled={authLoading || isVerifying}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />
                    </FormControl>
                    {(authLoading || isVerifying) && (
                      <div className="flex justify-center mt-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      </div>
                    )}
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="text-center text-xs mt-2">
                {projectConfig.mockApiMode && (
                  <p className="text-muted-foreground text-[10px] mb-1">
                    This is a mock MFA screen.
                  </p>
                )}
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={handleBackToLogin}
                  disabled={authLoading || isVerifying}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
