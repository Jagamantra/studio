
'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import type { ProjectConfigFormValues } from '@/app/(app)/config-advisor/page';
import type { AccentColor, BorderRadiusOption, AppVersion } from '@/types';

interface ProjectConfigFormCardProps {
  projectConfigForm: UseFormReturn<ProjectConfigFormValues>;
  anyLoading: boolean;
  isSavingProjectConfig: boolean;
  isResettingProjectConfig: boolean;
  handleSaveProjectConfig: () => Promise<void>;
  handleResetProjectConfig: () => Promise<void>;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
  appProjectConfigAvailableAppVersions: AppVersion[];
}

export function ProjectConfigFormCard({
  projectConfigForm,
  anyLoading,
  isSavingProjectConfig,
  isResettingProjectConfig,
  handleSaveProjectConfig,
  handleResetProjectConfig,
  availableAccentColors,
  availableBorderRadii,
  appProjectConfigAvailableAppVersions,
}: ProjectConfigFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Project Configuration (project.config.ts)</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Modify your project settings. Changes saved here will apply globally. The AI will analyze the generated file content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...projectConfigForm}>
          <form className="space-y-4">
            <FormField
              control={projectConfigForm.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Name</FormLabel>
                  <FormControl><Input {...field} disabled={anyLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={projectConfigForm.control}
              name="defaultAccentColorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Accent Color</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={anyLoading}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select accent color" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {availableAccentColors.map(color => (
                        <SelectItem key={color.name} value={color.name}>{color.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={projectConfigForm.control}
              name="defaultBorderRadiusName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Border Radius</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={anyLoading}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select border radius" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {availableBorderRadii.map(radius => (
                        <SelectItem key={radius.name} value={radius.name}>{radius.name} ({radius.value})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={projectConfigForm.control}
              name="defaultAppVersionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default App Version</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={anyLoading}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select app version" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {appProjectConfigAvailableAppVersions.map(version => (
                        <SelectItem key={version.id} value={version.id}>{version.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-end space-x-2">
          <Button 
              onClick={handleResetProjectConfig} 
              disabled={anyLoading}
              variant="outline"
              size="sm"
          >
              {isResettingProjectConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Reset Changes
          </Button>
          <Button 
              onClick={handleSaveProjectConfig} 
              disabled={!projectConfigForm.formState.isDirty || anyLoading || isSavingProjectConfig}
              size="sm"
          >
              {isSavingProjectConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save & Apply Project Settings
          </Button>
      </CardFooter>
    </Card>
  );
}
