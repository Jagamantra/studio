
'use client';

import { useState } from 'react';
import { analyzeConfig, type AnalyzeConfigInput, type AnalyzeConfigOutput } from '@/ai/flows/config-advisor';

export function useAiConfigAnalysis() {
  const [suggestions, setSuggestions] = useState<AnalyzeConfigOutput['suggestions'] | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = async (input: AnalyzeConfigInput): Promise<AnalyzeConfigOutput | null> => {
    setIsLoadingAi(true);
    setError(null);
    setSuggestions(null); // Clear previous suggestions

    if (!input.projectConfig.trim() && !input.sidebarConfig.trim() && !input.rolesConfig.trim()) {
        setError("Please provide content or configuration for at least one file to analyze.");
        setIsLoadingAi(false);
        return null;
    }

    try {
      const result = await analyzeConfig(input);
      setSuggestions(result.suggestions);
      return result;
    } catch (err: any) {
      console.error('Error analyzing config:', err);
      setError(err.message || 'Failed to get suggestions from AI. Ensure Genkit services are running if in local development (npm run genkit:dev).');
      setSuggestions(null); // Ensure suggestions are cleared on error
      return null;
    } finally {
      setIsLoadingAi(false);
    }
  };

  const resetAnalysis = () => {
    setSuggestions(null);
    setError(null);
    setIsLoadingAi(false); // Also reset loading state if needed
  };

  return {
    suggestions,
    isLoadingAi,
    error,
    performAnalysis,
    resetAnalysis,
  };
}
