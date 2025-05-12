
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, ShieldQuestion, Lightbulb, AlertTriangle, FileText } from 'lucide-react';
import { analyzeConfig, type AnalyzeConfigInput, type AnalyzeConfigOutput } from '@/ai/flows/config-advisor';
import { useAuth } from '@/contexts/auth-provider';
import Link from 'next/link';

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
    <div className="flex-1 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuration Advisor</h1>
        <Button onClick={handleSubmit} disabled={isLoading} size="sm">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Analyze Configurations
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Input Configuration Files</CardTitle>
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
              rows={6}
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
              rows={6}
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
              rows={6}
              className="font-mono text-xs"
              disabled={isLoading}
            />
          </div>
        </CardContent>
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
          <p className="ml-2 text-sm">Analyzing configurations, please wait...</p>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">AI Suggestions</CardTitle>
            <CardDescription>
              Here are the AI-powered suggestions to improve your configurations:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {suggestions.map((suggestion, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2 text-left">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-semibold">{suggestion.file}:</span>
                        <span className="truncate flex-1">{suggestion.suggestion}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-xs sm:prose-sm max-w-none dark:prose-invert px-2">
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
