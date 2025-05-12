
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ShieldQuestion, Lightbulb, AlertTriangle, FileText, Info, Save } from 'lucide-react';
import { analyzeConfig, type AnalyzeConfigInput, type AnalyzeConfigOutput } from '@/ai/flows/config-advisor';
import { useAuth } from '@/contexts/auth-provider';
import Link from 'next/link';
import { projectConfig as appProjectConfig } from '@/config/project.config'; // Import actual config for defaults and options
import { useToast } from '@/hooks/use-toast';

// Placeholder content for textareas
const placeholderSidebarConfig = `
// sidebar.config.ts
// import { User, Settings } from 'lucide-react';
export const sidebarConfig = {
  items: [
    { id: 'dashboard', label: 'Home', href: '/dashboard', /*icon: Home,*/ roles: ['admin', 'user'] },
    // Example: Add a new item for admins
    // { id: 'admin-tools', label: 'Admin Tools', href: '/admin/tools', icon: Settings, roles: ['admin'] },
  ],
};
`.trim();

const placeholderRolesConfig = `
// roles.config.ts
export const rolesConfig = {
  roles: ['admin', 'user', 'editor', 'guest'], // Added 'editor'
  routePermissions: {
    '/dashboard': ['admin', 'user', 'editor'],
    '/admin': ['admin'], // New rule for an /admin section
    // '/posts/edit': ['admin', 'editor'], // Example for content editing
  },
  defaultRole: 'user',
};
`.trim();

const projectConfigFormSchema = z.object({
  appName: z.string().min(1, 'App name is required.'),
  defaultAccentColorName: z.string(),
  defaultBorderRadiusName: z.string(),
  defaultAppVersionId: z.string(),
});

type ProjectConfigFormValues = z.infer<typeof projectConfigFormSchema>;

interface StoredConfigAdvisorInputs {
    projectConfigFormData?: ProjectConfigFormValues;
    sidebarConfigContent?: string;
    rolesConfigContent?: string;
}

