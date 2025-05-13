
'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit2, UserCircle } from 'lucide-react';
import type { UserProfile } from '@/types';
import * as api from '@/services/api'; 
import Image from 'next/image';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name cannot exceed 50 characters.').optional(),
  email: z.string().email('Invalid email address.').optional(), 
  phoneNumber: z.string().optional().nullable(), 
  photoURL: z.string().url('Invalid URL for photo.').optional().nullable(), 
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface PersonalInformationFormProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>; 
  updateAuthContextUser: (updatedProfile: Partial<UserProfile>) => void;
  anyLoading: boolean;
  setAnyLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PersonalInformationForm = React.memo(function PersonalInformationForm({ user, setUser, updateAuthContextUser, anyLoading, setAnyLoading }: PersonalInformationFormProps) {
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
    if (!user) return; 
    setIsLoading(true);
    setAnyLoading(true);

    const originalProfile = {
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
    };

    try {
      const photoURLToUpdate = selectedFile ? previewUrl : data.photoURL;

      const updatedProfileFromApi = await api.updateUserProfile(user.uid, {
        displayName: data.displayName,
        photoURL: photoURLToUpdate,
        phoneNumber: data.phoneNumber,
      });
      
      updateAuthContextUser(updatedProfileFromApi); 
      setUser(updatedProfileFromApi); 

      form.reset({ ...updatedProfileFromApi, email: user.email }, { keepValues: true, keepDirty: false });

      toast({ 
        title: 'Profile Updated', 
        message: 'Your personal information has been saved.',
        variant: 'success',
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedProfile = await api.updateUserProfile(user.uid, originalProfile);
            updateAuthContextUser(revertedProfile);
            setUser(revertedProfile);
            form.reset({ ...revertedProfile, email: user.email }, { keepValues: true, keepDirty: false });
            setPreviewUrl(revertedProfile.photoURL || null);
            toast({ message: "Profile changes undone.", variant: "info" });
          }
        }
      });
    } catch (error: any) {
      toast({ title: 'Update Failed', message: error.message || "Could not update profile.", variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setAnyLoading(false);
      setSelectedFile(null);
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
                  {previewUrl ? (
                     <Image 
                        src={previewUrl} 
                        alt={user.displayName || 'User avatar'} 
                        width={96} 
                        height={96} 
                        className="rounded-full object-cover" 
                        data-ai-hint="person face"
                        unoptimized={true} // If previewUrl can be data URI or external
                      />
                  ) : (
                     <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                  )}
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
                  PNG, JPG, GIF up to 5MB. (Upload is mocked)
                </p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} value={field.value || ''} disabled={isLoading || anyLoading} />
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} value={field.value || ''} disabled />
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">Email address cannot be changed.</FormDescription>
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
                  <FormControl>
                    <Input type="tel" placeholder="+1 123 456 7890" {...field} value={field.value || ''} disabled={isLoading || anyLoading} />
                  </FormControl>
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
});

PersonalInformationForm.displayName = 'PersonalInformationForm';
