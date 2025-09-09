
'use server';
/**
 * @fileOverview A test generation AI agent.
 *
 * - generateTest - A function that handles generating tests from content.
 * - TestGeneratorInput - The input type for the generateTest function.
 * - TestGeneratorOutput - The return type for the generateTest function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TestGeneratorInputSchema = z.object({
  title: z.string().describe("The title of the resource or chapter name."),
  subject: z.string().describe("The subject of the resource."),
  class: z.string().optional().describe("The class or grade level for the resource."),
  resourceContent: z.string().describe("The content of the educational resource to generate a test from."),
  testType: z.enum(['MCQ', 'Regular']).describe("The type of test to generate."),
  questionCount: z.number().optional().default(5).describe("The number of questions to generate."),
});
export type TestGeneratorInput = z.infer<typeof TestGeneratorInputSchema>;

const MCQQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

const RegularQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const TestGeneratorOutputSchema = z.object({
  mcqQuestions: z.array(MCQQuestionSchema).optional(),
  regularQuestions: z.array(RegularQuestionSchema).optional(),
});
export type TestGeneratorOutput = z.infer<typeof TestGeneratorOutputSchema>;

export async function generateTest(input: TestGeneratorInput): Promise<TestGeneratorOutput> {
  return testGeneratorFlow(input);
}

const mcqPrompt = ai.definePrompt({
  name: 'mcqTestGeneratorPrompt',
  input: { schema: TestGeneratorInputSchema },
  output: { schema: TestGeneratorOutputSchema },
  prompt: `You are an expert test creator for {{class}}. Based on the following content for the chapter titled "{{title}}" in the subject of {{subject}}, generate a multiple-choice question (MCQ) test with exactly {{questionCount}} questions. Each question must have 4 options, and you must indicate the correct answer.

Resource Content:
{{{resourceContent}}}
`,
});

const regularPrompt = ai.definePrompt({
  name: 'regularTestGeneratorPrompt',
  input: { schema: TestGeneratorInputSchema },
  output: { schema: TestGeneratorOutputSchema },
  prompt: `You are an expert test creator for {{class}}. Based on the following content for the chapter titled "{{title}}" in the subject of {{subject}}, generate a regular question-and-answer test with exactly {{questionCount}} questions. Provide both the question and the correct answer for each.

Resource Content:
{{{resourceContent}}}
`,
});

const testGeneratorFlow = ai.defineFlow(
  {
    name: 'testGeneratorFlow',
    inputSchema: TestGeneratorInputSchema,
    outputSchema: TestGeneratorOutputSchema,
  },
  async (input) => {
    if (input.testType === 'MCQ') {
      const { output } = await mcqPrompt(input);
      return output || {};
    } else {
      const { output } = await regularPrompt(input);
      return output || {};
    }
  }
);
