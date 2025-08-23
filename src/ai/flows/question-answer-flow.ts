
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
  imageUrl: z.string().optional().describe('The URL of a generated image, if requested. Should be a data URI.'),
});
export type QuestionAnswerOutput = z.infer<typeof QuestionAnswerOutputSchema>;


const prompt = ai.definePrompt({
  name: 'questionAnswerPrompt',
  input: {schema: QuestionAnswerInputSchema},
  output: {schema: z.object({ answer: z.string() }) }, // Output only text from here
  prompt: `You are a helpful AI assistant. Your task is to provide clear, concise, and accurate answers to user questions on any topic.

Do not attempt to generate images. Only provide text-based answers.

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
  async (input) => {
    const shouldGenerateImage = /image|generate|create/i.test(input.question);
    
    if (shouldGenerateImage) {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: input.question,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      return {
          answer: `Here is the generated image as you requested for "${input.question}"`,
          imageUrl: media?.url
      }
    } else {
        const { output } = await prompt(input);
        return {
            answer: output!.answer,
        };
    }
  }
);


export async function answerQuestion(input: QuestionAnswerInput): Promise<QuestionAnswerOutput> {
  return answerQuestionFlow(input);
}
