"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, Info, Ban } from "lucide-react";
import type { AnalyzeConfigInput } from "@/ai/flows/config-advisor";
import { useAuth } from "@/contexts/auth-context"; // Corrected import path
import Link from "next/link";
import { projectConfig as appProjectConfigFromModule } from "@/config/project.config";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-provider";
import {
  placeholderSidebarConfigData,
  placeholderRolesConfigData,
} from "@/data/dummy-data";
import { ProjectConfigFormCard } from "@/components/config-advisor/project-config-form-card";
import { RawConfigInputCard } from "@/components/config-advisor/raw-config-input-card";
import { AISuggestionsDisplay } from "@/components/config-advisor/ai-suggestions-display";
import { useAiConfigAnalysis } from "@/hooks/use-ai-config-analysis";
import { useRouter } from "next/navigation";
import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";
import { PageTitleWithIcon } from "@/components/layout/page-title-with-icon";

const urlOrRelativeSchema = z.string().refine(
  (val) => {
    if (!val) return true; // allow empty
    if (val.startsWith("/")) return true; // allow relative upload path
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid URL for favicon or logo" }
);

const projectConfigFormSchema = z.object({
  appName: z
    .string()
    .min(1, "App name is required.")
    .max(100, "App name cannot exceed 100 characters."),
  appLogoUrl: urlOrRelativeSchema.optional(),
  faviconUrl: urlOrRelativeSchema.optional(),
  defaultAccentColorName: z.string({
    required_error: "Accent color is required.",
  }),
  defaultBorderRadiusName: z.string({
    required_error: "Border radius is required.",
  }),
  defaultAppVersionId: z.string({ required_error: "App version is required." }),
  defaultFontSizeName: z.string({ required_error: "Font size is required." }),
  defaultScaleName: z.string({ required_error: "App scale is required." }),
});

export type ProjectConfigFormValues = z.infer<typeof projectConfigFormSchema>;

interface StoredConfigAdvisorInputs {
  projectConfigFormData?: ProjectConfigFormValues;
  sidebarConfigContent?: string;
  rolesConfigContent?: string;
  logoPublicId?: string | null;
  faviconPublicId?: string | null;
}

export default function ConfigAdvisorPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const {
    appName: currentAppNameFromTheme,
    appLogoUrl: currentLogoUrlFromTheme,
    faviconUrl: currentFaviconUrlFromTheme,
    appIconPaths: currentIconPathsFromTheme,
    accentColor: currentAccentColor,
    borderRadius: currentBorderRadius,
    appVersion: currentAppVersion,
    fontSize: currentFontSize,
    appScale: currentAppScale,
    setAppName,
    setAppLogoUrl,
    setFaviconUrl,
    setAppIconPaths,
    setAccentColor,
    setBorderRadius,
    setAppVersion,
    setFontSize,
    setAppScale,
    availableAccentColors,
    availableBorderRadii,
    availableFontSizes,
    availableScales,
  } = useTheme();

  const {
    suggestions,
    isLoadingAi,
    error: aiError,
    performAnalysis,
    resetAnalysis,
  } = useAiConfigAnalysis();
  const [isAuthorized, setIsAuthorized] = useState(false);

  React.useEffect(() => {
    document.title = `Application Config | ${currentAppNameFromTheme}`;
  }, [currentAppNameFromTheme]);

  const projectConfigForm = useForm<ProjectConfigFormValues>({
    resolver: zodResolver(projectConfigFormSchema),
    defaultValues: {
      appName: currentAppNameFromTheme,
      appLogoUrl: currentLogoUrlFromTheme,
      faviconUrl: currentFaviconUrlFromTheme,
      defaultAccentColorName:
        availableAccentColors.find((c) => c.hslValue === currentAccentColor)
          ?.name || appProjectConfigFromModule.defaultAccentColorName,
      defaultBorderRadiusName:
        availableBorderRadii.find((r) => r.value === currentBorderRadius)
          ?.name || appProjectConfigFromModule.defaultBorderRadiusName,
      defaultAppVersionId: currentAppVersion,
      defaultFontSizeName:
        availableFontSizes.find((f) => f.value === currentFontSize)?.name ||
        appProjectConfigFromModule.defaultFontSizeName,
      defaultScaleName:
        availableScales.find((s) => s.value === currentAppScale)?.name ||
        appProjectConfigFromModule.defaultScaleName,
    },
  });

  const [sidebarConfigContent, setSidebarConfigContent] = useState("");
  const [rolesConfigContent, setRolesConfigContent] = useState("");

  const [isSavingProjectConfig, setIsSavingProjectConfig] = useState(false);
  const [isResettingProjectConfig, setIsResettingProjectConfig] =
    useState(false);
  const [isLoadingExamples, setIsLoadingExamples] = useState(false);
  const [showPlaceholders, setShowPlaceholders] = useState(true);

  useEffect(() => {
    if (!appProjectConfigFromModule.enableApplicationConfig) {
      return;
    }
    if (!authLoading) {
      if (user && user.role === "admin") {
        setIsAuthorized(true);
      } else if (user) {
        // Non-admin user, AuthProvider should handle redirection via useEffect
      } else {
        // No user, AuthProvider should handle redirection
      }
    }
  }, [
    user,
    authLoading,
    router,
    appProjectConfigFromModule.enableApplicationConfig,
  ]);

  useEffect(() => {
    if (!appProjectConfigFromModule.enableApplicationConfig || !isAuthorized)
      return;

    if (typeof window !== "undefined") {
      const storedInputsJSON = localStorage.getItem("configAdvisorInputs");
      if (storedInputsJSON) {
        const storedInputs: StoredConfigAdvisorInputs =
          JSON.parse(storedInputsJSON);
        if (storedInputs.projectConfigFormData) {
          projectConfigForm.reset(storedInputs.projectConfigFormData);
        }
        setSidebarConfigContent(storedInputs.sidebarConfigContent || "");
        setRolesConfigContent(storedInputs.rolesConfigContent || "");

        const projectFormIsDefault =
          JSON.stringify(projectConfigForm.getValues()) ===
          JSON.stringify({
            appName: currentAppNameFromTheme,
            appLogoUrl: currentLogoUrlFromTheme,
            faviconUrl: currentFaviconUrlFromTheme,
            defaultAccentColorName:
              availableAccentColors.find(
                (c) => c.hslValue === currentAccentColor
              )?.name || appProjectConfigFromModule.defaultAccentColorName,
            defaultBorderRadiusName:
              availableBorderRadii.find((r) => r.value === currentBorderRadius)
                ?.name || appProjectConfigFromModule.defaultBorderRadiusName,
            defaultAppVersionId: currentAppVersion,
            defaultFontSizeName:
              availableFontSizes.find((f) => f.value === currentFontSize)
                ?.name || appProjectConfigFromModule.defaultFontSizeName,
            defaultScaleName:
              availableScales.find((s) => s.value === currentAppScale)?.name ||
              appProjectConfigFromModule.defaultScaleName,
          });
        setShowPlaceholders(
          projectFormIsDefault &&
            !storedInputs.sidebarConfigContent &&
            !storedInputs.rolesConfigContent
        );
      } else {
        projectConfigForm.reset({
          appName: currentAppNameFromTheme,
          appLogoUrl: currentLogoUrlFromTheme,
          faviconUrl: currentFaviconUrlFromTheme,
          defaultAccentColorName:
            availableAccentColors.find((c) => c.hslValue === currentAccentColor)
              ?.name || appProjectConfigFromModule.defaultAccentColorName,
          defaultBorderRadiusName:
            availableBorderRadii.find((r) => r.value === currentBorderRadius)
              ?.name || appProjectConfigFromModule.defaultBorderRadiusName,
          defaultAppVersionId: currentAppVersion,
          defaultFontSizeName:
            availableFontSizes.find((f) => f.value === currentFontSize)?.name ||
            appProjectConfigFromModule.defaultFontSizeName,
          defaultScaleName:
            availableScales.find((s) => s.value === currentAppScale)?.name ||
            appProjectConfigFromModule.defaultScaleName,
        });
        setShowPlaceholders(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appProjectConfigFromModule.enableApplicationConfig, isAuthorized]);

  useEffect(() => {
    if (!appProjectConfigFromModule.enableApplicationConfig || !isAuthorized)
      return;
    projectConfigForm.reset({
      appName: currentAppNameFromTheme,
      appLogoUrl: currentLogoUrlFromTheme,
      faviconUrl: currentFaviconUrlFromTheme,
      defaultAccentColorName:
        availableAccentColors.find((c) => c.hslValue === currentAccentColor)
          ?.name || appProjectConfigFromModule.defaultAccentColorName,
      defaultBorderRadiusName:
        availableBorderRadii.find((r) => r.value === currentBorderRadius)
          ?.name || appProjectConfigFromModule.defaultBorderRadiusName,
      defaultAppVersionId: currentAppVersion,
      defaultFontSizeName:
        availableFontSizes.find((f) => f.value === currentFontSize)?.name ||
        appProjectConfigFromModule.defaultFontSizeName,
      defaultScaleName:
        availableScales.find((s) => s.value === currentAppScale)?.name ||
        appProjectConfigFromModule.defaultScaleName,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentAppNameFromTheme,
    currentLogoUrlFromTheme,
    currentFaviconUrlFromTheme,
    currentAccentColor,
    currentBorderRadius,
    currentAppVersion,
    currentFontSize,
    currentAppScale,
    appProjectConfigFromModule.enableApplicationConfig,
    isAuthorized,
  ]);

  const watchedProjectConfig = projectConfigForm.watch();
  useEffect(() => {
    if (!appProjectConfigFromModule.enableApplicationConfig || !isAuthorized)
      return;
    if (typeof window !== "undefined") {
      const currentInputs: StoredConfigAdvisorInputs = {
        projectConfigFormData: watchedProjectConfig,
        sidebarConfigContent,
        rolesConfigContent,
      };
      localStorage.setItem(
        "configAdvisorInputs",
        JSON.stringify(currentInputs)
      );
      const isProjectFormUnchangedFromTheme =
        watchedProjectConfig.appName === currentAppNameFromTheme &&
        watchedProjectConfig.appLogoUrl === currentLogoUrlFromTheme &&
        watchedProjectConfig.faviconUrl === currentFaviconUrlFromTheme &&
        watchedProjectConfig.defaultAccentColorName ===
          (availableAccentColors.find(
            (c) => c.name === watchedProjectConfig.defaultAccentColorName
          )?.hslValue || appProjectConfigFromModule.defaultAccentColorName) &&
        watchedProjectConfig.defaultBorderRadiusName ===
          (availableBorderRadii.find(
            (r) => r.name === watchedProjectConfig.defaultBorderRadiusName
          )?.value || appProjectConfigFromModule.defaultBorderRadiusName) &&
        watchedProjectConfig.defaultAppVersionId === currentAppVersion &&
        watchedProjectConfig.defaultFontSizeName ===
          (availableFontSizes.find(
            (f) => f.name === watchedProjectConfig.defaultFontSizeName
          )?.value || appProjectConfigFromModule.defaultFontSizeName) &&
        watchedProjectConfig.defaultScaleName ===
          (availableScales.find(
            (s) => s.name === watchedProjectConfig.defaultScaleName
          )?.value || appProjectConfigFromModule.defaultScaleName);

      if (
        !isProjectFormUnchangedFromTheme ||
        sidebarConfigContent ||
        rolesConfigContent
      ) {
        setShowPlaceholders(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedProjectConfig,
    sidebarConfigContent,
    rolesConfigContent,
    appProjectConfigFromModule.enableApplicationConfig,
    isAuthorized,
  ]);

  const loadExampleConfigs = async () => {
    setIsLoadingExamples(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    projectConfigForm.reset({
      appName: "Example App",
      appLogoUrl: null,
      faviconUrl: null,
      defaultAccentColorName:
        appProjectConfigFromModule.availableAccentColors[1]?.name ||
        appProjectConfigFromModule.defaultAccentColorName,
      defaultBorderRadiusName:
        appProjectConfigFromModule.availableBorderRadii[1]?.name ||
        appProjectConfigFromModule.defaultBorderRadiusName,
      defaultAppVersionId:
        appProjectConfigFromModule.availableAppVersions[1]?.id ||
        appProjectConfigFromModule.defaultAppVersionId,
      defaultFontSizeName:
        appProjectConfigFromModule.availableFontSizes[0]?.name ||
        appProjectConfigFromModule.defaultFontSizeName,
      defaultScaleName:
        appProjectConfigFromModule.availableScales[0]?.name ||
        appProjectConfigFromModule.defaultScaleName,
    });
    setSidebarConfigContent(placeholderSidebarConfigData);
    setRolesConfigContent(placeholderRolesConfigData);
    setShowPlaceholders(false);
    resetAnalysis();
    setIsLoadingExamples(false);
    toast({
      title: "Example Configurations Loaded",
      message: "You can now analyze these example settings.",
      variant: "info",
    });
  };
  const handleSaveProjectConfig = async (data: {
    logo?: string | null;
    favicon?: string | null;
  }) => {
    console.log("Saving project config with data:", data);

    setIsSavingProjectConfig(true);
    try {
      const projectConfigValues = projectConfigForm.getValues();

      // Handle logo updates
      const effectiveLogoUrl =
        data.logo === null
          ? projectConfigValues.appLogoUrl
          : data.logo ?? projectConfigValues.appLogoUrl;

      if (effectiveLogoUrl) {
        setAppLogoUrl(effectiveLogoUrl);
        projectConfigValues.appLogoUrl = effectiveLogoUrl;
      }

      // Handle favicon updates
      const effectiveFaviconUrl =
        data.favicon === null
          ? projectConfigValues.faviconUrl
          : data.favicon ?? projectConfigValues.faviconUrl;

      if (effectiveFaviconUrl) {
        setFaviconUrl(effectiveFaviconUrl);
        projectConfigValues.faviconUrl = effectiveFaviconUrl;
      }

      // Save form data to local storage
      const storedData: StoredConfigAdvisorInputs = {
        projectConfigFormData: projectConfigValues,
        sidebarConfigContent,
        rolesConfigContent,
      };
      localStorage.setItem("configAdvisorInputs", JSON.stringify(storedData));

      // Update theme values
      setAppName(projectConfigValues.appName);
      const selectedAccentColor = availableAccentColors.find(
        (c) => c.name === projectConfigValues.defaultAccentColorName
      );
      const selectedBorderRadius = availableBorderRadii.find(
        (r) => r.name === projectConfigValues.defaultBorderRadiusName
      );
      const selectedFontSize = availableFontSizes.find(
        (f) => f.name === projectConfigValues.defaultFontSizeName
      );
      const selectedScale = availableScales.find(
        (s) => s.name === projectConfigValues.defaultScaleName
      );

      if (selectedAccentColor) setAccentColor(selectedAccentColor.hslValue);
      if (selectedBorderRadius) setBorderRadius(selectedBorderRadius.value);
      setAppVersion(projectConfigValues.defaultAppVersionId);
      if (selectedFontSize) setFontSize(selectedFontSize.value);
      if (selectedScale) setAppScale(selectedScale.value);

      toast({
        message: "Project configuration saved successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving project config:", error);
      toast({
        message: "Failed to save project configuration.",
        type: "error",
      });
    } finally {
      setIsSavingProjectConfig(false);
    }
  };

const handleResetProjectConfig = async () => {
  setIsResettingProjectConfig(true);
  try {
   // Retrieve public IDs from their own keys
    const logoPublicId = localStorage.getItem("logoPublicId");
    const faviconPublicId = localStorage.getItem("faviconPublicId");

    const idsToDelete = [logoPublicId, faviconPublicId].filter(Boolean);

    if (idsToDelete.length) {
      await fetch("/api/delete-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_ids: idsToDelete }),
      });
    }
    const defaults = appProjectConfigFromModule;
    projectConfigForm.reset({
      appName: defaults.appName,
      appLogoUrl: defaults.appLogoUrl ?? null,
      faviconUrl: defaults.faviconUrl ?? null,
      defaultAccentColorName: defaults.defaultAccentColorName,
      defaultBorderRadiusName: defaults.defaultBorderRadiusName,
      defaultAppVersionId: defaults.defaultAppVersionId,
      defaultFontSizeName: defaults.defaultFontSizeName,
      defaultScaleName: defaults.defaultScaleName,
    });

    setAppName(defaults.appName);
    setAppLogoUrl(defaults.appLogoUrl ?? null);
    setFaviconUrl(defaults.faviconUrl ?? null);
    setAccentColor(availableAccentColors.find(c => c.name === defaults.defaultAccentColorName)?.hslValue ?? "");
    setBorderRadius(availableBorderRadii.find(r => r.name === defaults.defaultBorderRadiusName)?.value ?? 8);
    setFontSize(availableFontSizes.find(f => f.name === defaults.defaultFontSizeName)?.value ?? 14);
    setAppScale(availableScales.find(s => s.name === defaults.defaultScaleName)?.value ?? 1);

    localStorage.removeItem("configAdvisorInputs");
    localStorage.removeItem("logoPublicId");
    localStorage.removeItem("faviconPublicId");

    toast({ message: "Project configuration reset to defaults.", type: "success" });
  } catch (error) {
    console.error("Error resetting project config:", error);
    toast({ message: "Failed to reset project configuration.", type: "error" });
  } finally {
    setIsResettingProjectConfig(false);
  }
};


  const handleAnalyzeSubmit = async () => {
    const projectConfigData = projectConfigForm.getValues();
    const generatedProjectConfigContent = `
// project.config.ts
export const projectConfig = {
  appName: '${projectConfigData.appName}',
  appIconPaths: ${JSON.stringify(
    currentIconPathsFromTheme || appProjectConfigFromModule.appIconPaths,
    null,
    2
  )},
  faviconUrl: ${
    projectConfigData.faviconUrl ? `'${projectConfigData.faviconUrl}'` : null
  },
  appLogoUrl: ${
    projectConfigData.appLogoUrl ? `'${projectConfigData.appLogoUrl}'` : null
  },
  availableAccentColors: ${JSON.stringify(
    appProjectConfigFromModule.availableAccentColors,
    null,
    2
  )},
  defaultAccentColorName: '${projectConfigData.defaultAccentColorName}',
  availableBorderRadii: ${JSON.stringify(
    appProjectConfigFromModule.availableBorderRadii,
    null,
    2
  )},
  defaultBorderRadiusName: '${projectConfigData.defaultBorderRadiusName}',
  availableAppVersions: ${JSON.stringify(
    appProjectConfigFromModule.availableAppVersions,
    null,
    2
  )},
  defaultAppVersionId: '${projectConfigData.defaultAppVersionId}',
  availableFontSizes: ${JSON.stringify(
    appProjectConfigFromModule.availableFontSizes,
    null,
    2
  )},
  defaultFontSizeName: '${projectConfigData.defaultFontSizeName}',
  availableScales: ${JSON.stringify(
    appProjectConfigFromModule.availableScales,
    null,
    2
  )},
  defaultScaleName: '${projectConfigData.defaultScaleName}',
  enableApplicationConfig: ${
    appProjectConfigFromModule.enableApplicationConfig ?? true
  },
  mockApiMode: ${appProjectConfigFromModule.mockApiMode ?? true}
};`.trim();

    const input: AnalyzeConfigInput = {
      projectConfig: generatedProjectConfigContent,
      sidebarConfig: sidebarConfigContent,
      rolesConfig: rolesConfigContent,
    };

    await performAnalysis(input);
  };

  if (
    authLoading ||
    (!isAuthorized &&
      appProjectConfigFromModule.enableApplicationConfig &&
      user &&
      user.role !== "admin")
  ) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthenticatedPageLayout>
    );
  }

  if (!appProjectConfigFromModule.enableApplicationConfig) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-8 text-center">
          <Ban className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
          <h1 className="text-xl md:text-2xl font-bold">Feature Disabled</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            The Application Config feature is currently disabled by the
            administrator.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </AuthenticatedPageLayout>
    );
  }

  if (!isAuthorized && appProjectConfigFromModule.enableApplicationConfig) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Verifying authorization...</p>
        </div>
      </AuthenticatedPageLayout>
    );
  }

  const anyLoading =
    isLoadingAi ||
    isSavingProjectConfig ||
    isResettingProjectConfig ||
    isLoadingExamples;

  return (
    <AuthenticatedPageLayout>
      <div className="space-y-4 md:space-y-6 min-w-0">
        {/* <PageTitleWithIcon title="Application Config"> */}
        <div className="flex gap-2">
          <Button
            onClick={loadExampleConfigs}
            disabled={anyLoading}
            variant="outline"
            size="sm"
          >
            {isLoadingExamples ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Info className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Load Examples</span>
            <span className="sm:hidden">Examples</span>
          </Button>
          <Button onClick={handleAnalyzeSubmit} disabled={anyLoading} size="sm">
            {isLoadingAi ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Setup Configurations</span>
            <span className="sm:hidden">Setup</span>
          </Button>
        </div>
        {/* </PageTitleWithIcon> */}

        <ProjectConfigFormCard
          projectConfigForm={projectConfigForm}
          anyLoading={anyLoading}
          isSavingProjectConfig={isSavingProjectConfig}
          isResettingProjectConfig={isResettingProjectConfig}
          handleSaveProjectConfig={handleSaveProjectConfig}
          handleResetProjectConfig={handleResetProjectConfig}
          availableAccentColors={availableAccentColors}
          availableBorderRadii={availableBorderRadii}
          appProjectConfigAvailableAppVersions={
            appProjectConfigFromModule.availableAppVersions
          }
          appProjectConfigAvailableFontSizes={
            appProjectConfigFromModule.availableFontSizes
          }
          appProjectConfigAvailableScales={
            appProjectConfigFromModule.availableScales
          }
        />
        {/* 
        <RawConfigInputCard
          sidebarConfigContent={sidebarConfigContent}
          handleSidebarChange={(value) => {
            setSidebarConfigContent(value);
            if (value.trim() !== "") setShowPlaceholders(false);
            resetAnalysis();
          }}
          rolesConfigContent={rolesConfigContent}
          handleRolesChange={(value) => {
            setRolesConfigContent(value);
            if (value.trim() !== "") setShowPlaceholders(false);
            resetAnalysis();
          }}
          showPlaceholders={showPlaceholders}
          placeholderSidebarConfigData={placeholderSidebarConfigData}
          placeholderRolesConfigData={placeholderRolesConfigData}
          anyLoading={anyLoading}
        /> */}

        <AISuggestionsDisplay
          suggestions={suggestions}
          isLoadingAi={isLoadingAi}
          error={aiError}
        />
      </div>
    </AuthenticatedPageLayout>
  );
}
