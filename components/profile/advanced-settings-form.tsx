
'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings2 } from 'lucide-react';
import type { UserProfile } from '@/types';
import * as api from '@/services/api';
import { useTheme } from '@/contexts/theme-provider'; // Import useTheme

const advancedSettingsSchema = z.object({
  receiveNotifications: z.boolean().optional(),
  interfaceDensity: z.enum(['compact', 'comfortable', 'spacious']).optional(),
});

type AdvancedSettingsFormValues = z.infer<typeof advancedSettingsSchema>;

interface AdvancedSettingsFormProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateAuthContextUser: (updatedProfile: Partial<UserProfile>) => void;
  anyLoading: boolean;
  setAnyLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdvancedSettingsForm = React.memo(function AdvancedSettingsForm({ user, setUser, updateAuthContextUser, anyLoading, setAnyLoading }: AdvancedSettingsFormProps) {
  const { toast } = useToast();
  const { interfaceDensity: currentThemeDensity, setInterfaceDensity: setThemeDensity, availableInterfaceDensities } = useTheme(); // Get theme context
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<AdvancedSettingsFormValues>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: {
      receiveNotifications: user?.receiveNotifications ?? true,
      interfaceDensity: user?.preferredInterfaceDensity ?? currentThemeDensity ?? projectConfig.defaultInterfaceDensity,
    },
  });

  React.useEffect(() => {
    // Sync form with user profile preference or current theme density
    const densityToSet = user.preferredInterfaceDensity || currentThemeDensity || projectConfig.defaultInterfaceDensity;
    form.reset({
      receiveNotifications: user.receiveNotifications ?? true,
      interfaceDensity: densityToSet,
    });
    // If user has a preference, ensure theme provider reflects it
    if (user.preferredInterfaceDensity && user.preferredInterfaceDensity !== currentThemeDensity) {
        setThemeDensity(user.preferredInterfaceDensity);
    } else if (!user.preferredInterfaceDensity && currentThemeDensity !== densityToSet){
        // This case might occur if localstorage for theme has a value but user profile doesn't
        // We'd typically want the user profile to be the source of truth if it exists
        // Or ensure the form just picks up the current theme's density from local storage if no user pref.
    }
  }, [user, form, currentThemeDensity, setThemeDensity]);


  async function onSubmit(data: AdvancedSettingsFormValues) {
    if (!user) return;
    setIsLoading(true);
    setAnyLoading(true);
    const originalSettings = {
      receiveNotifications: user.receiveNotifications,
      preferredInterfaceDensity: user.preferredInterfaceDensity
    };

    try {
      // Update theme provider immediately
      if (data.interfaceDensity) {
        setThemeDensity(data.interfaceDensity);
      }

      // Update user profile (mock API call)
      const updatedProfileData: Partial<UserProfile> = {
        receiveNotifications: data.receiveNotifications,
        preferredInterfaceDensity: data.interfaceDensity,
      };
      const updatedUserFromApi = await api.updateUserProfile(user.uid, updatedProfileData);


      setUser(updatedUserFromApi); // Update local page state
      updateAuthContextUser(updatedUserFromApi); // Update auth context and its storage

      form.reset(
        {
          receiveNotifications: updatedUserFromApi.receiveNotifications ?? true,
          interfaceDensity: updatedUserFromApi.preferredInterfaceDensity ?? currentThemeDensity
        },
        { keepValues: true, keepDirty: false }
      );


      toast({
        title: 'Settings Saved',
        message: 'Your advanced settings have been updated.',
        variant: 'success',
        action: {
          label: "Undo",
          onClick: async () => {
            if (originalSettings.preferredInterfaceDensity) {
              setThemeDensity(originalSettings.preferredInterfaceDensity);
            }
            const revertedUser = await api.updateUserProfile(user.uid, originalSettings);
            setUser(revertedUser);
            updateAuthContextUser(revertedUser);
            form.reset({
                receiveNotifications: revertedUser.receiveNotifications ?? true,
                interfaceDensity: revertedUser.preferredInterfaceDensity ?? currentThemeDensity
            });
            toast({ message: "Advanced settings changes undone.", variant: "info" });
          }
        }
      });
    } catch (error: any) {
      toast({ title: 'Save Failed', message: error.message || "Could not save advanced settings.", variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setAnyLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings2 className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl md:text-2xl">Advanced Settings</CardTitle>
            <CardDescription>Customize your application experience.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="receiveNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Email Notifications</FormLabel>
                    <FormDescription className="text-xs sm:text-sm">
                      Receive updates and important announcements via email.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading || anyLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interfaceDensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interface Density</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Optionally set theme density immediately on change, or wait for save
                      // setThemeDensity(value as 'compact' | 'comfortable' | 'spacious');
                    }}
                    value={field.value}
                    disabled={isLoading || anyLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interface density" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableInterfaceDensities.map(densityOption => (
                        <SelectItem key={densityOption.value} value={densityOption.value}>
                          {densityOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs sm:text-sm">
                    Adjust the spacing and size of UI elements.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isLoading || anyLoading || !form.formState.isDirty}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Preferences
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
});

AdvancedSettingsForm.displayName = 'AdvancedSettingsForm';

// Need to import projectConfig if it's used for defaultInterfaceDensity fallback in useEffect
import { projectConfig } from '@/config/project.config';
