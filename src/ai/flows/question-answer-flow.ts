
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


const AnswerPromptInputSchema = z.object({
    question: QuestionAnswerInputSchema.shape.question,
    photoDataUri: QuestionAnswerInputSchema.shape.photoDataUri,
    resourceContent: z.string().optional().describe('The content of the resource to answer from.'),
});

const answerPrompt = ai.definePrompt({
  name: 'questionAnswerPrompt',
  input: {schema: AnswerPromptInputSchema },
  output: {schema: z.object({ answer: z.string() }) },
  prompt: `You are a helpful AI assistant and a friendly study partner for students, specifically tailored for an Indian audience. Your primary task is to provide clear, concise, and accurate answers to user questions. Your goal is to make learning easier and more relatable.

**Core Instruction: Adapt your response to the user's question. Your goal is to make learning easier. If the user asks for a simple definition, provide one. If they ask for a detailed explanation, give a thorough answer. Structure your answers with a brief, clear definition first, followed by a full, detailed explanation. Use analogies and simple examples relevant to an Indian context to make complex topics easy to understand, as if you were explaining them to a 10th-grade student.**

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
You MUST prioritize providing answers for classes 9 through 12 based on the information available at "https://maharashtraboardsolutions.in/". If the answer is not found there, you may use your general knowledge. Do not attempt to generate images unless explicitly asked. Only provide text-based answers.
{{/if}}

{{#if photoDataUri}}
You have been provided with an image to help answer the question. Use it as context.
Photo: {{media url=photoDataUri}}
{{/if}}

User's Question:
"{{{question}}}"
`,
});

const suggestionPrompt = ai.definePrompt({
    name: 'suggestionPrompt',
    input: { schema: z.object({
        question: z.string(),
        answer: z.string(),
    })},
    output: { schema: z.object({
        suggestions: z.array(z.string()).describe('Up to 3 suggested follow-up questions.'),
    })},
    prompt: `Based on the following question and answer, please generate up to 3 relevant, interesting, and insightful follow-up questions that a student might ask next.

Original Question: "{{{question}}}"

Answer:
{{{answer}}}

Generate up to 3 follow-up questions.`
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
        const { output: answerOutput } = await answerPrompt({ 
            question: input.question, 
            resourceContent: resource.content 
        });

        if (!answerOutput) {
            return { answer: "I'm sorry, I couldn't generate an answer for this resource." };
        }
        
        const { output: suggestionOutput } = await suggestionPrompt({ question: input.question, answer: answerOutput.answer });

        return { answer: answerOutput.answer, suggestions: suggestionOutput?.suggestions };
    }
      
    // If no resourceId, proceed with general Q&A logic.
    const wantsImageGeneration = /image|generate|create|draw/i.test(input.question);
    
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
    const { output: answerOutput } = await answerPrompt({
        question: input.question,
        photoDataUri: input.photoDataUri,
    });

    if (!answerOutput) {
        return { answer: "I'm sorry, I couldn't generate an answer to your question." };
    }
    
    const { output: suggestionOutput } = await suggestionPrompt({ question: input.question, answer: answerOutput.answer });

    return {
        answer: answerOutput.answer,
        suggestions: suggestionOutput?.suggestions
    };
  }
);


export async function answerQuestion(input: QuestionAnswerInput): Promise<QuestionAnswerOutput> {
  return answerQuestionFlow(input);
}

    