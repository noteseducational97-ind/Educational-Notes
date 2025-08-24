
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
  }) },
  prompt: `You are a helpful AI assistant and a friendly study partner for students. Your primary task is to provide clear, concise, and accurate answers to user questions.

**Core Instruction: Your goal is to make learning easier. Structure your answers with a brief, clear definition first, followed by a full, detailed explanation. Use analogies and simple examples to make complex topics easy to understand, as if you were explaining them to a 10th-grade student.**

**Formatting Rules:**
- **Use Markdown for all formatting.**
- Start with a short, bolded **Definition:** followed by a single sentence.
- Use headings (#, ##, ###) to structure the detailed explanation.
- Use **bold** for key terms and concepts.
- Use bullet points (*) or numbered lists (1.) to break down complex ideas.
- Provide clear examples, potentially using code blocks (\`\`\`) or blockquotes (>) for emphasis.
- For mathematical equations and symbols, use LaTeX within Markdown code blocks.
- Ensure proper spacing between paragraphs and sections.

{{#if resourceContent}}
You have been provided with specific content. You MUST answer the user's question based ONLY on this content. Do not use any external knowledge. If the answer is not in the content, state that you cannot answer based on the provided material.
Resource Content:
---
{{{resourceContent}}}
---
{{else}}
You MUST prioritize providing answers based on the information available at "https://maharashtraboardsolutions.com/". If the answer is not found there, you may use your general knowledge. Do not attempt to generate images unless explicitly asked. Only provide text-based answers.
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
    if (input.resourceId) { 
        const resource = await getResourceById(input.resourceId);
        if (!resource) {
            return { answer: "I'm sorry, I couldn't find the resource you're asking about." };
        }
        const { output } = await prompt({ 
            question: input.question, 
            resourceContent: resource.content 
        });
        return { answer: output!.answer, suggestions: undefined };
    }
      
    // If no resourceId, proceed with general Q&A logic.
    const wantsImageGeneration = /image|generate|create/i.test(input.question);
    
    // If the user wants to generate an image and hasn't uploaded one for context.
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
      }
    } 
    
    // For all other cases (text questions, or questions about an uploaded image).
    const { output } = await prompt({
        question: input.question,
        photoDataUri: input.photoDataUri,
    });
    return {
        answer: output!.answer,
    };
  }
);


export async function answerQuestion(input: QuestionAnswerInput): Promise<QuestionAnswerOutput> {
  return answerQuestionFlow(input);
}
