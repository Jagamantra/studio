
'use client';

import React, { useState, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw, UploadCloud, Trash2, Image as ImageIcon } from 'lucide-react';
import type { ProjectConfigFormValues } from '@/app/config-advisor/page';
import type { AccentColor, BorderRadiusOption, AppVersion } from '@/types';
import Image from 'next/image';
import { useTheme } from '@/contexts/theme-provider';

interface ProjectConfigFormCardProps {
  projectConfigForm: UseFormReturn<ProjectConfigFormValues>;
  anyLoading: boolean;
  isSavingProjectConfig: boolean;
  isResettingProjectConfig: boolean;
  handleSaveProjectConfig: (logoDataUrl?: string | null) => Promise<void>;
  handleResetProjectConfig: () => Promise<void>;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
  appProjectConfigAvailableAppVersions: AppVersion[];
}

export const ProjectConfigFormCard = React.memo(function ProjectConfigFormCard({
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
  const { appLogoUrl: currentGlobalLogoUrl, appIconPaths } = useTheme();
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(currentGlobalLogoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLogoPreviewUrl(currentGlobalLogoUrl); // Sync with global state
  }, [currentGlobalLogoUrl]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        projectConfigForm.setError('appLogoUrl' as any, { type: 'manual', message: 'File size should not exceed 5MB.' });
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'].includes(file.type)) {
        projectConfigForm.setError('appLogoUrl' as any, { type: 'manual', message: 'Invalid file type. Use PNG, JPG, GIF, or SVG.' });
        return;
      }
      setSelectedLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result as string);
        projectConfigForm.setValue('appLogoUrl' as any, reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSelectedLogoFile(null);
    setLogoPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    projectConfigForm.setValue('appLogoUrl' as any, null, { shouldDirty: true }); // Mark form as dirty
  };

  const onSave = async () => {
    if (selectedLogoFile && logoPreviewUrl) {
      await handleSaveProjectConfig(logoPreviewUrl);
    } else if (logoPreviewUrl === null && currentGlobalLogoUrl !== null) { // Logo was removed
      await handleSaveProjectConfig(null);
    }
    else {
      await handleSaveProjectConfig(); // No change to logo, or logo was already null
    }
    setSelectedLogoFile(null); // Reset after save
  };
  
  const onReset = async () => {
    await handleResetProjectConfig();
    setSelectedLogoFile(null);
    setLogoPreviewUrl(projectConfig.appLogoUrl || null); // Reset preview to original config default
     if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const effectiveLogoUrl = logoPreviewUrl;
  const showSvgFallback = !effectiveLogoUrl && appIconPaths && appIconPaths.length > 0;


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
                  <FormControl>
                    <Input {...field} disabled={anyLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>App Logo</FormLabel>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded border bg-muted flex items-center justify-center overflow-hidden">
                  {effectiveLogoUrl ? (
                    <Image src={effectiveLogoUrl} alt="Logo Preview" layout="fill" objectFit="contain" />
                  ) : showSvgFallback ? (
                     <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-10 w-10 text-muted-foreground"
                      >
                        {appIconPaths.map((d, index) => (
                          <path key={index} d={d}></path>
                        ))}
                      </svg>
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={anyLoading}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Change Logo
                  </Button>
                  <Input
                    id="appLogoUrl"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/svg+xml"
                    onChange={handleLogoFileChange}
                    disabled={anyLoading}
                  />
                  { (logoPreviewUrl || selectedLogoFile) && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo} disabled={anyLoading} className="text-destructive hover:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Logo
                    </Button>
                  )}
                </div>
              </div>
              <FormDescription className="text-xs">Upload a PNG, JPG, GIF, or SVG file (max 5MB).</FormDescription>
              <FormMessage>{projectConfigForm.formState.errors.appLogoUrl?.message as string}</FormMessage>
            </FormItem>

            <FormField
              control={projectConfigForm.control}
              name="defaultAccentColorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Accent Color</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={anyLoading}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select accent color" /></SelectTrigger>
                    </FormControl>
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
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select border radius" /></SelectTrigger>
                    </FormControl>
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
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select app version" /></SelectTrigger>
                    </FormControl>
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
      <CardFooter className="border-t px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0">
          <Button 
              onClick={onReset}
              disabled={anyLoading}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
          >
              {isResettingProjectConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Reset Changes
          </Button>
          <Button 
              onClick={onSave}
              disabled={!projectConfigForm.formState.isDirty && !selectedLogoFile && logoPreviewUrl === currentGlobalLogoUrl || anyLoading || isSavingProjectConfig}
              size="sm"
              className="w-full sm:w-auto"
          >
              {isSavingProjectConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save & Apply Project Settings
          </Button>
      </CardFooter>
    </Card>
  );
});

ProjectConfigFormCard.displayName = 'ProjectConfigFormCard';
