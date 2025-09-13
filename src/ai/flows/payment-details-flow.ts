
'use server';
/**
 * @fileOverview An AI agent for extracting payment details from screenshots.
 *
 * - extractPaymentDetails - A function that handles the detail extraction process.
 * - PaymentDetailsInput - The input type for the function.
 * - PaymentDetailsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PaymentDetailsInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of a payment confirmation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PaymentDetailsInput = z.infer<typeof PaymentDetailsInputSchema>;

const PaymentDetailsOutputSchema = z.object({
  senderName: z.string().optional().describe("The name of the person who sent the payment."),
  paymentAmount: z.string().optional().describe("The total amount of the payment."),
  transactionDate: z.string().optional().describe("The date of the transaction (e.g., '15 July 2024')."),
  transactionTime: z.string().optional().describe("The time of the transaction (e.g., '10:30 AM')."),
  transactionId: z.string().optional().describe("The unique transaction ID, which could be labeled as UTR, UPI Ref No, Transaction ID, UPI Reference, RRN, TRN, UPI Transaction ID, or Google Transaction ID."),
});
export type PaymentDetailsOutput = z.infer<typeof PaymentDetailsOutputSchema>;

const extractionPrompt = ai.definePrompt({
    name: 'paymentDetailsExtractionPrompt',
    input: { schema: PaymentDetailsInputSchema },
    output: { schema: PaymentDetailsOutputSchema },
    prompt: `You are an expert OCR and data extraction tool. Your task is to analyze the provided payment screenshot and extract the following details: sender's name, payment amount, transaction date, transaction time, and the unique transaction ID.

The transaction ID might be labeled as UTR, UPI Ref No, Transaction ID, UPI Reference, RRN, TRN, UPI Transaction ID, or Google Transaction ID. Extract this value.

If any detail is not clearly visible, leave the corresponding field blank.

Image for Analysis:
{{media url=screenshotDataUri}}
`,
});

const paymentDetailsFlow = ai.defineFlow(
  {
    name: 'paymentDetailsFlow',
    inputSchema: PaymentDetailsInputSchema,
    outputSchema: PaymentDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await extractionPrompt(input);
    return output || {};
  }
);

export async function extractPaymentDetails(input: PaymentDetailsInput): Promise<PaymentDetailsOutput> {
  return paymentDetailsFlow(input);
}
