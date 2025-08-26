
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
  testContent: z.string().describe('The full generated test content, formatted as a string with questions, and options.'),
});
export type GenerateTestOutput = z.infer<typeof GenerateTestOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateTestPrompt',
  input: {schema: GenerateTestInputSchema},
  output: {schema: GenerateTestOutputSchema},
  prompt: `You are an expert test creator for students, specializing in Indian competitive exams like NEET and MHT-CET, as well as regular school curricula. Your task is to generate a comprehensive and well-structured test based on the provided topic details and content.

**Crucially, all questions must be derived *only* from the "Resource Content" provided below.** Do not introduce any external information or an answer key.

The test must be structured into four sections, in this exact order:
1.  **Section A**: "Ques. 1 Multiple Choice Questions (4 Marks)". Create exactly 4 multiple-choice questions, 1 mark each. Each question must have 4 options (A, B, C, D).
2.  **Section B**: "Ques. 2 Short Answer Questions (6 Marks)". Create exactly 3 short-answer questions, 2 marks each, that require a brief explanation.
3.  **Section C**: "Ques. 3 Answer The following Question (Any 2) (6 Marks)". Create exactly 3 questions, 3 marks each, from which students must answer any two.
4.  **Section D**: "Ques. 4 Long Answer Question (4 Marks)". Create exactly 2 long-answer questions, 4 marks each, from which students must answer any one.

The questions should be of a medium difficulty level, highly relevant to the provided content, and appropriate for the specified class, subjects, and streams. Use clear, simple, and direct language that is easy for students to understand. Avoid overly complex or ambiguous wording.

Formatting Rules:
- Each section header (e.g., "Section A") must be on its own line and centered.
- The question block title (e.g., "Ques. 1 Multiple Choice Questions (4 Marks)") MUST be on a new line right after the section header.
- For MCQs, format each question as "1. Question text...". Each option MUST be on a new line, formatted like "A) Option A".
- For other sections, format questions as "1. Question text...".
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
