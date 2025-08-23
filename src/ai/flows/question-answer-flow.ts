
'use server';
/**
 * @fileOverview An question answering AI agent.
 *
 * - answerQuestion - A function that handles answering a question based on a resource.
 * - QuestionAnswerInput - The input type for the answerQuestion function.
 * - QuestionAnswerOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionAnswerInputSchema = z.object({
  question: z.string().describe('The user\'s question.'),
  resourceTitle: z.string().describe('The title of the resource to search for an answer.'),
  resourceContent: z.string().describe('The content of the resource to search for an answer.'),
});
export type QuestionAnswerInput = z.infer<typeof QuestionAnswerInputSchema>;

const QuestionAnswerOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type QuestionAnswerOutput = z.infer<typeof QuestionAnswerOutputSchema>;


const prompt = ai.definePrompt({
  name: 'questionAnswerPrompt',
  input: {schema: QuestionAnswerInputSchema},
  output: {schema: QuestionAnswerOutputSchema},
  prompt: `You are an expert tutor. Your task is to answer the user's question based *only* on the provided content from the resource titled "{{resourceTitle}}".

If the answer is not found in the content, state that you could not find an answer in the provided material. Do not use any external knowledge.

User's Question:
{{{question}}}

Resource Content:
{{{resourceContent}}}
`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: QuestionAnswerInputSchema,
    outputSchema: QuestionAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function answerQuestion(input: QuestionAnswerInput): Promise<QuestionAnswerOutput> {
  return answerQuestionFlow(input);
}
