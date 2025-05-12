
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // isFirebaseConfigured is now from useAuth
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
import { useAuth } from '@/contexts/auth-provider'; // Import useAuth
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
  const [formError, setFormError] = React.useState<string | null>(null); // Renamed error to formError
  
  const authContext = useAuth();
  const configured = authContext.isConfigured;

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

    if (!configured) {
      // Use dummy registration
      if (authContext.registerDummyUser) {
        try {
          const newUserProfile: Omit<UserProfile, 'uid'> & { password?: string } = {
            displayName: data.displayName,
            email: data.email,
            password: data.password, // Storing password for dummy check
            role: rolesConfig.defaultRole, // Assign default role
            photoURL: null,
            phoneNumber: null,
          };
          const dummyUser = await authContext.registerDummyUser(newUserProfile);
          if (dummyUser) {
            toast({
              title: 'Dummy Registration Successful',
              description: 'Your dummy account has been created. Redirecting...',
            });
            // AuthProvider handles redirection
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
      // Firestore/Custom claims logic would go here if implementing server-side roles for Firebase
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. Redirecting...',
      });
      router.push('/dashboard'); 
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
      {!configured && (
         <Alert variant="default"> {/* Changed to default variant for info */}
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dummy Mode Active</AlertTitle>
          <AlertDescription>
            {firebaseNotConfiguredMessage}
          </AlertDescription>
        </Alert>
      )}
       {formError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
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
                  <Input placeholder="John Doe" disabled={isLoading} {...field} />
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
                    disabled={isLoading}
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
                  <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
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
                  <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </Form>
    </div>
  );
}
