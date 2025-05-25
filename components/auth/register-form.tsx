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
import { Loader2, AlertTriangle } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { rolesConfig } from '@/config/roles.config';
import { useAuth } from '@/contexts/auth-context'; // Using unified AuthContext
import type { UserProfile } from '@/types';

const registerFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, { message: 'Name must be at most 50 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  
  const authContext = useAuth();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setFormError(null);

    if (!isClient || !authContext) {
        setIsLoading(false);
        setFormError("Authentication service not available.");
        return;
    }

    try {
      const newUserDetails: Omit<UserProfile, 'uid' | 'photoURL' | 'preferences'> & { password?: string } = {
        displayName: data.displayName,
        email: data.email,
        password: data.password, 
        role: rolesConfig.defaultRole, 
        phoneNumber: null, // Defaulting phone number, can be updated later
      };

      const response = await authContext.register(newUserDetails);
      if (response && response.user) {
        // Successful registration, AuthProvider will handle redirection to MFA
      } else {
        const errMsg = authContext.error?.message || "Failed to register user.";
        setFormError(errMsg);
        toast({ title: 'Registration Failed', message: errMsg, variant: 'destructive' });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Registration process failed.";
      setFormError(errMsg);
      toast({ title: 'Registration Error', message: errMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="grid gap-2">
       {formError && (
        <Alert variant="destructive" className="p-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          <AlertTitle className="text-xs font-semibold">Error</AlertTitle>
          <AlertDescription className="text-[10px] leading-tight">{formError}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" disabled={isLoading || !isClient} {...field} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || !isClient}
                    {...field}
                    className="h-8 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" disabled={isLoading || !isClient} {...field} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" disabled={isLoading || !isClient} {...field} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-8 text-sm" disabled={isLoading || !isClient}>
            {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Create Account
          </Button>
        </form>
      </Form>
    </div>
  );
}
