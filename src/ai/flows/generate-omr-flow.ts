
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
    You are an expert HTML and CSS developer tasked with generating a printable OMR (Optical Mark Recognition) answer sheet that looks exactly like the user's reference image.
    The user will provide specifications, and you must generate a single, self-contained HTML file with inline CSS that is optimized for printing on A4 paper.

    **Instructions:**
    1.  **HTML Structure:** Create a well-structured HTML document. Use a main container for the content, including the title and subtitle.
    2.  **Header:** The sheet must have a header containing the '{{{title}}}' and, if provided, the '{{{subtitle}}}'. Center them.
    3.  **OMR Table:** The main content should be an HTML \`<table>\`. It must have two columns with headers "Q.No" and "Options".
    4.  **Question Numbering:** For each of the '{{{questionCount}}}' questions, the question number in the "Q.No" column must be padded with leading zeros to three digits (e.g., 001, 002, 003, ...).
    5.  **Answer Options:** In the "Options" column, generate '{{{optionsPerQuestion}}}' options for each question.
        *   If '{{{optionStyle}}}' is 'alphabetic', label the options with uppercase letters (A, B, C, ...).
        *   If '{{{optionStyle}}}' is 'numeric', label them with numbers (1, 2, 3, ...).
    6.  **Styling (Inline CSS):**
        *   Use a clean, professional, and print-friendly design that mirrors the provided image.
        *   The table should have clean, solid borders.
        *   The question number ("Q.No") and option labels ("Options") headers should be bold.
        *   Each option should be a letter/number inside an empty circle (bubble).
        *   Ensure all content within the table cells is centered vertically and horizontally.
        *   Use a standard sans-serif font like Arial.
        *   The layout should be in multiple columns on the page to be space-efficient. Use CSS columns for the main container holding the tables. A 3 or 4 column layout is ideal.
    7.  **Output:** Return the complete HTML document as a single string in the 'htmlContent' field. Do not include any explanations, just the raw HTML code.

    **Example for one table row (if alphabetic with 4 options):**
    <tr>
        <td class="q-no">001</td>
        <td class="options">
            <div class="option-item"><span>A</span></div>
            <div class="option-item"><span>B</span></div>
            <div class="option-item"><span>C</span></div>
            <div class="option-item"><span>D</span></div>
        </td>
    </tr>
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
