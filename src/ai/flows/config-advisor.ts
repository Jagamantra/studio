'use server';

/**
 * @fileOverview An AI-powered configuration analyzer for suggesting improvements to configuration files.
 *
 * - analyzeConfig - A function that analyzes configuration files and suggests improvements.
 * - AnalyzeConfigInput - The input type for the analyzeConfig function.
 * - AnalyzeConfigOutput - The return type for the analyzeConfig function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeConfigInputSchema = z.object({
  projectConfig: z.string().describe('The content of project.config.ts file.'),
  sidebarConfig: z.string().describe('The content of sidebar.config.ts file.'),
  rolesConfig: z.string().describe('The content of roles.config.ts file.'),
});
export type AnalyzeConfigInput = z.infer<typeof AnalyzeConfigInputSchema>;

const AnalyzeConfigOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      file: z.enum(['project.config.ts', 'sidebar.config.ts', 'roles.config.ts']).describe('The file to which the suggestion applies.'),
      suggestion: z.string().describe('A specific suggestion for improvement.'),
      reason: z.string().describe('The reason for the suggestion.'),
    })
  ).describe('An array of suggestions for improving the configuration files.'),
});
export type AnalyzeConfigOutput = z.infer<typeof AnalyzeConfigOutputSchema>;

export async function analyzeConfig(input: AnalyzeConfigInput): Promise<AnalyzeConfigOutput> {
  return analyzeConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeConfigPrompt',
  input: {schema: AnalyzeConfigInputSchema},
  output: {schema: AnalyzeConfigOutputSchema},
  prompt: `You are an AI-powered configuration analyzer. You will receive the content of three configuration files:

project.config.ts:
\`\`\`
{{{ projectConfig }}}
\`\`\`

sidebar.config.ts:
\`\`\`
{{{ sidebarConfig }}}
\`\`\`

roles.config.ts:
\`\`\`
{{{ rolesConfig }}}
\`\`\`

Analyze these files and provide suggestions for improvements related to app performance and security. Focus on identifying potential issues, inefficiencies, or vulnerabilities in the configurations.  Return an array of suggestions, each including the file name, the suggestion itself, and the reason for the suggestion.  The output should be formatted as a JSON object matching the AnalyzeConfigOutputSchema.
`,
});

const analyzeConfigFlow = ai.defineFlow(
  {
    name: 'analyzeConfigFlow',
    inputSchema: AnalyzeConfigInputSchema,
    outputSchema: AnalyzeConfigOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

