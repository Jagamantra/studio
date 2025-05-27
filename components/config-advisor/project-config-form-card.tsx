"use client";

import React, { useState, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Save,
  RotateCcw,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  CaseSensitive,
  ZoomIn,
} from "lucide-react";
import type { ProjectConfigFormValues } from "@/app/config-advisor/page";
import type {
  AccentColor,
  BorderRadiusOption,
  AppVersion,
  FontSizeOption,
  ScaleOption,
} from "@/types";
import Image from "next/image";
import { useTheme } from "@/contexts/theme-provider";
import { projectConfig } from "@/config/project.config";
import {
  generateUniqueFileName,
  saveBase64File,
  deleteUploadedFile,
} from "@/lib/file-utils";

interface ProjectConfigFormCardProps {
  projectConfigForm: UseFormReturn<ProjectConfigFormValues>;
  anyLoading: boolean;
  isSavingProjectConfig: boolean;
  isResettingProjectConfig: boolean;
  handleSaveProjectConfig: (data: {
    logo?: string | null;
    favicon?: string | null;
  }) => Promise<void>;
  handleResetProjectConfig: () => Promise<void>;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
  appProjectConfigAvailableAppVersions: AppVersion[];
  appProjectConfigAvailableFontSizes: FontSizeOption[];
  appProjectConfigAvailableScales: ScaleOption[];
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
  appProjectConfigAvailableFontSizes,
  appProjectConfigAvailableScales,
}: ProjectConfigFormCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { appLogoUrl: currentGlobalLogoUrl, appIconPaths } = useTheme();
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    currentGlobalLogoUrl
  );
  const { faviconUrl: currentGlobalFaviconUrl } = useTheme();
  const [selectedFaviconFile, setSelectedFaviconFile] = useState<File | null>(
    null
  );
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | null>(
    currentGlobalFaviconUrl
  );
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLogoPreviewUrl(currentGlobalLogoUrl);
    setFaviconPreviewUrl(currentGlobalFaviconUrl);
  }, [currentGlobalLogoUrl, currentGlobalFaviconUrl]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        projectConfigForm.setError("appLogoUrl" as any, {
          type: "manual",
          message: "File size should not exceed 2MB.",
        });
        return;
      }
      if (!["image/png", "image/jpeg", "image/gif", "image/svg+xml"].includes(file.type)) {
        projectConfigForm.setError("appLogoUrl" as any, {
          type: "manual",
          message: "Invalid file type. Use JPG, GIF, or SVG.",
        });
        return;
      }
      setSelectedLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result as string);
        projectConfigForm.setValue(
          "appLogoUrl" as any,
          reader.result as string,
          { shouldDirty: true }
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSelectedLogoFile(null);
    setLogoPreviewUrl(null);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = "";
    }
    projectConfigForm.setValue("appLogoUrl" as any, null, {
      shouldDirty: true,
    });
  };

  const handleFaviconFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        projectConfigForm.setError("faviconUrl" as any, {
          type: "manual",
          message: "File size should not exceed 2MB.",
        });
        return;
      }
      if (!["image/png", "image/jpeg", "image/gif", "image/svg+xml"].includes(file.type)) {
        projectConfigForm.setError("faviconUrl" as any, {
          type: "manual",
          message: "Invalid file type. Use JPG, GIF, or SVG.",
        });
        return;
      }
      setSelectedFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreviewUrl(reader.result as string);
        projectConfigForm.setValue(
          "faviconUrl" as any,
          reader.result as string,
          { shouldDirty: true }
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFavicon = () => {
    setSelectedFaviconFile(null);
    setFaviconPreviewUrl(null);
    if (faviconFileInputRef.current) {
      faviconFileInputRef.current.value = "";
    }
    projectConfigForm.setValue("faviconUrl" as any, null, {
      shouldDirty: true,
    });
  };
  const onSubmit = projectConfigForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      let logoToSave = values.appLogoUrl;
      let faviconToSave = values.faviconUrl;

      let logoPublicId: string | undefined;
      let faviconPublicId: string | undefined;

      if (selectedLogoFile && logoPreviewUrl) {
        const logoFileName = generateUniqueFileName(selectedLogoFile.name);
        const { filePath: logoPath, publicId: logoId } = await saveBase64File(
          logoPreviewUrl,
          logoFileName
        );
        logoToSave = logoPath;
        logoPublicId = logoId;
      } else if (!selectedLogoFile && logoPreviewUrl === null) {
        logoToSave = undefined;
        logoPublicId = undefined;
      } else {
        logoToSave = currentGlobalLogoUrl;
      }

      if (selectedFaviconFile && faviconPreviewUrl) {
        const faviconFileName = generateUniqueFileName(
          selectedFaviconFile.name
        );
        const { filePath: faviconPath, publicId: favId } = await saveBase64File(
          faviconPreviewUrl,
          faviconFileName
        );
        faviconToSave = faviconPath;
        faviconPublicId = favId;
      } else if (!selectedFaviconFile && faviconPreviewUrl === null) {
        logoPublicId = undefined;
        // faviconToSave = undefined;
        faviconPublicId = undefined;
      } else {
        faviconToSave = currentGlobalFaviconUrl;
      }

      if (logoPublicId) {
        localStorage.setItem("logoPublicId", logoPublicId);
      }
      if (faviconPublicId) {
        localStorage.setItem("faviconPublicId", faviconPublicId);
      }

      await handleSaveProjectConfig({
        ...values,
        logo: logoToSave,
        favicon: faviconToSave,
      });

      setSelectedLogoFile(null);
      setSelectedFaviconFile(null);
    } catch (error) {
      console.error("Error saving project config:", error);
      projectConfigForm.setError("appLogoUrl" as any, {
        type: "manual",
        message: "Error saving logo file.",
      });
      projectConfigForm.setError("faviconUrl" as any, {
        type: "manual",
        message: "Error saving favicon file.",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const onReset = async () => {
    try {
      // Delete any uploaded files if they exist
      const currentFormValues = projectConfigForm.getValues();
      if (currentFormValues.appLogoUrl?.startsWith("/uploads/")) {
        await deleteUploadedFile(currentFormValues.appLogoUrl);
      }
      if (currentFormValues.faviconUrl?.startsWith("/uploads/")) {
        await deleteUploadedFile(currentFormValues.faviconUrl);
      }

      // Reset form and file inputs
      projectConfigForm.reset();
      setSelectedLogoFile(null);
      setSelectedFaviconFile(null);
      setLogoPreviewUrl(projectConfig.appLogoUrl);
      setFaviconPreviewUrl(projectConfig.faviconUrl);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = "";

      await handleResetProjectConfig();
    } catch (error) {
      console.error("Error resetting project config:", error);
    }
  };

  const effectiveLogoUrl = logoPreviewUrl;
  const showSvgFallback =
    !effectiveLogoUrl && appIconPaths && appIconPaths.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">
          Project Configuration (project.config.ts)
        </CardTitle>
        <ShadcnCardDescription className="text-xs sm:text-sm">
          Modify your project settings. Changes saved here will apply globally.
          Analyze the generated file content.
        </ShadcnCardDescription>
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
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex-1">
                <FormField
                  control={projectConfigForm.control}
                  name="appLogoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Logo</FormLabel>
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded border bg-muted flex items-center justify-center overflow-hidden">
                          {effectiveLogoUrl ? (
                            <Image
                              src={effectiveLogoUrl}
                              alt="Logo Preview"
                              layout="fill"
                              objectFit="contain"
                            />
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
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => logoFileInputRef.current?.click()}
                            disabled={anyLoading}
                          >
                            <UploadCloud className="mr-2 h-4 w-4" /> Change Logo
                          </Button>
                          <Input
                            type="file"
                            accept="image/png, image/jpeg, image/gif, image/svg+xml"
                            ref={logoFileInputRef}
                            onChange={handleLogoFileChange}
                            className="hidden"
                            disabled={anyLoading}
                          />
                          {(logoPreviewUrl || selectedLogoFile) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveLogo}
                              disabled={anyLoading}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Remove Logo
                            </Button>
                          )}
                        </div>
                      </div>
                      <FormDescription className="text-xs">
                        Upload a PNG, JPG, GIF, or SVG file (max 2MB).
                      </FormDescription>

                      <FormMessage>
                        {
                          projectConfigForm.formState.errors.appLogoUrl
                            ?.message as string
                        }
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={projectConfigForm.control}
                  name="faviconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon</FormLabel>
                      <div className="flex items-center gap-4">
                        <div className="relative h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
                          {faviconPreviewUrl ? (
                            <Image
                              src={faviconPreviewUrl}
                              alt="Favicon Preview"
                              layout="fill"
                              objectFit="contain"
                            />
                          ) : showSvgFallback ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-6 w-6 text-muted-foreground"
                            >
                              {appIconPaths.map((d, index) => (
                                <path key={index} d={d}></path>
                              ))}
                            </svg>
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => faviconFileInputRef.current?.click()}
                            disabled={anyLoading}
                          >
                            <UploadCloud className="mr-2 h-4 w-4" /> Change
                            Favicon
                          </Button>
                          <Input
                            type="file"
                            accept="image/png, image/jpeg, image/gif, image/svg+xml"
                            ref={faviconFileInputRef}
                            onChange={handleFaviconFileChange}
                            className="hidden"
                            disabled={anyLoading}
                          />
                          {(faviconPreviewUrl || selectedFaviconFile) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFavicon}
                              disabled={anyLoading}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Remove Favicon
                            </Button>
                          )}
                        </div>
                      </div>
                      <FormDescription className="text-xs">
                        Upload a PNG, JPG, GIF, or SVG file (max 2MB).
                      </FormDescription>

                      <FormMessage>
                        {
                          projectConfigForm.formState.errors.faviconUrl
                            ?.message as string
                        }
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={projectConfigForm.control}
              name="defaultAccentColorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Accent Color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={anyLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accent color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAccentColors.map((color) => (
                        <SelectItem key={color.name} value={color.name}>
                          {color.name}
                        </SelectItem>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={anyLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select border radius" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBorderRadii.map((radius) => (
                        <SelectItem key={radius.name} value={radius.name}>
                          {radius.name} ({radius.value})
                        </SelectItem>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={anyLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select app version" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appProjectConfigAvailableAppVersions.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          {version.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={projectConfigForm.control}
              name="defaultFontSizeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <CaseSensitive className="h-4 w-4 text-muted-foreground" />
                    Default Font Size
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={anyLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appProjectConfigAvailableFontSizes.map((size) => (
                        <SelectItem key={size.name} value={size.name}>
                          {size.name} ({size.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={projectConfigForm.control}
              name="defaultScaleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    Default App Scale
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={anyLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select app scale" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appProjectConfigAvailableScales.map((scale) => (
                        <SelectItem key={scale.name} value={scale.name}>
                          {scale.name}
                        </SelectItem>
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
          {isResettingProjectConfig ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Reset Changes
        </Button>
        <Button
          onClick={() => {
            setIsSubmitting(true);
            onSubmit();
          }}
          disabled={
            (!projectConfigForm.formState.isDirty &&
              logoPreviewUrl === currentGlobalLogoUrl &&
              faviconPreviewUrl === currentGlobalFaviconUrl) ||
            anyLoading ||
            isSavingProjectConfig
          }
          size="sm"
          className="w-full sm:w-auto"
        >
          {isSavingProjectConfig ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save & Apply Project Settings
        </Button>
      </CardFooter>
    </Card>
  );
});

ProjectConfigFormCard.displayName = "ProjectConfigFormCard";
