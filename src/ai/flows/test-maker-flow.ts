
'use server';
/**
 * @fileOverview A regular test generation AI agent.
 *
 * - generateRegularTest - A function that handles the regular test generation process.
 * - RegularTestInput - The input type for the generateRegularTest function.
 * - RegularTestOutput - The return type for the generateRegularTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegularTestInputSchema = z.object({
  title: z.string().describe('The title of the resource material.'),
  content: z.string().describe('The full text content of the resource material to base the test on.'),
  class: z.string().optional().describe('The class level for which the test is being generated (e.g., "12").'),
  subject: z.array(z.string()).optional().describe('The subject(s) of the resource material.'),
  stream: z.array(z.string()).optional().describe('The stream(s) the resource material belongs to (e.g., "Science").'),
});
export type RegularTestInput = z.infer<typeof RegularTestInputSchema>;

const RegularTestOutputSchema = z.object({
  testContent: z.string().describe('The full generated test content, formatted as a string with questions and sections.'),
});
export type RegularTestOutput = z.infer<typeof RegularTestOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateRegularTestPrompt',
  input: {schema: RegularTestInputSchema},
  output: {schema: RegularTestOutputSchema},
  prompt: `You are an expert test creator for students, specializing in Indian competitive exams and school curricula. Your task is to generate a comprehensive 20-mark test based on the provided topic details and content.

**Crucially, all questions must be derived *only* from the "Resource Content" provided below.** Do not introduce any external information.

The test must be structured as follows:

**Section A: Multiple Choice Questions (4 Marks)**
- This section must contain exactly 4 multiple-choice questions.
- Each question is worth 1 mark.
- Each question must have 4 options (A, B, C, D).
- The options A and B should be on the same line, and C and D should be on the following line, formatted in two columns. For example:
  A) Option A      B) Option B
  C) Option C      D) Option D

**Section B: Short Answer Questions (6 Marks)**
- This section must contain exactly 3 questions.
- Each question is worth 2 marks.

**Section C: Short Answer Questions (6 Marks)**
- This section must contain exactly 3 questions.
- Each question is worth 3 marks.
- Include the instruction "(Solve Any 2)".

**Section D: Long Answer Questions (4 Marks)**
- This section must contain exactly 2 questions.
- Each question is worth 4 marks.
- Include the instruction "(Solve Any 1)".

**Answer Key**
- At the very end of the test, provide an "Answer Key" section that lists the correct answer for every question from all sections.

Formatting Rules:
- Use clear headings for each section (e.g., "Section A: Multiple Choice Questions (4 Marks)").
- Format each question as "Q1. Question text...".
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

const generateRegularTestFlow = ai.defineFlow(
  {
    name: 'generateRegularTestFlow',
    inputSchema: RegularTestInputSchema,
    outputSchema: RegularTestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function generateRegularTest(input: RegularTestInput): Promise<RegularTestOutput> {
  return generateRegularTestFlow(input);
}