export default function ConfigAdvisorPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const projectConfigForm = useForm<ProjectConfigFormValues>({
    resolver: zodResolver(projectConfigFormSchema),
    defaultValues: {
      appName: appProjectConfig.appName,
      defaultAccentColorName: appProjectConfig.defaultAccentColorName,
      defaultBorderRadiusName: appProjectConfig.defaultBorderRadiusName,
      defaultAppVersionId: appProjectConfig.defaultAppVersionId,
    },
  });

  const [sidebarConfigContent, setSidebarConfigContent] = useState('');
  const [rolesConfigContent, setRolesConfigContent] = useState('');
  
  const [suggestions, setSuggestions] = useState<AnalyzeConfigOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For AI analysis loading
  const [error, setError] = useState<string | null>(null);
  const [showPlaceholders, setShowPlaceholders] = useState(true); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedInputsJSON = localStorage.getItem('configAdvisorInputs');
        if (storedInputsJSON) {
            const storedInputs: StoredConfigAdvisorInputs = JSON.parse(storedInputsJSON);
            if (storedInputs.projectConfigFormData) {
                projectConfigForm.reset(storedInputs.projectConfigFormData);
            }
            setSidebarConfigContent(storedInputs.sidebarConfigContent || '');
            setRolesConfigContent(storedInputs.rolesConfigContent || '');
            
            const projectFormIsDefault = JSON.stringify(projectConfigForm.getValues()) === JSON.stringify(projectConfigForm.formState.defaultValues);
            setShowPlaceholders(
              projectFormIsDefault &&
              !storedInputs.sidebarConfigContent &&
              !storedInputs.rolesConfigContent
            );
        } else {
            setShowPlaceholders(true);
            projectConfigForm.reset({
              appName: appProjectConfig.appName,
              defaultAccentColorName: appProjectConfig.defaultAccentColorName,
              defaultBorderRadiusName: appProjectConfig.defaultBorderRadiusName,
              defaultAppVersionId: appProjectConfig.defaultAppVersionId,
            });
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const watchedProjectConfig = projectConfigForm.watch();
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const currentInputs: StoredConfigAdvisorInputs = {
            projectConfigFormData: watchedProjectConfig,
            sidebarConfigContent,
            rolesConfigContent,
        };
        localStorage.setItem('configAdvisorInputs', JSON.stringify(currentInputs));
        
        const projectFormIsDefaultOrEmpty = !watchedProjectConfig.appName || 
            (watchedProjectConfig.appName === appProjectConfig.appName &&
             watchedProjectConfig.defaultAccentColorName === appProjectConfig.defaultAccentColorName &&
             watchedProjectConfig.defaultBorderRadiusName === appProjectConfig.defaultBorderRadiusName &&
             watchedProjectConfig.defaultAppVersionId === appProjectConfig.defaultAppVersionId
            );

        if (!projectFormIsDefaultOrEmpty || sidebarConfigContent || rolesConfigContent) {
            setShowPlaceholders(false);
        }
    }
  }, [watchedProjectConfig, sidebarConfigContent, rolesConfigContent, appProjectConfig]);


  const handleTextareaChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (value.trim() !== '') {
      setShowPlaceholders(false);
    }
  };
  
  const loadExampleConfigs = () => {
    projectConfigForm.reset({
      appName: appProjectConfig.appName,
      defaultAccentColorName: appProjectConfig.defaultAccentColorName,
      defaultBorderRadiusName: appProjectConfig.defaultBorderRadiusName,
      defaultAppVersionId: appProjectConfig.defaultAppVersionId,
    });
    setSidebarConfigContent(placeholderSidebarConfig);
    setRolesConfigContent(placeholderRolesConfig);
    setShowPlaceholders(false); 
  };

  const handleSaveProjectConfig = async () => {
    const isValid = await projectConfigForm.trigger();
    if (isValid) {
      // Data is already saved to localStorage by the useEffect watching `watchedProjectConfig`.
      toast({
        title: 'Project Configuration Saved',
        description: 'Your project settings draft has been saved locally.',
      });
      projectConfigForm.reset(projectConfigForm.getValues()); // Resets dirty state
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the project configuration form.',
        variant: 'destructive',
      });
    }
  };

  const handleAnalyzeSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    const projectConfigData = projectConfigForm.getValues();
    
    const generatedProjectConfigContent = `
// project.config.ts
export const projectConfig = {
  appName: '${projectConfigData.appName}',
  availableAccentColors: ${JSON.stringify(appProjectConfig.availableAccentColors, null, 2)},
  defaultAccentColorName: '${projectConfigData.defaultAccentColorName}',
  availableBorderRadii: ${JSON.stringify(appProjectConfig.availableBorderRadii, null, 2)},
  defaultBorderRadiusName: '${projectConfigData.defaultBorderRadiusName}',
  availableAppVersions: ${JSON.stringify(appProjectConfig.availableAppVersions, null, 2)},
  defaultAppVersionId: '${projectConfigData.defaultAppVersionId}',
};
    `.trim();

    if (!generatedProjectConfigContent.trim() && !sidebarConfigContent.trim() && !rolesConfigContent.trim()) {
        setError("Please provide content or configuration for at least one file to analyze.");
        setIsLoading(false);
        return;
    }

    const input: AnalyzeConfigInput = {
      projectConfig: generatedProjectConfigContent,
      sidebarConfig: sidebarConfigContent,
      rolesConfig: rolesConfigContent,
    };

    try {
      const result = await analyzeConfig(input);
      setSuggestions(result.suggestions);
    } catch (err: any) {
      console.error('Error analyzing config:', err);
      setError(err.message || 'Failed to get suggestions from AI. Please ensure Genkit services are running if in local development (npm run genkit:dev).');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Ensure user is admin, otherwise show access denied. This is important as dummy user might be admin.
  const effectiveUserRole = user?.role;
  if (effectiveUserRole !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <ShieldQuestion className="h-12 w-12 md:h-16 md:w-16 text-destructive mb-4" />
        <h1 className="text-xl md:text-2xl font-bold">Access Denied</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          You do not have permission to view this page. This feature is for administrators only.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-1 sm:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuration Advisor</h1>
        <div className="flex gap-2">
          <Button onClick={loadExampleConfigs} disabled={isLoading} variant="outline" size="sm">
            <Info className="mr-2 h-4 w-4" /> Load Examples
          </Button>
          <Button onClick={handleAnalyzeSubmit} disabled={isLoading} size="sm">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Analyze Configurations
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Project Configuration (project.config.ts)</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Modify your project settings. The AI will analyze the generated file content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...projectConfigForm}>
            {/* Removed top-level form onSubmit as save button is separate */}
            <div className="space-y-4">
              <FormField
                control={projectConfigForm.control}
                name="appName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name</FormLabel>
                    <FormControl><Input {...field} disabled={isLoading} /></FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select accent color" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {appProjectConfig.availableAccentColors.map(color => (
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select border radius" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {appProjectConfig.availableBorderRadii.map(radius => (
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select app version" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {appProjectConfig.availableAppVersions.map(version => (
                          <SelectItem key={version.id} value={version.id}>{version.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button 
                onClick={handleSaveProjectConfig} 
                disabled={!projectConfigForm.formState.isDirty || isLoading}
                size="sm"
            >
                <Save className="mr-2 h-4 w-4" />
                Save Project Draft
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Raw Configuration Files</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Paste the content of your other configuration files below for AI analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="sidebarConfig" className="block text-sm font-medium mb-1">
              sidebar.config.ts
            </label>
            <Textarea
              id="sidebarConfig"
              placeholder={showPlaceholders && !sidebarConfigContent ? placeholderSidebarConfig : "Paste content of sidebar.config.ts here..."}
              value={sidebarConfigContent}
              onChange={(e) => handleTextareaChange(setSidebarConfigContent, e.target.value)}
              rows={8}
              className="font-mono text-xs min-h-[100px] sm:min-h-[150px]"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="rolesConfig" className="block text-sm font-medium mb-1">
              roles.config.ts
            </label>
            <Textarea
              id="rolesConfig"
              placeholder={showPlaceholders && !rolesConfigContent ? placeholderRolesConfig : "Paste content of roles.config.ts here..."}
              value={rolesConfigContent}
              onChange={(e) => handleTextareaChange(setRolesConfigContent, e.target.value)}
              rows={8}
              className="font-mono text-xs min-h-[100px] sm:min-h-[150px]"
              disabled={isLoading}
            />
          </div>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground">
            Note: The AI analysis is based on general best practices and the provided content. Always review suggestions carefully before implementing.
          </p>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && !suggestions && ( // Show loading indicator only when actively fetching new suggestions
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-sm text-muted-foreground">Analyzing configurations, please wait...</p>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">AI Suggestions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Here are the AI-powered suggestions to improve your configurations:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {suggestions.map((suggestion, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <div className="flex items-center gap-2 text-left w-full">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-semibold min-w-[130px] sm:min-w-[150px]">{suggestion.file}:</span>
                        <span className="truncate flex-1 ">{suggestion.suggestion}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-xs sm:prose-sm max-w-none dark:prose-invert px-2 leading-relaxed">
                    <p><strong>Suggestion:</strong> {suggestion.suggestion}</p>
                    <p><strong>Reason:</strong> {suggestion.reason}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {suggestions && suggestions.length === 0 && !isLoading && (
         <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>No Specific Suggestions</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">The AI analyzer did not find any specific critical issues or suggestions for the provided configurations. They appear to be well-structured based on the analysis criteria. You can try providing more detailed or different configurations for further analysis.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
