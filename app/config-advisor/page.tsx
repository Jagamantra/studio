
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, Info, Ban } from 'lucide-react';
import type { AnalyzeConfigInput } from '@/ai/flows/config-advisor';
import { useAuth } from '@/contexts/auth-provider';
import Link from 'next/link';
import { projectConfig as appProjectConfig } from '@/config/project.config';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/theme-provider';
import { placeholderSidebarConfigData, placeholderRolesConfigData } from '@/data/dummy-data';
import { ProjectConfigFormCard } from '@/components/config-advisor/project-config-form-card';
import { RawConfigInputCard } from '@/components/config-advisor/raw-config-input-card';
import { AISuggestionsDisplay } from '@/components/config-advisor/ai-suggestions-display';
import { useAiConfigAnalysis } from '@/hooks/use-ai-config-analysis';
import { useRouter } from 'next/navigation';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';

const projectConfigFormSchema = z.object({
  appName: z.string().min(1, 'App name is required.').max(100, 'App name cannot exceed 100 characters.'),
  defaultAccentColorName: z.string({required_error: "Accent color is required."}),
  defaultBorderRadiusName: z.string({required_error: "Border radius is required."}),
  defaultAppVersionId: z.string({required_error: "App version is required."}),
});

export type ProjectConfigFormValues = z.infer<typeof projectConfigFormSchema>;

interface StoredConfigAdvisorInputs {
    projectConfigFormData?: ProjectConfigFormValues;
    sidebarConfigContent?: string;
    rolesConfigContent?: string;
}

