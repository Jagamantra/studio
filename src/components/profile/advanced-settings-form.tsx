
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

const advancedSettingsSchema = z.object({
  receiveNotifications: z.boolean().optional(),
  interfaceDensity: z.enum(['compact', 'comfortable', 'spacious']).optional(),
});

type AdvancedSettingsFormValues = z.infer<typeof advancedSettingsSchema>;

interface AdvancedSettingsFormProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  anyLoading: boolean;
  setAnyLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AdvancedSettingsForm({ user, setUser, anyLoading, setAnyLoading }: AdvancedSettingsFormProps) {
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
    setIsLoading(true);
    setAnyLoading(true);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log("Advanced settings saved:", data); // In a real app, this would be an API call.
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
      form.reset(data, { keepValues: true, keepDirty: false });
      toast({ title: 'Settings Saved', description: 'Your advanced settings have been updated.' });
    } catch (error: any) {
      toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
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
