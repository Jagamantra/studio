
'use client';

import *_React from 'react'; // Avoids TSError: ⨯ Unable to compile TypeScript - Should be React not _React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, ShieldCheck, Settings2, UserCircle } from 'lucide-react';
import { updateProfile as firebaseUpdateProfile, updatePassword as firebaseUpdatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name cannot exceed 50 characters.').optional(),
  email: z.string().email('Invalid email address.').optional(), // Email change requires verification, more complex
  phoneNumber: z.string().optional(), // Add validation if needed e.g. .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number')
  photoURL: z.string().url('Invalid URL for photo.').optional(), // For simplicity, direct URL. Real app: upload.
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ['confirmPassword'],
});

const advancedSettingsSchema = z.object({
  receiveNotifications: z.boolean().optional(),
  interfaceDensity: z.enum(['compact', 'comfortable', 'spacious']).optional(),
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type AdvancedSettingsFormValues = z.infer<typeof advancedSettingsSchema>;

export default function ProfilePage() {
  const { user, firebaseUser, setUser, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [_ReactIsLoading, setIsLoading] = _React.useState({ profile: false, password: false, advanced: false }); // Renamed React to _React

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      photoURL: user?.photoURL || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const advancedSettingsForm = useForm<AdvancedSettingsFormValues>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: {
      receiveNotifications: user?.receiveNotifications ?? true,
      interfaceDensity: user?.interfaceDensity ?? 'comfortable',
    },
  });

  _React.useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
      });
      advancedSettingsForm.reset({
        receiveNotifications: user.receiveNotifications ?? true,
        interfaceDensity: user.interfaceDensity ?? 'comfortable',
      });
    }
  }, [user, profileForm, advancedSettingsForm]);

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!firebaseUser) return;
    setIsLoading(prev => ({ ...prev, profile: true }));
    try {
      await firebaseUpdateProfile(firebaseUser, {
        displayName: data.displayName,
        // photoURL: data.photoURL, // Update photoURL if field exists and used
      });
      // If email change is implemented, it would require re-authentication and verification.
      // Phone number update also complex (verification).
      
      // Update local user state in AuthProvider
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);

      toast({ title: 'Profile Updated', description: 'Your personal information has been saved.' });
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!firebaseUser || !firebaseUser.email) return;
    setIsLoading(prev => ({ ...prev, password: true }));
    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, data.currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await firebaseUpdatePassword(firebaseUser, data.newPassword);
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully. You might be logged out for security.' });
      passwordForm.reset();
      // Consider logging out user for security after password change
      // await logout(); 
    } catch (error: any) {
      let desc = 'An error occurred.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        desc = 'Incorrect current password.';
      } else if (error.code === 'auth/too-many-requests') {
        desc = 'Too many attempts. Please try again later.';
      }
      toast({ title: 'Password Update Failed', description: desc, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  }

  async function onAdvancedSubmit(data: AdvancedSettingsFormValues) {
     setIsLoading(prev => ({ ...prev, advanced: true }));
    try {
      // Simulate saving advanced settings
      console.log("Advanced settings saved:", data);
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
      toast({ title: 'Settings Saved', description: 'Your advanced settings have been updated.' });
    } catch (error: any) {
      toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, advanced: false }));
    }
  }
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  if (authLoading) return <div className="flex flex-1 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!user) return <div className="flex flex-1 items-center justify-center"><p>Please log in to view your profile.</p></div>;

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCircle className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="person face" />
                  <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-1">
                  <FormLabel htmlFor="photo-upload">Profile Picture</FormLabel>
                  <Input id="photo-upload" type="file" className="max-w-xs" disabled /> 
                  <FormDescription>PNG, JPG, GIF up to 5MB. Upload not implemented.</FormDescription>
                </div>
              </div>
              <FormField
                control={profileForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input type="email" placeholder="your@email.com" {...field} disabled /></FormControl>
                    <FormDescription>Email address cannot be changed here for security reasons.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={profileForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl><Input type="tel" placeholder="+1 123 456 7890" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={_ReactIsLoading.profile}>
                {_ReactIsLoading.profile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password. Ensure it's strong and unique.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={_ReactIsLoading.password}>
                {_ReactIsLoading.password && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Customize your application experience.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...advancedSettingsForm}>
          <form onSubmit={advancedSettingsForm.handleSubmit(onAdvancedSubmit)}>
            <CardContent className="space-y-6">
               <FormField
                control={advancedSettingsForm.control}
                name="receiveNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Receive updates and important announcements via email.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={advancedSettingsForm.control}
                name="interfaceDensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interface Density</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interface density" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Adjust the spacing and size of UI elements. (This is a conceptual setting)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={_ReactIsLoading.advanced}>
                {_ReactIsLoading.advanced && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Preferences
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
