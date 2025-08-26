
'use server';
/**
 * @fileOverview An MCQ test generation AI agent.
 *
 * - generateMcqTest - A function that handles the MCQ test generation process.
 * - GenerateTestInput - The input type for the generateMcqTest function.
 * - GenerateTestOutput - The return type for the generateMcqTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateTestInput, GenerateTestOutput as BaseGenerateTestOutput } from './test-maker-flow';

// Re-exporting types from the main test maker flow
export type { GenerateTestInput };

// The output for this flow is also a test content string
export type GenerateTestOutput = BaseGenerateTestOutput;


const prompt = ai.definePrompt({
  name: 'generateMcqTestPrompt',
  input: {schema: z.custom<GenerateTestInput>()},
  output: {schema: z.custom<GenerateTestOutput>()},
  prompt: `You are an expert test creator for students, specializing in Indian competitive exams like NEET and MHT-CET, as well as regular school curricula. Your task is to generate a multiple-choice question (MCQ) test based on the provided topic details and content.

**Crucially, all questions must be derived *only* from the "Resource Content" provided below.** Do not introduce any external information.

The test must consist of:
1.  **Section A: Multiple Choice Questions (20 Marks)**: This section will contain exactly 20 multiple-choice questions. Each question must have 4 options (A, B, C, D).
2.  An **Answer Key** section at the very end that lists the correct answer for every question.

The questions should be of a medium difficulty level, highly relevant to the provided content, and appropriate for the specified class, subjects, and streams. Use clear, simple, and direct language that is easy for students to understand. Avoid overly complex or ambiguous wording.

Formatting Rules:
- The first line must be exactly "Section A: Multiple Choice Questions (20 Marks)".
- Format each question as "1. Question text...".
- Each option MUST be on a new line, formatted like "A) Option A".
- Add a blank line between each question.
- Add a blank line before the "Answer Key" section.

Topic Details:
- Chapter/Title: {{{title}}}
- Class: {{#if class}}{{class}}{{else}}N/A{{/if}}
- Subject(s): {{#if subject}}{{#each subject}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}N/A{{/if}}
- Stream(s): {{#if stream}}{{#each stream}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}N/A{{/if}}

Resource Content:
---
{{{content}}}
---
`,
});

const generateMcqTestFlow = ai.defineFlow(
  {
    name: 'generateMcqTestFlow',
    inputSchema: z.custom<GenerateTestInput>(),
    outputSchema: z.custom<GenerateTestOutput>(),
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateMcqTest(input: GenerateTestInput): Promise<GenerateTestOutput> {
  return generateMcqTestFlow(input);
}
