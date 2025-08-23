
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
  prompt: `You are an expert test creator for students. Your task is to generate a comprehensive and well-structured test with a total of 20 marks, based on the provided content.

The test should be tailored for the following context:
{{#if class}}
- Class: {{{class}}}
{{/if}}
{{#if subject}}
- Subject(s): {{#each subject}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

The test must be structured into four sections based on marks, in this exact order:
1.  **Section A: Multiple Choice Questions (4 Marks)** (Create 4 multiple-choice questions, 1 mark each. Each question must have 4 options labeled A, B, C, and D.)
2.  **Section B: Short Answer Questions (6 Marks)** (Create 3 short-answer questions, 2 marks each, that require a brief explanation.)
3.  **Section C: Medium Answer Questions (6 Marks)** (Create 2 questions, 3 marks each, that require a more detailed explanation.)
4.  **Section D: Long Answer Question (4 Marks)** (Create 1 long-answer question, 4 marks each, that requires a comprehensive explanation.)

After all the questions, provide a separate "Answer Key" section that clearly lists the correct answer for every question (e.g., "Section A: 1. B, 2. A", "Section B: 1. [Brief Answer]", etc.).

Format the entire output cleanly. Use clear headings for each section. Ensure the questions are directly relevant to the content provided below for the topic: {{{title}}}.

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
