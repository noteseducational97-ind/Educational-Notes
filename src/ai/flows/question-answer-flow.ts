
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
import { getResourceById } from '@/lib/firebase/resources';

const QuestionAnswerInputSchema = z.object({
  question: z.string().describe("The user's question."),
  resourceId: z.string().optional().describe('The ID of the resource to use as context.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type QuestionAnswerInput = z.infer<typeof QuestionAnswerInputSchema>;

const QuestionAnswerOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
  imageUrl: z.string().optional().describe('The URL of a generated image, if requested. Should be a data URI.'),
  suggestions: z.array(z.string()).optional().describe('Up to 3 suggested follow-up questions.'),
});
export type QuestionAnswerOutput = z.infer<typeof QuestionAnswerOutputSchema>;


const prompt = ai.definePrompt({
  name: 'questionAnswerPrompt',
  input: {schema: z.object({
      question: QuestionAnswerInputSchema.shape.question,
      photoDataUri: QuestionAnswerInputSchema.shape.photoDataUri,
      resourceContent: z.string().optional().describe('The content of the resource to answer from.'),
  })},
  output: {schema: z.object({ 
    answer: z.string(),
    suggestions: z.array(z.string()).optional().describe('Generate three relevant follow-up questions based on the answer you provided.'),
  }) }, // Output includes text and suggestions
  prompt: `You are a helpful AI assistant and a friendly study partner for students. Your primary task is to provide clear, concise, and accurate answers to user questions using simple, easy-to-understand language.

**Formatting Rules:**
- **Use Markdown for all formatting.**
- Use headings (#, ##, ###) to structure the answer.
- Use **bold** for key terms and concepts.
- Use bullet points (*) or numbered lists (1.) to break down complex ideas into smaller, digestible points.
- Provide clear examples, potentially using code blocks (\`\`\`) or blockquotes (>) for emphasis.
- Use tables to present data or comparisons where appropriate.
- Ensure proper spacing between paragraphs and sections.

After providing a well-formatted and simple answer, generate three relevant follow-up questions a user might ask next.

{{#if resourceContent}}
You have been provided with specific content. You MUST answer the user's question based ONLY on this content. Do not use any external knowledge. If the answer is not in the content, state that you cannot answer based on the provided material.
Resource Content:
---
{{{resourceContent}}}
---
{{else}}
You can answer questions on any topic. Do not attempt to generate images unless explicitly asked. Only provide text-based answers.
{{/if}}

{{#if photoDataUri}}
You have been provided with an image to help answer the question. Use it as context.
Photo: {{media url=photoDataUri}}
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
    // If a resourceId is provided, fetch its content to use as context.
    if (input.resourceId && false) { // Reverted this logic to make AI open-ended
        const resource = await getResourceById(input.resourceId);
        if (!resource) {
            return { answer: "I'm sorry, I couldn't find the resource you're asking about." };
        }
        const { output } = await prompt({ 
            question: input.question, 
            resourceContent: resource.content 
        });
        return { answer: output!.answer, suggestions: output!.suggestions };
    }
      
    // If no resourceId, proceed with general Q&A logic.
    // Check if the user is explicitly asking to generate an image, and no image was uploaded.
    const wantsImageGeneration = /image|generate|create/i.test(input.question);
    
    if (wantsImageGeneration && !input.photoDataUri) {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: input.question,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      return {
          answer: `Here is the generated image as you requested for "${input.question}"`,
          imageUrl: media?.url,
          suggestions: [
            'Can you make this more vibrant?',
            'Generate another image in a different style.',
            'What other kinds of images can you create?',
          ]
      }
    } else {
        // For text questions, or questions about an uploaded image.
        const { output } = await prompt({
            question: input.question,
            photoDataUri: input.photoDataUri,
        });
        return {
            answer: output!.answer,
            suggestions: output!.suggestions,
        };
    }
  }
);


export async function answerQuestion(input: QuestionAnswerInput): Promise<QuestionAnswerOutput> {
  return answerQuestionFlow(input);
}
