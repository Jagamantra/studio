
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, ShieldQuestion, Lightbulb, AlertTriangle, FileText, Info } from 'lucide-react';
import { analyzeConfig, type AnalyzeConfigInput, type AnalyzeConfigOutput } from '@/ai/flows/config-advisor';
import { useAuth } from '@/contexts/auth-provider';
import Link from 'next/link';

// Updated example config content for placeholders
const placeholderProjectConfig = `
// project.config.ts
export const projectConfig = {
  appName: 'My Awesome App',
  defaultAccentColorName: 'Blue', // Try 'Rose' or 'Green'
  defaultBorderRadiusName: 'Medium', // Options: 'Small', 'Large'
  defaultAppVersionId: 'v1.0.0', // Also 'v0.9.0-beta', 'dev'
};
`.trim();

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


export default function ConfigAdvisorPage() {
  const { user, loading: authLoading } = useAuth();
  const [projectConfigContent, setProjectConfigContent] = useState('');
  const [sidebarConfigContent, setSidebarConfigContent] = useState('');
  const [rolesConfigContent, setRolesConfigContent] = useState('');
  const [suggestions, setSuggestions] = useState<AnalyzeConfigOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlaceholders, setShowPlaceholders] = useState(true);

  useEffect(() => {
    // Check if user has previously entered any data to decide on showing placeholders
    if (localStorage.getItem('configAdvisorInputs')) {
        const storedInputs = JSON.parse(localStorage.getItem('configAdvisorInputs')!);
        setProjectConfigContent(storedInputs.projectConfigContent || '');
        setSidebarConfigContent(storedInputs.sidebarConfigContent || '');
        setRolesConfigContent(storedInputs.rolesConfigContent || '');
        setShowPlaceholders(!storedInputs.projectConfigContent && !storedInputs.sidebarConfigContent && !storedInputs.rolesConfigContent);
    } else {
      // If no stored inputs, set placeholders if user hasn't typed anything
      if (!projectConfigContent && !sidebarConfigContent && !rolesConfigContent) {
        setProjectConfigContent(placeholderProjectConfig);
        setSidebarConfigContent(placeholderSidebarConfig);
        setRolesConfigContent(placeholderRolesConfig);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount


  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, fieldName: string) => {
    setter(value);
    setShowPlaceholders(false); // Hide placeholders once user starts typing
    // Persist current inputs
    localStorage.setItem('configAdvisorInputs', JSON.stringify({
        projectConfigContent: fieldName === 'projectConfigContent' ? value : projectConfigContent,
        sidebarConfigContent: fieldName === 'sidebarConfigContent' ? value : sidebarConfigContent,
        rolesConfigContent: fieldName === 'rolesConfigContent' ? value : rolesConfigContent,
    }));
  };
  
  const loadExampleConfigs = () => {
    setProjectConfigContent(placeholderProjectConfig);
    setSidebarConfigContent(placeholderSidebarConfig);
    setRolesConfigContent(placeholderRolesConfig);
    setShowPlaceholders(false); // User explicitly loaded examples
    localStorage.setItem('configAdvisorInputs', JSON.stringify({
        projectConfigContent: placeholderProjectConfig,
        sidebarConfigContent: placeholderSidebarConfig,
        rolesConfigContent: placeholderRolesConfig
    }));
  };


  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    if (!projectConfigContent.trim() && !sidebarConfigContent.trim() && !rolesConfigContent.trim()) {
        setError("Please provide content for at least one configuration file to analyze.");
        setIsLoading(false);
        return;
    }

    const input: AnalyzeConfigInput = {
      projectConfig: projectConfigContent,
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

  if (user?.role !== 'admin') {
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
          <Button onClick={handleSubmit} disabled={isLoading} size="sm">
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
          <CardTitle className="text-xl md:text-2xl">Input Configuration Files</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Paste the content of your configuration files below. The AI will analyze them for potential improvements. You can also load example configurations to see how it works.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="projectConfig" className="block text-sm font-medium mb-1">
              project.config.ts
            </label>
            <Textarea
              id="projectConfig"
              placeholder={showPlaceholders ? "Example project.config.ts content..." : "Paste content of project.config.ts here..."}
              value={projectConfigContent}
              onChange={(e) => handleInputChange(setProjectConfigContent, e.target.value, 'projectConfigContent')}
              rows={8}
              className="font-mono text-xs min-h-[100px] sm:min-h-[150px]"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="sidebarConfig" className="block text-sm font-medium mb-1">
              sidebar.config.ts
            </label>
            <Textarea
              id="sidebarConfig"
              placeholder={showPlaceholders ? "Example sidebar.config.ts content..." : "Paste content of sidebar.config.ts here..."}
              value={sidebarConfigContent}
              onChange={(e) => handleInputChange(setSidebarConfigContent, e.target.value, 'sidebarConfigContent')}
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
              placeholder={showPlaceholders ? "Example roles.config.ts content..." : "Paste content of roles.config.ts here..."}
              value={rolesConfigContent}
              onChange={(e) => handleInputChange(setRolesConfigContent, e.target.value, 'rolesConfigContent')}
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

      {isLoading && (
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

