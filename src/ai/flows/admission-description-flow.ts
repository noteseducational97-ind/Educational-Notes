
'use server';
/**
 * @fileOverview An AI agent for generating admission form descriptions.
 *
 * - generateAdmissionDescription - A function that handles the description generation process.
 * - AdmissionDescriptionInput - The input type for the function.
 * - AdmissionDescriptionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdmissionDescriptionInputSchema = z.object({
  title: z.string().describe("The title of the admission batch."),
  teacherName: z.string().describe("The name of the teacher for the batch."),
  subject: z.string().describe("The subject taught in the batch."),
  className: z.string().describe("The name of the coaching class."),
  year: z.string().describe("The academic year of the batch (e.g., 2024-25)."),
});
export type AdmissionDescriptionInput = z.infer<typeof AdmissionDescriptionInputSchema>;

const AdmissionDescriptionOutputSchema = z.object({
  description: z.string().describe("The generated, detailed, and engaging description for the admission form."),
});
export type AdmissionDescriptionOutput = z.infer<typeof AdmissionDescriptionOutputSchema>;


const descriptionPrompt = ai.definePrompt({
    name: 'admissionDescriptionPrompt',
    input: { schema: AdmissionDescriptionInputSchema },
    output: { schema: AdmissionDescriptionOutputSchema },
    prompt: `You are an expert copywriter for an educational platform. Your task is to write a compelling and informative description for an admission form.

The description should be at least 100 characters long. It should be engaging, highlight the key benefits of joining the batch, and encourage students to enroll.

Use the following details to craft the description:
- Batch Title: {{{title}}}
- Teacher's Name: {{{teacherName}}}
- Subject: {{{subject}}}
- Class Name: {{{className}}}
- Academic Year: {{{year}}}

Generated Description:
`,
});

const admissionDescriptionFlow = ai.defineFlow(
  {
    name: 'admissionDescriptionFlow',
    inputSchema: AdmissionDescriptionInputSchema,
    outputSchema: AdmissionDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await descriptionPrompt(input);
    return output || { description: '' };
  }
);


export async function generateAdmissionDescription(input: AdmissionDescriptionInput): Promise<AdmissionDescriptionOutput> {
  return admissionDescriptionFlow(input);
}
