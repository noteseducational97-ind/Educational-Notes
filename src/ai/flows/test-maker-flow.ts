
'use server';
/**
 * @fileOverview A test generation AI agent.
 *
 * - generateTest - A function that handles the test generation process.
 * - GenerateTestInput - The input type for the generateTest function.
 * - GenerateTestOutput - The return type for the generateTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestInputSchema = z.object({
  title: z.string().describe('The title of the resource material.'),
  content: z.string().describe('The full text content of the resource material to base the test on.'),
  class: z.string().optional().describe('The class level for which the test is being generated (e.g., "12").'),
  subject: z.array(z.string()).optional().describe('The subject(s) of the resource material.'),
});
export type GenerateTestInput = z.infer<typeof GenerateTestInputSchema>;

const GenerateTestOutputSchema = z.object({
  testContent: z.string().describe('The full generated test content, formatted as a string with questions, options, and answers.'),
});
export type GenerateTestOutput = z.infer<typeof GenerateTestOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateTestPrompt',
  input: {schema: GenerateTestInputSchema},
  output: {schema: GenerateTestOutputSchema},
  prompt: `You are an expert test creator for students. Your task is to generate a comprehensive test based on the provided content.

The test should be tailored for the following context:
{{#if class}}
- Class: {{{class}}}
{{/if}}
{{#if subject}}
- Subject(s): {{#each subject}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

The test should be structured into three sections based on marks:
1.  **Section A: 1 Mark Questions** (5 multiple-choice questions)
2.  **Section B: 2 Marks Questions** (3 short-answer questions)
3.  **Section C: 3 Marks Questions** (2 long-answer questions)

For each multiple-choice question, provide 4 options (A, B, C, D) and clearly indicate the correct answer.
The entire test should be formatted clearly and be ready for a student to take.

Use the following content to generate the test for the topic: {{{title}}}

Content:
{{{content}}}
`,
});

const generateTestFlow = ai.defineFlow(
  {
    name: 'generateTestFlow',
    inputSchema: GenerateTestInputSchema,
    outputSchema: GenerateTestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateTest(input: GenerateTestInput): Promise<GenerateTestOutput> {
  return generateTestFlow(input);
}