export default function ConfigAdvisorPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const {
    appName: currentAppNameFromTheme, 
    accentColor: currentAccentColor,
    borderRadius: currentBorderRadius,
    appVersion: currentAppVersion,
    setAppName,
    setAccentColor,
    setBorderRadius,
    setAppVersion,
    availableAccentColors,
    availableBorderRadii,
  } = useTheme();

  const { suggestions, isLoadingAi, error: aiError, performAnalysis, resetAnalysis } = useAiConfigAnalysis();
  const [isAuthorized, setIsAuthorized] = useState(false);

  React.useEffect(() => {
    // Set document title dynamically
    document.title = `Application Config | ${currentAppNameFromTheme}`;
  }, [currentAppNameFromTheme]);

  const projectConfigForm = useForm<ProjectConfigFormValues>({
    resolver: zodResolver(projectConfigFormSchema),
    defaultValues: {
      appName: currentAppNameFromTheme,
      defaultAccentColorName: availableAccentColors.find(c => c.hslValue === currentAccentColor)?.name || appProjectConfig.defaultAccentColorName,
      defaultBorderRadiusName: availableBorderRadii.find(r => r.value === currentBorderRadius)?.name || appProjectConfig.defaultBorderRadiusName,
      defaultAppVersionId: currentAppVersion,
    },
  });

  const [sidebarConfigContent, setSidebarConfigContent] = useState('');
  const [rolesConfigContent, setRolesConfigContent] = useState('');

  const [isSavingProjectConfig, setIsSavingProjectConfig] = useState(false);
  const [isResettingProjectConfig, setIsResettingProjectConfig] = useState(false);
  const [isLoadingExamples, setIsLoadingExamples] = useState(false);
  const [showPlaceholders, setShowPlaceholders] = useState(true);

  useEffect(() => {
    if (!appProjectConfig.enableApplicationConfig) { // Updated to use enableApplicationConfig
      return;
    }
    if (!authLoading) {
      if (user && user.role === 'admin') {
        setIsAuthorized(true);
      } else if (user) { 
      } else { 
      }
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    if (!appProjectConfig.enableApplicationConfig || !isAuthorized) return; // Updated to use enableApplicationConfig

    if (typeof window !== 'undefined') {
        const storedInputsJSON = localStorage.getItem('configAdvisorInputs');
        if (storedInputsJSON) {
            const storedInputs: StoredConfigAdvisorInputs = JSON.parse(storedInputsJSON);
            if (storedInputs.projectConfigFormData) {
                projectConfigForm.reset(storedInputs.projectConfigFormData);
            }
            setSidebarConfigContent(storedInputs.sidebarConfigContent || '');
            setRolesConfigContent(storedInputs.rolesConfigContent || '');

            const projectFormIsDefault = JSON.stringify(projectConfigForm.getValues()) === JSON.stringify({
              appName: currentAppNameFromTheme,
              defaultAccentColorName: availableAccentColors.find(c => c.hslValue === currentAccentColor)?.name || appProjectConfig.defaultAccentColorName,
              defaultBorderRadiusName: availableBorderRadii.find(r => r.value === currentBorderRadius)?.name || appProjectConfig.defaultBorderRadiusName,
              defaultAppVersionId: currentAppVersion,
            });
            setShowPlaceholders(
              projectFormIsDefault &&
              !storedInputs.sidebarConfigContent &&
              !storedInputs.rolesConfigContent
            );
        } else {
          projectConfigForm.reset({
            appName: currentAppNameFromTheme,
            defaultAccentColorName: availableAccentColors.find(c => c.hslValue === currentAccentColor)?.name || appProjectConfig.defaultAccentColorName,
            defaultBorderRadiusName: availableBorderRadii.find(r => r.value === currentBorderRadius)?.name || appProjectConfig.defaultBorderRadiusName,
            defaultAppVersionId: currentAppVersion,
          });
          setShowPlaceholders(true);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appProjectConfig.enableApplicationConfig, isAuthorized, currentAppNameFromTheme, currentAccentColor, currentBorderRadius, currentAppVersion]);

  useEffect(() => {
    if (!appProjectConfig.enableApplicationConfig || !isAuthorized) return; // Updated to use enableApplicationConfig
    projectConfigForm.reset({
      appName: currentAppNameFromTheme,
      defaultAccentColorName: availableAccentColors.find(c => c.hslValue === currentAccentColor)?.name || appProjectConfig.defaultAccentColorName,
      defaultBorderRadiusName: availableBorderRadii.find(r => r.value === currentBorderRadius)?.name || appProjectConfig.defaultBorderRadiusName,
      defaultAppVersionId: currentAppVersion,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAppNameFromTheme, currentAccentColor, currentBorderRadius, currentAppVersion, appProjectConfig.enableApplicationConfig, isAuthorized]);

  const watchedProjectConfig = projectConfigForm.watch();
  useEffect(() => {
    if (!appProjectConfig.enableApplicationConfig || !isAuthorized) return; // Updated to use enableApplicationConfig
    if (typeof window !== 'undefined') {
        const currentInputs: StoredConfigAdvisorInputs = {
            projectConfigFormData: watchedProjectConfig,
            sidebarConfigContent,
            rolesConfigContent,
        };
        localStorage.setItem('configAdvisorInputs', JSON.stringify(currentInputs));

        const isProjectFormUnchangedFromTheme =
             watchedProjectConfig.appName === currentAppNameFromTheme &&
             watchedProjectConfig.defaultAccentColorName === (availableAccentColors.find(c => c.hslValue === currentAccentColor)?.name || appProjectConfig.defaultAccentColorName) &&
             watchedProjectConfig.defaultBorderRadiusName === (availableBorderRadii.find(r => r.value === currentBorderRadius)?.name || appProjectConfig.defaultBorderRadiusName) &&
             watchedProjectConfig.defaultAppVersionId === currentAppVersion;

        if (!isProjectFormUnchangedFromTheme || sidebarConfigContent || rolesConfigContent) {
            setShowPlaceholders(false);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedProjectConfig, sidebarConfigContent, rolesConfigContent, currentAppNameFromTheme, currentAccentColor, currentBorderRadius, currentAppVersion, appProjectConfig.enableApplicationConfig, isAuthorized]);

  const loadExampleConfigs = async () => {
    setIsLoadingExamples(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    projectConfigForm.reset({
      appName: "Example App",
      defaultAccentColorName: appProjectConfig.availableAccentColors[1]?.name || appProjectConfig.defaultAccentColorName,
      defaultBorderRadiusName: appProjectConfig.availableBorderRadii[1]?.name || appProjectConfig.defaultBorderRadiusName,
      defaultAppVersionId: appProjectConfig.availableAppVersions[1]?.id || appProjectConfig.defaultAppVersionId,
    });
    setSidebarConfigContent(placeholderSidebarConfigData);
    setRolesConfigContent(placeholderRolesConfigData);
    setShowPlaceholders(false);
    resetAnalysis();
    setIsLoadingExamples(false);
    toast({
      title: 'Example Configurations Loaded',
      message: 'You can now analyze these example settings.',
      variant: 'info',
    });
  };

  const handleSaveProjectConfig = async () => {
    setIsSavingProjectConfig(true);
    const isValid = await projectConfigForm.trigger();
    if (isValid) {
      const projectConfigValues = projectConfigForm.getValues();
      await new Promise(resolve => setTimeout(resolve, 500));

      setAppName(projectConfigValues.appName);
      const selectedAccent = availableAccentColors.find(c => c.name === projectConfigValues.defaultAccentColorName);
      if (selectedAccent) setAccentColor(selectedAccent.hslValue);
      const selectedRadius = availableBorderRadii.find(r => r.name === projectConfigValues.defaultBorderRadiusName);
      if (selectedRadius) setBorderRadius(selectedRadius.value);
      setAppVersion(projectConfigValues.defaultAppVersionId);

      projectConfigForm.reset(projectConfigValues, { keepValues: true, keepDirty: false });

      toast({
        title: 'Project Configuration Applied',
        message: 'Your project settings have been applied and saved locally.',
        variant: 'success',
      });
    } else {
      toast({
        title: 'Validation Error',
        message: 'Please correct the errors in the project configuration form.',
        variant: 'destructive',
      });
    }
    setIsSavingProjectConfig(false);
  };

  const handleResetProjectConfig = async () => {
    setIsResettingProjectConfig(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const originalAppName = appProjectConfig.appName;
    const originalAccentColorName = appProjectConfig.defaultAccentColorName;
    const originalAccentHsl = availableAccentColors.find(c => c.name === originalAccentColorName)?.hslValue ||
                              (appProjectConfig.availableAccentColors.find(ac => ac.name === appProjectConfig.defaultAccentColorName)?.hslValue || appProjectConfig.availableAccentColors[0]?.hslValue);
    const originalBorderRadiusName = appProjectConfig.defaultBorderRadiusName;
    const originalBorderRadiusValue = availableBorderRadii.find(r => r.name === originalBorderRadiusName)?.value ||
                                      (appProjectConfig.availableBorderRadii.find(br => br.name === appProjectConfig.defaultBorderRadiusName)?.value || appProjectConfig.availableBorderRadii[0]?.value);
    const originalAppVersionId = appProjectConfig.defaultAppVersionId;

    setAppName(originalAppName);
    if(originalAccentHsl) setAccentColor(originalAccentHsl);
    if(originalBorderRadiusValue) setBorderRadius(originalBorderRadiusValue);
    setAppVersion(originalAppVersionId);

    projectConfigForm.reset({
      appName: originalAppName,
      defaultAccentColorName: originalAccentColorName,
      defaultBorderRadiusName: originalBorderRadiusName,
      defaultAppVersionId: originalAppVersionId,
    });
    setIsResettingProjectConfig(false);
    toast({
      title: 'Project Configuration Reset',
      message: 'Project settings have been reset to their original defaults and applied application-wide.',
      variant: 'info',
    });
  };

  const handleAnalyzeSubmit = async () => {
    const projectConfigData = projectConfigForm.getValues();
    const generatedProjectConfigContent = `
// project.config.ts
export const projectConfig = {
  appName: '${projectConfigData.appName}',
  appIconPaths: ${JSON.stringify(appProjectConfig.appIconPaths, null, 2)},
  availableAccentColors: ${JSON.stringify(appProjectConfig.availableAccentColors, null, 2)},
  defaultAccentColorName: '${projectConfigData.defaultAccentColorName}',
  availableBorderRadii: ${JSON.stringify(appProjectConfig.availableBorderRadii, null, 2)},
  defaultBorderRadiusName: '${projectConfigData.defaultBorderRadiusName}',
  availableAppVersions: ${JSON.stringify(appProjectConfig.availableAppVersions, null, 2)},
  defaultAppVersionId: '${projectConfigData.defaultAppVersionId}',
  enableApplicationConfig: ${appProjectConfig.enableApplicationConfig ?? true} // Updated key
};`.trim();

    const input: AnalyzeConfigInput = {
      projectConfig: generatedProjectConfigContent,
      sidebarConfig: sidebarConfigContent,
      rolesConfig: rolesConfigContent,
    };

    await performAnalysis(input);
  };

  if (authLoading || (!isAuthorized && appProjectConfig.enableApplicationConfig && user && user.role !== 'admin')) { // Updated to use enableApplicationConfig
    return <AuthenticatedPageLayout><div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AuthenticatedPageLayout>;
  }

  if (!appProjectConfig.enableApplicationConfig) { // Updated to use enableApplicationConfig
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-8 text-center">
          <Ban className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
          <h1 className="text-xl md:text-2xl font-bold">Feature Disabled</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            The Application Config feature is currently disabled by the administrator.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </AuthenticatedPageLayout>
    );
  }

  if (!isAuthorized && appProjectConfig.enableApplicationConfig) {  // Updated to use enableApplicationConfig
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Verifying authorization...</p>
        </div>
      </AuthenticatedPageLayout>
    );
  }


  const anyLoading = isLoadingAi || isSavingProjectConfig || isResettingProjectConfig || isLoadingExamples;

  return (
    <AuthenticatedPageLayout>
      <div className="space-y-4 md:space-y-6 min-w-0">
        <PageTitleWithIcon title="Application Config"> {/* Changed title */}
          <div className="flex gap-2">
            <Button onClick={loadExampleConfigs} disabled={anyLoading} variant="outline" size="sm">
              {isLoadingExamples ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Info className="mr-2 h-4 w-4" />}
              <span className="hidden sm:inline">Load Examples</span>
              <span className="sm:hidden">Examples</span>
            </Button>
            <Button onClick={handleAnalyzeSubmit} disabled={anyLoading} size="sm">
              {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              <span className="hidden sm:inline">Analyze Configurations</span>
              <span className="sm:hidden">Analyze</span>
            </Button>
          </div>
        </PageTitleWithIcon>

        <ProjectConfigFormCard
          projectConfigForm={projectConfigForm}
          anyLoading={anyLoading}
          isSavingProjectConfig={isSavingProjectConfig}
          isResettingProjectConfig={isResettingProjectConfig}
          handleSaveProjectConfig={handleSaveProjectConfig}
          handleResetProjectConfig={handleResetProjectConfig}
          availableAccentColors={availableAccentColors}
          availableBorderRadii={availableBorderRadii}
          appProjectConfigAvailableAppVersions={appProjectConfig.availableAppVersions}
        />

        <RawConfigInputCard
          sidebarConfigContent={sidebarConfigContent}
          handleSidebarChange={(value) => { setSidebarConfigContent(value); if(value.trim()!=='') setShowPlaceholders(false); resetAnalysis(); }}
          rolesConfigContent={rolesConfigContent}
          handleRolesChange={(value) => { setRolesConfigContent(value); if(value.trim()!=='') setShowPlaceholders(false); resetAnalysis(); }}
          showPlaceholders={showPlaceholders}
          placeholderSidebarConfigData={placeholderSidebarConfigData}
          placeholderRolesConfigData={placeholderRolesConfigData}
          anyLoading={anyLoading}
        />

        <AISuggestionsDisplay
          suggestions={suggestions}
          isLoadingAi={isLoadingAi}
          error={aiError}
        />
      </div>
    </AuthenticatedPageLayout>
  );
}

