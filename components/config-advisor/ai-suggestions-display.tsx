
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb, AlertTriangle, FileText } from 'lucide-react';
import type { AnalyzeConfigOutput } from '@/ai/flows/config-advisor';

interface AISuggestionsDisplayProps {
  suggestions: AnalyzeConfigOutput['suggestions'] | null;
  isLoadingAi: boolean;
  error: string | null;
}

export const AISuggestionsDisplay = React.memo(function AISuggestionsDisplay({ suggestions, isLoadingAi, error }: AISuggestionsDisplayProps) {
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoadingAi && !suggestions) { 
    return (
      <div className="flex justify-center items-center py-8 mt-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-sm text-muted-foreground">Analyzing configurations, please wait...</p>
      </div>
    );
  }

  if (suggestions && suggestions.length > 0) {
    return (
      <Card className="mt-4">
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
    );
  }

  if (suggestions && suggestions.length === 0 && !isLoadingAi) {
     return (
       <Alert className="mt-4">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>No Specific Suggestions</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">The AI analyzer did not find any specific critical issues or suggestions for the provided configurations. They appear to be well-structured based on the analysis criteria. You can try providing more detailed or different configurations for further analysis.</AlertDescription>
      </Alert>
    );
  }

  return null; 
});

AISuggestionsDisplay.displayName = 'AISuggestionsDisplay';
