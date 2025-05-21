
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, AlertTriangle } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/auth-context';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), 
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null); // To display errors on the form
  const [isClient, setIsClient] = React.useState(false);
  
  const authContext = useAuth(); 

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setFormError(null); // Clear previous form errors

    if (!isClient || !authContext) {
        setIsLoading(false);
        setFormError("Authentication service not available."); // Set form error
        return;
    }
    
    // Clear global error from context before new attempt
    if (authContext.error) {
      // This depends on how you want to manage error state in AuthContext
      // For now, we'll just log it, as the login form itself has `formError`
      console.log("Clearing previous auth context error for new login attempt.");
    }

    try {
      const response = await authContext.login(data.email, data.password);
      // If login is successful and codeSent is true, AuthProvider handles redirection to MFA.
      // We don't need to do anything else here for the success case.
      // If response is null or codeSent is false, it means login failed at the API level.
      if (!response || !response.codeSent) {
        const errMsg = authContext.error?.message || "Invalid credentials or an unknown error occurred.";
        setFormError(errMsg); // Set form error to display in the Alert
        // No toast here, formError Alert will show.
      }
      // Success (codeSent:true) is handled by redirection in AuthProvider
    } catch (err: any) { // Catch errors from authContext.login itself (e.g., network issues)
      const errMsg = err.message || "Login process failed.";
      setFormError(errMsg); // Set form error
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="grid gap-3 sm:gap-4">
      {formError && ( // Display form-specific error
        <Alert variant="destructive" className="p-2 sm:p-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Login Failed</AlertTitle>
          <AlertDescription className="text-[10px] sm:text-[11px] leading-tight">{formError}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || !isClient}
                    {...field}
                    className="h-9 sm:h-10 text-sm" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs sm:text-sm">Password</FormLabel>
                  <Link href="/auth/forgot-password" className="text-xs sm:text-sm font-medium text-primary hover:underline underline-offset-4" tabIndex={isLoading || !isClient ? -1 : undefined}>
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" disabled={isLoading || !isClient} {...field} className="h-9 sm:h-10 text-sm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={isLoading || !isClient}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>
      <div className="relative mt-3 sm:mt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={true} className="w-full h-9 sm:h-10 text-sm">
        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
        GitHub (Coming Soon)
      </Button>
    </div>
  );
}
