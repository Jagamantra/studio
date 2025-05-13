'use client';

import * as React from 'react';
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
import * as api from '@/services/api'; // Import API service

const advancedSettingsSchema = z.object({
  receiveNotifications: z.boolean().optional(),
  interfaceDensity: z.enum(['compact', 'comfortable', 'spacious']).optional(),
});

type AdvancedSettingsFormValues = z.infer<typeof advancedSettingsSchema>;

interface AdvancedSettingsFormProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateAuthContextUser: (updatedProfile: Partial<UserProfile>) => void; // New prop
  anyLoading: boolean;
  setAnyLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AdvancedSettingsForm({ user, setUser, updateAuthContextUser, anyLoading, setAnyLoading }: AdvancedSettingsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<AdvancedSettingsFormValues>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: {
      receiveNotifications: user?.receiveNotifications ?? true,
      interfaceDensity: user?.interfaceDensity ?? 'comfortable',
    },
  });

  React.useEffect(() => {
    form.reset({
      receiveNotifications: user.receiveNotifications ?? true,
      interfaceDensity: user.interfaceDensity ?? 'comfortable',
    });
  }, [user, form]);

  async function onSubmit(data: AdvancedSettingsFormValues) {
    if(!user) return;
    setIsLoading(true);
    setAnyLoading(true);
    const originalSettings = { 
      receiveNotifications: user.receiveNotifications, 
      interfaceDensity: user.interfaceDensity 
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, you would call:
      // const updatedUserFromApi = await api.updateUserSettings(user.uid, data);
      // For mock, just merge data
      const updatedUser = { ...user, ...data };

      console.log("Advanced settings saved (mocked):", data); 
      
      setUser(updatedUser); // Update local page state
      updateAuthContextUser(updatedUser); // Update AuthContext state

      form.reset(data, { keepValues: true, keepDirty: false });
      toast({ 
        title: 'Settings Saved', 
        message: 'Your advanced settings have been updated.',
        variant: 'success',
        action: {
          label: "Undo",
          onClick: async () => {
            // Simulate reverting
            const revertedUser = { ...user, ...originalSettings };
            setUser(revertedUser);
            updateAuthContextUser(revertedUser);
            form.reset(originalSettings);
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || anyLoading}>
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
                  <FormDescription className="text-xs sm:text-sm">
                    Adjust the spacing and size of UI elements. (This is a conceptual setting)
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
}
