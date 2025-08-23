
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
  question: z.string().describe("The user's question."),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
  prompt: `You are a helpful AI assistant for students. Your primary role is to answer questions related to educational topics, suitable for students up to the graduation and post-graduation level.

Your task is to provide clear, concise, and accurate answers to academic questions.

When a user asks a question, first determine if it is related to an educational subject.
- If the question is about an academic topic (e.g., science, math, history, literature, engineering basics), provide a helpful and informative answer.
- If the question is NOT study-related (e.g., personal advice, celebrity gossip, current affairs, or any other non-academic topic), you must politely decline to answer. Respond with a message like: "I can only answer questions related to educational topics. Please ask me something about your studies."
- If the question is too advanced (beyond post-graduation level), you can suggest that the topic is outside the scope of your knowledge.

{{#if photoDataUri}}
You have been provided with an image to help answer the question. Use it as context.
{{/if}}

User's Question:
"{{{question}}}"
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
