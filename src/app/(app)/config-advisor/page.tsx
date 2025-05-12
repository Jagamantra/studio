
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, ShieldQuestion, Lightbulb, AlertTriangle, FileText } from 'lucide-radix'; // Assuming lucide-radix exists or use lucide-react
import { analyzeConfig, type AnalyzeConfigInput, type AnalyzeConfigOutput } from '@/ai/flows/config-advisor';
import { useAuth } from '@/contexts/auth-provider';
import Link from 'next/link';

// Correcting Lucide import
import { Loader2 as LoaderIcon, ShieldQuestion as ShieldQuestionIcon, Lightbulb as LightbulbIcon, AlertTriangle as AlertTriangleIcon, FileText as FileTextIcon } from 'lucide-react';


export default function ConfigAdvisorPage() {
  const { user, loading: authLoading } = useAuth();
  const [projectConfigContent, setProjectConfigContent] = useState('');
  const [sidebarConfigContent, setSidebarConfigContent] = useState('');
  const [rolesConfigContent, setRolesConfigContent] = useState('');
  const [suggestions, setSuggestions] = useState<AnalyzeConfigOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

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
      setError(err.message || 'Failed to get suggestions from AI.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return <div className="flex flex-1 items-center justify-center"><LoaderIcon className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <ShieldQuestionIcon className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to view this page. This feature is for administrators only.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Configuration Advisor</h1>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LightbulbIcon className="mr-2 h-4 w-4" />
          )}
          Analyze Configurations
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Configuration Files</CardTitle>
          <CardDescription>
            Paste the content of your configuration files below. The AI will analyze them for potential improvements in performance and security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="projectConfig" className="block text-sm font-medium mb-1">
              project.config.ts
            </label>
            <Textarea
              id="projectConfig"
              placeholder="Paste content of project.config.ts here..."
              value={projectConfigContent}
              onChange={(e) => setProjectConfigContent(e.target.value)}
              rows={8}
              className="font-mono text-xs"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="sidebarConfig" className="block text-sm font-medium mb-1">
              sidebar.config.ts
            </label>
            <Textarea
              id="sidebarConfig"
              placeholder="Paste content of sidebar.config.ts here..."
              value={sidebarConfigContent}
              onChange={(e) => setSidebarConfigContent(e.target.value)}
              rows={8}
              className="font-mono text-xs"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="rolesConfig" className="block text-sm font-medium mb-1">
              roles.config.ts
            </label>
            <Textarea
              id="rolesConfig"
              placeholder="Paste content of roles.config.ts here..."
              value={rolesConfigContent}
              onChange={(e) => setRolesConfigContent(e.target.value)}
              rows={8}
              className="font-mono text-xs"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Analyzing configurations, please wait...</p>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>
              Here are the AI-powered suggestions to improve your configurations:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {suggestions.map((suggestion, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{suggestion.file}:</span>
                        <span className="truncate flex-1 text-left">{suggestion.suggestion}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none dark:prose-invert px-2">
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
            <LightbulbIcon className="h-4 w-4" />
            <AlertTitle>No Specific Suggestions</AlertTitle>
            <AlertDescription>The AI analyzer did not find any specific critical issues or suggestions for the provided configurations. They appear to be well-structured based on the analysis criteria. You can try providing more detailed or different configurations for further analysis.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
