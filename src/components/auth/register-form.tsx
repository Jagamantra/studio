
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
import { Loader2, AlertTriangle, Info } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { rolesConfig } from '@/config/roles.config';
import { useAuth } from '@/contexts/auth-provider'; 
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

    if (!isClient) {
        setIsLoading(false);
        return;
    }

    if (authContext.registerDummyUser) {
      try {
        const newUserProfile: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string } = {
          displayName: data.displayName,
          email: data.email,
          password: data.password, 
          role: rolesConfig.defaultRole, 
          phoneNumber: null,
        };
        const dummyUser = await authContext.registerDummyUser(newUserProfile);
        if (dummyUser) {
          // Toast for registration success is now handled after MFA verification
          // Redirection to MFA is handled by registerDummyUser
        } else {
           const errMsg = authContext.error?.message || "Failed to register mock user.";
           setFormError(errMsg);
           toast({ title: 'Registration Failed', description: errMsg, variant: 'destructive' });
        }
      } catch (err: any) {
        const errMsg = err.message || "Mock registration process failed.";
        setFormError(errMsg);
        toast({ title: 'Registration Error', description: errMsg, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setFormError("Registration function not available in context.");
      setIsLoading(false);
      toast({ title: 'Registration Error', description: "Registration function not available.", variant: 'destructive' });
    }
  }
  
  const systemModeMessage = "Application is running with mock API and dummy data. Your data will be stored locally in your browser.";

  return (
    <div className="grid gap-4"> {/* Reduced gap from gap-6 to gap-4 */}
      {isClient && ( 
         <Alert variant="default"> 
          <Info className="h-4 w-4" /> 
          <AlertTitle className="text-xs sm:text-sm">System Mode</AlertTitle>
          <AlertDescription className="text-[11px] sm:text-xs leading-tight sm:leading-normal">
            {systemModeMessage}
          </AlertDescription>
        </Alert>
      )}
       {formError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs sm:text-sm">Error</AlertTitle> {/* Reduced font size */}
          <AlertDescription className="text-[11px] sm:text-xs leading-tight sm:leading-normal">{formError}</AlertDescription> {/* Reduced font size */}
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3"> {/* Reduced space-y from 4 to 3 */}
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" disabled={isLoading || !isClient} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" disabled={isLoading || !isClient} {...field} />
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" disabled={isLoading || !isClient} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading || !isClient}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </Form>
    </div>
  );
}
