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
import { useAuth } from '@/contexts/auth-provider'; // Import useAuth

const mfaFormSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits.').regex(/^\d+$/, 'OTP must be numeric.'),
});

type MfaFormValues = z.infer<typeof mfaFormSchema>;

export default function MfaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setIsMfaVerified } = useAuth(); // Get setIsMfaVerified from context
  const [mockOtp, setMockOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.otp === mockOtp) {
      setIsMfaVerified(true); // Set MFA as verified in context
      toast({
        title: 'Verification Successful',
        description: 'You have been successfully verified. Redirecting...',
      });
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
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {mockOtp && (
        <Alert variant="default" className="mb-3 sm:mb-4 p-2 sm:p-3"> {/* Reduced padding and margin */}
          <Info className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Mock MFA Code</AlertTitle> {/* Ensured small text */}
          <AlertDescription className="text-[10px] sm:text-[11px] leading-tight"> {/* Further reduced text size */}
            For testing purposes, your One-Time Password is: <strong className="text-sm sm:text-base font-semibold tracking-wider">{mockOtp}</strong>
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center p-3 sm:p-4"> {/* Reduced padding */}
          <div className="mx-auto mb-1 sm:mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary"> {/* Smaller icon container */}
            <KeyRound className="h-5 w-5 sm:h-6 sm:w-6" /> {/* Smaller icon */}
          </div>
          <CardTitle className="text-base sm:text-lg">Two-Factor Authentication</CardTitle> {/* Smaller title */}
          <CardDescription className="text-[10px] sm:text-xs"> {/* Smaller description */}
            Enter the 6-digit code shown in the alert above.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-3 sm:p-4"> {/* Reduced padding and space-y */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3"> {/* Reduced space-y */}
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">One-Time Password</FormLabel> {/* Smaller label */}
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        {...field}
                        className="h-9 sm:h-10 text-center text-sm sm:text-base tracking-[0.15em] sm:tracking-[0.2em]" /* Smaller input and tracking */
                        disabled={isLoading}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={isLoading}> {/* Smaller button */}
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
            </form>
          </Form>
          <div className="text-center text-xs sm:text-sm"> {/* Smaller text */}
            <p className="text-muted-foreground text-[10px] sm:text-xs"> {/* Smaller text */}
              This is a mock MFA screen. No real authentication is performed.
            </p>
            <Button variant="link" className="mt-1 p-0 h-auto text-xs sm:text-sm" asChild> {/* Smaller button */}
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
