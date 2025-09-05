
'use server';
/**
 * @fileOverview An AI agent for generating OMR sheets.
 *
 * - generateOmrSheet - A function that handles the OMR sheet generation process.
 * - GenerateOmrInput - The input type for the generateOmrSheet function.
 * - GenerateOmrOutput - The return type for the generateOmrSheet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    1.  **HTML Structure:** Create a well-structured HTML document. Use a main container to hold all the content.
    2.  **Header:** The sheet must have a header containing the '{{{title}}}' and, if provided, the '{{{subtitle}}}'.
    3.  **Answer Grid:** Generate a grid for '{{{questionCount}}}' questions.
    4.  **Answer Options:** For each question, create '{{{optionsPerQuestion}}}' options.
    5.  **Option Labels:**
        *   If '{{{optionStyle}}}' is 'alphabetic', label the options with uppercase letters (A, B, C, ...).
        *   If '{{{optionStyle}}}' is 'numeric', label them with numbers (1, 2, 3, ...).
    6.  **Styling (Inline CSS):**
        *   Use a professional, clean, and print-friendly design.
        *   The layout should be in columns to fit the page efficiently. A 4 or 5-column layout is typical.
        *   Each answer option should be represented by a circular bubble (empty circle).
        *   Ensure proper spacing and alignment for all elements.
        *   The HTML should include a <style> tag in the <head> with all necessary CSS. Do not use external stylesheets.
        *   The font should be a standard sans-serif font like Arial.
        *   Make the bubbles using border-radius. They should be distinct and easy to fill in.
    7.  **Output:** Return the complete HTML document as a single string in the 'htmlContent' field. Do not include any explanations, just the raw HTML code.

    **Example for one question item (if alphabetic):**
    <div class="answer-row">
        <div class="q-number">1.</div>
        <div class="options">
            <div class="option-item"><span class="option-label">A</span><div class="bubble"></div></div>
            <div class="option-item"><span class="option-label">B</span><div class="bubble"></div></div>
            <div class="option-item"><span class="option-label">C</span><div class="bubble"></div></div>
            <div class="option-item"><span class="option-label">D</span><div class="bubble"></div></div>
        </div>
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
