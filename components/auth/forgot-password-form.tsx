
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import * as api from '@/services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState('');

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    try {
      await api.forgotPassword(data.email);
      toast({
        title: 'Request Sent',
        message: `If an account exists for ${data.email}, a password reset link has been sent (mocked).`,
        variant: 'success',
      });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      form.reset();
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: 'Request Failed',
        message: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center p-3 sm:p-4">
          <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <CardTitle className="text-base sm:text-lg">Check Your Email</CardTitle>
          <CardDescription className="text-[10px] sm:text-xs">
            A (mock) password reset link has been sent to <strong>{submittedEmail}</strong> if an account with that email exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 text-center">
          <Button asChild variant="outline" className="w-full h-9 sm:h-10 text-sm">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center p-3 sm:p-4">
         <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        <CardTitle className="text-base sm:text-lg">Forgot Your Password?</CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">
          Enter your email address and we&apos;ll send you a (mock) link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-3 sm:p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </Form>
        <div className="text-center">
            <Button variant="link" className="p-0 h-auto text-xs sm:text-sm" asChild>
                 <Link href="/auth/login">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Back to Login
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
