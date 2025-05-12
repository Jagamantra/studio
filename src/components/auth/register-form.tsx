
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase'; 
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
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  
  const authContext = useAuth();
  const configured = authContext.isConfigured;

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

    if (!isClient) { // Should not happen if button is disabled
        setIsLoading(false);
        return;
    }

    if (!configured) {
      if (authContext.registerDummyUser) {
        try {
          const newUserProfile: Omit<UserProfile, 'uid'> & { password?: string } = {
            displayName: data.displayName,
            email: data.email,
            password: data.password, 
            role: rolesConfig.defaultRole, 
            photoURL: null,
            phoneNumber: null,
          };
          const dummyUser = await authContext.registerDummyUser(newUserProfile);
          if (dummyUser) {
            toast({
              title: 'Dummy Registration Successful',
              description: 'Your dummy account has been created. Redirecting...',
            });
             // Redirect is handled by AuthProvider after dummy user is set
          } else {
             const errMsg = authContext.error?.message || "Failed to register dummy user.";
             setFormError(errMsg);
             toast({ title: 'Registration Failed', description: errMsg, variant: 'destructive' });
          }
        } catch (err: any) {
          const errMsg = err.message || "Dummy registration failed.";
          setFormError(errMsg);
          toast({ title: 'Registration Error', description: errMsg, variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      } else {
        setFormError("Dummy registration function not available.");
        setIsLoading(false);
      }
      return;
    }

    // Firebase registration
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, {
        displayName: data.displayName,
      });
      // Firestore document for role/profile would be created here in a real app
      // For this template, role is primarily via custom claims or fetched profile
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. Redirecting...',
      });
      // router.push('/dashboard'); // AuthProvider will handle redirect
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
       if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email address is already in use.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak.';
            break;
          case 'auth/invalid-api-key':
          case 'auth/api-key-not-valid': 
          case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
             errorMessage = 'Firebase API Key is invalid or missing. Please check your application configuration (.env.local file) and ensure NEXT_PUBLIC_FIREBASE_API_KEY matches the one from your Firebase project settings. Refer to README.md for detailed setup instructions. You may need to restart your development server after updating the .env.local file.';
            break;
          default:
            errorMessage = `Registration failed: ${err.message || 'Please try again.'}`;
        }
      } else if (err.message) {
        errorMessage = `Registration failed: ${err.message}`;
      }
      setFormError(errorMessage);
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const firebaseNotConfiguredMessage = "Firebase authentication is not configured. Using dummy registration. Your data will be stored locally in your browser.";

  return (
    <div className="grid gap-6">
      {isClient && !configured && (
         <Alert variant="default"> 
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Dummy Mode Active</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            {firebaseNotConfiguredMessage}
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
