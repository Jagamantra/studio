
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
// import { signInWithEmailAndPassword } from 'firebase/auth'; // Firebase removed
// import { auth } from '@/lib/firebase';  // Firebase removed
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
import { useAuth } from '@/contexts/auth-provider'; 

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), 
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  
  const authContext = useAuth(); 
  // const configured = authContext.isConfigured; // isConfigured will always be false

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
    setFormError(null);

    if (!isClient) {
        setIsLoading(false);
        return;
    }

    // Firebase is removed, directly use dummy login.
    if (authContext.loginWithDummyCredentials) {
      try {
        const dummyUser = await authContext.loginWithDummyCredentials(data.email, data.password);
        if (dummyUser) {
          toast({
            title: 'Login Successful',
            description: `Welcome back, ${dummyUser.displayName || 'User'}! (Dummy Mode)`,
          });
          // Redirect is handled by AuthProvider
        } else {
          // loginWithDummyCredentials itself should set error in AuthContext or throw
          const errMsg = authContext.error?.message || "Invalid dummy credentials.";
          setFormError(errMsg);
          toast({ title: 'Login Failed', description: errMsg, variant: 'destructive' });
        }
      } catch (err: any) {
        const errMsg = err.message || "Dummy login process failed.";
        setFormError(errMsg);
        toast({ title: 'Login Error', description: errMsg, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    } else {
       setFormError("Login function not available in context.");
       setIsLoading(false);
       toast({ title: 'Login Error', description: "Login function not available.", variant: 'destructive' });
    }
  }
  
  const systemModeMessage = "Application is in Dummy Mode. Login with dummy credentials. Default: admin@dummy.com / user@dummy.com, pass: password123. You can register new dummy users.";

  return (
    <div className="grid gap-6">
      {isClient && ( // Simplified check, as Firebase is always "not configured"
        <Alert variant="default"> 
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">System Mode</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            {systemModeMessage}
          </AlertDescription>
        </Alert>
      )}
      {formError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Error</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">{formError}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || !isClient}
                    {...field}
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
                  <FormLabel>Password</FormLabel>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline underline-offset-4" tabIndex={-1} onClick={(e)=>e.preventDefault()}>
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" disabled={isLoading || !isClient} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading || !isClient}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={true} className="w-full">
        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
        GitHub (Coming Soon)
      </Button>
    </div>
  );
}
