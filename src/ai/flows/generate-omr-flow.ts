
'use server';
/**
 * @fileOverview An AI agent for generating OMR sheets.
 *
 * - generateOmrSheet - A function that handles the OMR sheet generation process.
 * - GenerateOmrInput - The input type for the generateOmrSheet function.
 * - GenerateOmrOutput - The return type for the generateOmrSheet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateOmrInputSchema = z.object({
  title: z.string().describe('The main title of the OMR sheet.'),
  subtitle: z.string().optional().describe('An optional subtitle for the OMR sheet.'),
  questionCount: z.number().describe('The total number of questions.'),
  optionsPerQuestion: z.number().describe('The number of options for each question (e.g., 4 for A,B,C,D).'),
  optionStyle: z.enum(['alphabetic', 'numeric']).describe('The labeling style for options.'),
});
export type GenerateOmrInput = z.infer<typeof GenerateOmrInputSchema>;

const GenerateOmrOutputSchema = z.object({
  htmlContent: z.string().describe('The full HTML content of the generated OMR sheet.'),
});
export type GenerateOmrOutput = z.infer<typeof GenerateOmrOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateOmrPrompt',
  input: { schema: GenerateOmrInputSchema },
  output: { schema: GenerateOmrOutputSchema },
  prompt: `
    You are an expert HTML and CSS developer tasked with generating a printable OMR (Optical Mark Recognition) answer sheet.
    The user will provide specifications, and you must generate a single, self-contained HTML file with inline CSS that is optimized for printing on A4 paper.

    **Instructions:**
    1.  **HTML Structure:** Create a well-structured HTML document. Use a main container with a border for the entire printable area.
    2.  **Header:** The sheet must have a header containing the '{{{title}}}' and, if provided, the '{{{subtitle}}}'. Center them and provide ample spacing.
    3.  **Question Blocks:** The main content should be a CSS grid or flexbox container that arranges question blocks in multiple columns (target 4 columns, but allow it to be responsive).
    4.  **Question Numbering:** For each of the '{{{questionCount}}}' questions, display the question number.
    5.  **Answer Options:** For each question, generate '{{{optionsPerQuestion}}}' options.
        *   If '{{{optionStyle}}}' is 'alphabetic', label the options with uppercase letters (A, B, C, ...).
        *   If '{{{optionStyle}}}' is 'numeric', label them with numbers (1, 2, 3, ...).
    6.  **Styling (Inline CSS):**
        *   Use a clean, professional, and print-friendly design.
        *   The main container must have a visible border (e.g., '2px solid #333').
        *   Each option should be a letter/number next to an empty, perfectly circular bubble for marking. The bubble and the label should be vertically aligned.
        *   Use a standard sans-serif font like Arial.
        *   Ensure proper spacing and padding throughout for a clean, uncluttered look. The layout must be space-efficient.
    7.  **Output:** Return the complete HTML document as a single string in the 'htmlContent' field. Do not include any explanations, just the raw HTML code.

    **Example for one question block (if alphabetic with 4 options):**
    <div class="question-block">
        <span class="q-num">1.</span>
        <div class="option">A <span class="bubble"></span></div>
        <div class="option">B <span class="bubble"></span></div>
        <div class="option">C <span class="bubble"></span></div>
        <div class="option">D <span class="bubble"></span></div>
    </div>
  `,
});

const generateOmrFlow = ai.defineFlow(
  {
    name: 'generateOmrFlow',
    inputSchema: GenerateOmrInputSchema,
    outputSchema: GenerateOmrOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateOmrSheet(input: GenerateOmrInput): Promise<GenerateOmrOutput> {
  return generateOmrFlow(input);
}
