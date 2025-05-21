
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
  const { verifyMfa, logout, loading: authLoading, error: authContextError, authEmailForMfa } = useAuth();
  const { appName } = useTheme();
  const [mockOtp, setMockOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // Form-specific loading
  const [isClient, setIsClient] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);


  useEffect(() => {
    setIsClient(true);
    if (projectConfig.mockApiMode) {
      // For mock mode, generate and display an OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setMockOtp(generatedOtp);
    }
  }, []);

  useEffect(() => {
    document.title = `Verify Your Identity | ${appName}`;
  }, [appName]);

  useEffect(() => {
    // Display global errors from AuthContext if they occur during MFA process
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
    setIsLoading(true);
    setFormError(null);

    if (!authEmailForMfa && !projectConfig.mockApiMode) {
        setFormError("Session context lost. Please log in again.");
        setIsLoading(false);
        await logout();
        return;
    }
    
    if (projectConfig.mockApiMode && data.otp !== mockOtp) {
        setFormError('Invalid OTP for mock mode.');
        form.setError('otp', { type: 'manual', message: 'Invalid OTP for mock mode.' });
        setIsLoading(false);
        return;
    }

    try {
        // verifyMfa now takes only the OTP. Email is sourced from context.
        const response = await verifyMfa(data.otp); 
        if (response && response.accessToken) { 
            // Toast for success is now handled within verifyMfa in AuthProvider
            // AuthProvider handles redirection to dashboard
        } else {
            // If response is null or no accessToken, it means verifyMfa itself failed
            // or the AuthProvider's verifyMfa logic determined a failure.
            // Use error from AuthContext if available, or provide a generic message.
            const errMsg = authContextError?.message || (response as any)?.message || 'The OTP entered is incorrect or an error occurred.';
            setFormError(errMsg);
            form.setError('otp', { type: 'manual', message: 'Invalid OTP.' });
        }
    } catch (err: any) { // Catch errors from verifyMfa itself
        setFormError(err.message || "An unexpected error occurred during MFA verification.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    await logout(); 
  };

  // Show loading spinner if auth context is loading or if it's mock mode and no email for MFA yet (initial load flicker)
  if (!isClient || (authLoading && (!authEmailForMfa && projectConfig.mockApiMode))) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!authEmailForMfa && !projectConfig.mockApiMode && !authLoading) {
     // Should be redirected by AuthProvider, but as a fallback:
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session Expired</CardTitle>
          <CardDescription>Your login session is incomplete or has expired. Please log in again.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackToLogin} className="w-full">Back to Login</Button>
        </CardContent>
      </Card>
    )
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
            A One-Time Password has been sent to {authEmailForMfa ? `your email (${authEmailForMfa})` : 'your registered MFA method'}.
          </AlertDescription>
        </Alert>
      )}
      {formError && (
        <Alert variant="destructive" className="mb-4 p-2 sm:p-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Verification Error</AlertTitle>
          <AlertDescription className="text-[10px] sm:text-[11px] leading-tight">{formError}</AlertDescription>
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
                        disabled={isLoading || authLoading}
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
                disabled={isLoading || authLoading}
              >
                {(isLoading || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <Button variant="link" className="p-0 h-auto text-xs sm:text-sm" onClick={handleBackToLogin} disabled={isLoading || authLoading}>
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
