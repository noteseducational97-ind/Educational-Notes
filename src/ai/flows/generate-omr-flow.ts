
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
  input: { schema: GenerateOmrInputSchema.extend({ tableBody: z.string() }) },
  output: { schema: GenerateOmrOutputSchema },
  prompt: `
    You are an expert web developer specializing in creating precise, printable HTML designs.
    Your task is to generate a self-contained HTML file for a modern OMR (Optical Mark Recognition) answer sheet, optimized for A4 landscape printing. The entire output must be a single HTML string with inline CSS.

    **Design Requirements:**
    *   **Table-Based Layout:** The entire OMR sheet must be a single HTML \`<table>\`.
    *   **Multi-Column Format:** The table must have 4 sets of "Ques. No." and "Option" columns, for a total of 8 \`<th>\` headers in the table head. This is for a landscape layout.
    *   **Styling:** Use inline CSS for all styling. The table should have a \`1px solid #ccc\` border on all cells (\`th\`, \`td\`). Text should be centered.
    *   **Bubbles:** Options should be rendered as circular bubbles with the letter/number inside.

    **HTML Structure & Styling (Inline CSS):**
    1.  **Main Container (\`<div>\`):**
        *   Wrap the entire output in a \`<div>\` with a white background (\`background-color: white;\`) and narrow padding for a small border effect (e.g., \`padding: 10px;\`).
    2.  **Header Section:**
        *   Place the \`{{{title}}}\` and (if provided) \`{{{subtitle}}}\` above the table. Style the title with a larger font size and bold weight.
    3.  **Table (\`<table>\`):**
        *   Set \`width: 100%; border-collapse: collapse;\`.
    4.  **Table Header (\`<thead>\`):**
        *   Create one \`<tr>\` with 8 \`<th>\` elements.
        *   Repeat "Ques. No." and "Option" 4 times.
        *   Style headers with \`border: 1px solid #ccc; padding: 8px; text-align: center; background-color: #f2f2f2;\`.
    5.  **Table Body (\`<tbody>\`):**
        *   The table body is pre-generated and provided below. You must insert it directly into the \`<tbody>\` tag.
        {{{tableBody}}}

    Return the complete, self-contained HTML document. Do not add any markdown, comments, or explanations outside of the HTML code.
  `,
});

const generateOmrFlow = ai.defineFlow(
  {
    name: 'generateOmrFlow',
    inputSchema: GenerateOmrInputSchema,
    outputSchema: GenerateOmrOutputSchema,
  },
  async (input) => {
    const { questionCount, optionsPerQuestion, optionStyle } = input;
    const columns = 4;
    const rows = Math.ceil(questionCount / columns);

    const getOptionLabel = (index: number) => {
      if (optionStyle === 'alphabetic') {
        return String.fromCharCode(65 + index); // A, B, C...
      }
      return (index + 1).toString(); // 1, 2, 3...
    };

    const optionsHtml = Array.from({ length: optionsPerQuestion }, (_, i) => 
        `<span style="display: flex; justify-content: center; align-items: center; width: 24px; height: 24px; border: 1px solid #999; border-radius: 50%; font-size: 10pt;">${getOptionLabel(i)}</span>`
    ).join('');

    const optionsCellHtml = `<td style="border: 1px solid #ccc; padding: 5px; display: flex; justify-content: center; align-items: center; gap: 5px;">${optionsHtml}</td>`;

    let tableBody = '';
    for (let r = 0; r < rows; r++) {
      tableBody += '<tr>';
      for (let c = 0; c < columns; c++) {
        const questionNumber = r + rows * c + 1;
        if (questionNumber <= questionCount) {
          tableBody += `<td style="border: 1px solid #ccc; text-align: center; padding: 5px;">${questionNumber}</td>`;
          tableBody += optionsCellHtml;
        } else {
          // Fill empty cells if the last row is not full
          tableBody += `<td style="border: 1px solid #ccc; text-align: center; padding: 5px;"></td>`;
          tableBody += `<td style="border: 1px solid #ccc; text-align: center; padding: 5px;"></td>`;
        }
      }
      tableBody += '</tr>';
    }

    const { output } = await prompt({ ...input, tableBody });
    return output!;
  }
);


export async function generateOmrSheet(input: GenerateOmrInput): Promise<GenerateOmrOutput> {
  return generateOmrFlow(input);
}
