
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
    You are an expert web developer specializing in creating beautiful, printable HTML designs.
    Your task is to generate a self-contained HTML file for a modern OMR (Optical Mark Recognition) answer sheet, optimized for A4 printing. The HTML must have a white background.

    **Design Principles:**
    *   **Clean & Modern:** Use a minimalist design with plenty of white space.
    *   **Professional Typography:** Use a standard, elegant sans-serif font like 'Inter' or 'Lato'. Font size should be readable (e.g., 10pt or 11pt).
    *   **Space-Efficient Layout:** Use a multi-column layout (4 columns is ideal) to fit as many questions as possible without looking cluttered.
    *   **Subtle Styling:** Use light gray for borders and lines. Avoid harsh black lines.

    **HTML Structure & Styling (Inline CSS):**
    1.  **Page Container:**
        *   Create a main \`<div>\` that acts as the A4 page container.
        *   It must have a noticeable but soft border: \`border: 1px solid #ccc;\`.
        *   Use padding to ensure content doesn't touch the edges (e.g., \`padding: 20mm;\`).
        *   Set the box-sizing to \`border-box\`.
        *   **Crucially, it must have a white background: \`background-color: white;\`.**
    2.  **Header Section:**
        *   The header should contain the \`{{{title}}}\` and (if provided) the \`{{{subtitle}}}\`.
        *   Style the title with a larger font size and bold weight. The subtitle should be smaller and lighter.
        *   Add a subtle horizontal line (\`<hr style="border-top: 1px solid #eee;">\`) below the header.
        *   Ensure there's ample margin below the header before the questions start.
    3.  **Questions Grid:**
        *   Use a CSS Grid (\`display: grid;\`) for the main content area to create the 4-column layout. Use \`grid-template-columns: repeat(4, 1fr);\` and add a \`gap\` for spacing between columns.
    4.  **Individual Question Block:**
        *   Each question block should be a flex container to align items neatly.
        *   The question number should be bold and separated from the options.
    5.  **Answer Options:**
        *   For each question, generate \`{{{optionsPerQuestion}}}\` options.
        *   Label options with uppercase letters (A, B, C...) if \`{{{optionStyle}}}\` is 'alphabetic', or numbers (1, 2, 3...) if 'numeric'.
        *   Each option consists of the label and a circular bubble. The bubble must be a perfect circle (\`border-radius: 50%;\`), with a grey border.
        *   Ensure the label and its corresponding bubble are vertically aligned perfectly.

    **Final Output:**
    Return the complete, self-contained HTML document as a single string in the 'htmlContent' field. Do not add any markdown, comments, or explanations outside of the HTML code.

    **Example Snippet for one Question Block (use this styling as a guide):**
    \`\`\`html
    <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 11pt;">
        <strong style="margin-right: 10px; width: 30px;">1.</strong>
        <div style="display: flex; align-items: center; gap: 8px;">
            <span>A</span>
            <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #999; border-radius: 50%;"></span>
            <span>B</span>
            <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #999; border-radius: 50%;"></span>
            <span>C</span>
            <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #999; border-radius: 50%;"></span>
            <span>D</span>
            <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #999; border-radius: 50%;"></span>
        </div>
    </div>
    \`\`\`
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
