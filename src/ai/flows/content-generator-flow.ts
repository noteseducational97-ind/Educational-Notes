
'use server';
/**
 * @fileOverview A content generation AI agent.
 *
 * - generateContent - A function that handles generating content from a title.
 * - ContentGeneratorInput - The input type for the generateContent function.
 * - ContentGeneratorOutput - The return type for the generateContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContentGeneratorInputSchema = z.object({
  title: z.string().describe("The title of the resource to generate content from."),
});
export type ContentGeneratorInput = z.infer<typeof ContentGeneratorInputSchema>;

const ContentGeneratorOutputSchema = z.object({
  content: z.string().describe("The generated content for the resource."),
});
export type ContentGeneratorOutput = z.infer<typeof ContentGeneratorOutputSchema>;

const contentPrompt = ai.definePrompt({
  name: 'contentGeneratorPrompt',
  input: { schema: ContentGeneratorInputSchema },
  output: { schema: ContentGeneratorOutputSchema },
  prompt: `You are an expert content writer for an educational platform. Based on the following resource title, write a detailed, engaging, and informative description for the resource. The description should be suitable for students and highlight the key topics covered.

Resource Title:
"{{{title}}}"

Generated Content:
`,
});


const contentGeneratorFlow = ai.defineFlow(
  {
    name: 'contentGeneratorFlow',
    inputSchema: ContentGeneratorInputSchema,
    outputSchema: ContentGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await contentPrompt(input);
    return output || { content: '' };
  }
);

export async function generateContent(input: ContentGeneratorInput): Promise<ContentGeneratorOutput> {
  return contentGeneratorFlow(input);
}
