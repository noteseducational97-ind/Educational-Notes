
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
    You are an expert web developer specializing in creating precise, printable HTML designs.
    Your task is to generate a self-contained HTML file for a modern OMR (Optical Mark Recognition) answer sheet, optimized for A4 printing. The entire output must be a single HTML string with inline CSS.

    **Design Requirements:**
    *   **Table-Based Layout:** The entire OMR sheet must be a single HTML \`<table>\`.
    *   **Multi-Column Format:** The table must have 5 sets of "Ques. No." and "Option" columns, for a total of 10 \`<th>\` headers in the table head.
    *   **Question Distribution:** Distribute the \`{{{questionCount}}}\` questions evenly across the 5 columns. For example, for 100 questions, you will have 20 rows.
    *   **Styling:** Use inline CSS for all styling. The table should have a \`1px solid #ccc\` border on all cells (\`th\`, \`td\`). Text should be centered.
    *   **Bubbles:** Options should be rendered as circular bubbles with the letter/number inside.

    **HTML Structure & Styling (Inline CSS):**
    1.  **Main Container (\`<div>\`):**
        *   Wrap the entire output in a \`<div>\` with a white background (\`background-color: white;\`) and appropriate padding (e.g., \`padding: 20px;\`).
    2.  **Header Section:**
        *   Place the \`{{{title}}}\` and (if provided) \`{{{subtitle}}}\` above the table. Style the title with a larger font size and bold weight.
    3.  **Table (\`<table>\`):**
        *   Set \`width: 100%; border-collapse: collapse;\`.
    4.  **Table Header (\`<thead>\`):**
        *   Create one \`<tr>\` with 10 \`<th>\` elements.
        *   Repeat "Ques. No." and "Option" 5 times.
        *   Style headers with \`border: 1px solid #ccc; padding: 8px; text-align: center; background-color: #f2f2f2;\`.
    5.  **Table Body (\`<tbody>\`):**
        *   Generate the necessary number of \`<tr>\` rows to accommodate all questions.
        *   Each \`<tr>\` will contain 10 \`<td>\`s (5 for question numbers, 5 for options).
        *   Question Number Cell: Center the number vertically and horizontally.
        *   Options Cell: Use a flex container (\`display: flex; justify-content: center; align-items: center; gap: 5px;\`) to hold the bubbles.
    6.  **Answer Bubbles (\`<span>\`):**
        *   Each bubble should be a \`<span>\` styled to be a perfect circle with a border.
        *   Example bubble style: \`display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%; font-size: 10pt;\`.

    **Example Snippet for one Table Row (\`<tr>\`) with 100 Questions (this is row 1):**
    \`\`\`html
    <tr>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px;">1</td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px; display: flex; justify-content: center; align-items: center; gap: 5px;">
            <span style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%;">A</span>
            <span style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%;">B</span>
            <span style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%;">C</span>
            <span style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%;">D</span>
        </td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px;">21</td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px; display: flex; justify-content: center; align-items: center; gap: 5px;">
            <span style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%;">A</span>
            <span style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%;">B</span>
            <span style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%;">C</span>
            <span style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border: 1px solid #999; border-radius: 50%;">D</span>
        </td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px;">41</td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px; display: flex; justify-content: center; align-items: center; gap: 5px;">
            ...options...
        </td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px;">61</td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px; display: flex; justify-content: center; align-items: center; gap: 5px;">
            ...options...
        </td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px;">81</td>
        <td style="border: 1px solid #ccc; text-align: center; padding: 5px; display: flex; justify-content: center; align-items: center; gap: 5px;">
            ...options...
        </td>
    </tr>
    \`\`\`

    Return the complete, self-contained HTML document as a single string in the 'htmlContent' field. Do not add any markdown, comments, or explanations outside of the HTML code.
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
