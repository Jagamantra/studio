
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { User as FirebaseUser } from 'firebase/auth';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit2, UserCircle } from 'lucide-react';
import type { UserProfile } from '@/types';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name cannot exceed 50 characters.').optional(),
  email: z.string().email('Invalid email address.').optional(), 
  phoneNumber: z.string().optional(), 
  photoURL: z.string().url('Invalid URL for photo.').optional().nullable(), 
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface PersonalInformationFormProps {
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  anyLoading: boolean;
  setAnyLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PersonalInformationForm({ user, firebaseUser, setUser, anyLoading, setAnyLoading }: PersonalInformationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(user?.photoURL || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      photoURL: user?.photoURL || '',
    },
  });

  React.useEffect(() => {
    form.reset({
      displayName: user.displayName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      photoURL: user.photoURL || '',
    });
    setPreviewUrl(user.photoURL || null);
  }, [user, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        form.setValue('photoURL', reader.result as string, { shouldDirty: true }); 
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(user?.photoURL || null); 
      form.setValue('photoURL', user?.photoURL || null, { shouldDirty: true });
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!firebaseUser) return;
    setIsLoading(true);
    setAnyLoading(true);
    try {
      // If a new file was selected, previewUrl holds its data URI.
      // Otherwise, use data.photoURL which might be the existing URL or null if cleared.
      const photoURLToUpdate = selectedFile ? previewUrl : data.photoURL;

      await firebaseUpdateProfile(firebaseUser, {
        displayName: data.displayName,
        photoURL: photoURLToUpdate, 
      });
      
      // Update local user state
      setUser(prevUser => prevUser ? { ...prevUser, ...data, photoURL: photoURLToUpdate } : null);
      form.reset({ ...data, photoURL: photoURLToUpdate }, { keepValues: true, keepDirty: false }); // Reset form with new values, clear dirty state

      toast({ title: 'Profile Updated', description: 'Your personal information has been saved.' });
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setAnyLoading(false);
      setSelectedFile(null); // Clear selected file after submission
    }
  }
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <UserCircle className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl md:text-2xl">Personal Information</CardTitle>
            <CardDescription>Update your personal details and profile picture.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:space-x-6">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src={previewUrl || undefined} alt={user.displayName || 'User'} data-ai-hint="person face" />
                  <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || anyLoading}
                  aria-label="Change profile picture"
                >
                  <Edit2 className="h-4 w-4"/>
                </Button>
                <Input 
                  id="photo-upload" 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/gif" 
                  disabled={isLoading || anyLoading}
                /> 
              </div>
              <div className="flex-grow space-y-1 w-full sm:w-auto text-center sm:text-left">
                <FormLabel htmlFor="photo-upload-info" className="block text-sm font-medium">Profile Picture</FormLabel>
                <p id="photo-upload-info" className="text-xs text-muted-foreground">
                  Click the edit icon on the image to change.
                  PNG, JPG, GIF up to 5MB.
                </p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} disabled={isLoading || anyLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl><Input type="tel" placeholder="+1 123 456 7890" {...field} disabled={isLoading || anyLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isLoading || anyLoading || !form.formState.isDirty}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
