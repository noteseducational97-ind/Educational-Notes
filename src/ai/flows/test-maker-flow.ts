
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
  stream: z.array(z.string()).optional().describe('The stream(s) the resource material belongs to (e.g., "Science").'),
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
  prompt: `You are an expert test creator for students, specializing in Indian competitive exams like NEET and MHT-CET, as well as regular school curricula. Your task is to generate a comprehensive and well-structured test based on the provided topic details and content.

**Crucially, all questions must be derived *only* from the "Resource Content" provided below.** Do not introduce any external information.

The test must be structured into four sections based on marks, in this exact order:
1.  **Section A: Multiple Choice Questions** (Create 4 multiple-choice questions, 1 mark each. Each question must have 4 options. Format them as "1. Question text... A) Option A B) Option B C) Option C D) Option D")
2.  **Section B: Short Answer Questions** (Create 3 short-answer questions, 2 marks each, that require a brief explanation.)
3.  **Section C: Medium Answer Questions** (Create 3 questions, 3 marks each, where students must answer any two. This section is worth a total of 6 marks.)
4.  **Section D: Long Answer Question** (Create 2 long-answer questions, 4 marks each, that requires a comprehensive explanation.)

After all the questions, provide a separate "Answer Key" section that clearly lists the correct answer for every question (e.g., "Section A: 1. B, 2. A", "Section B: 1. [Brief Answer]", etc.).

The questions should be of a medium difficulty level, highly relevant to the provided content, and appropriate for the specified class, subjects, and streams. Use clear, simple, and direct language that is easy for students to understand. Avoid overly complex or ambiguous wording.

Formatting Rules:
- Add a blank line before the start of each new section (e.g., before "Section B").
- Do NOT add any extra blank lines between questions within the same section.

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
