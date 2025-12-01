'use server';
/**
 * @fileOverview An AI flow to verify user-submitted payment receipts.
 *
 * - verifyPaymentReceipt - A function that analyzes an image to verify if it's a valid payment receipt.
 * - VerifyPaymentReceiptInput - The input type for the verifyPaymentReceipt function.
 * - VerifyPaymentReceiptOutput - The return type for the verifyPaymentReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyPaymentReceiptInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a payment receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  expectedAmount: z.number().describe('The expected transaction amount that should be on the receipt.'),
});
export type VerifyPaymentReceiptInput = z.infer<typeof VerifyPaymentReceiptInputSchema>;

const VerifyPaymentReceiptOutputSchema = z.object({
  isReceipt: z.boolean().describe('Whether or not the image appears to be a payment receipt or transaction screenshot.'),
  amountMatches: z.boolean().describe('Whether the amount on the receipt matches the expected amount. Should be true if no amount is found.'),
  reason: z.string().describe('A brief explanation for the verification decision, especially if it fails.'),
});
export type VerifyPaymentReceiptOutput = z.infer<typeof VerifyPaymentReceiptOutputSchema>;


export async function verifyPaymentReceipt(input: VerifyPaymentReceiptInput): Promise<VerifyPaymentReceiptOutput> {
    return verifyPaymentReceiptFlow(input);
}


const prompt = ai.definePrompt({
    name: 'verifyPaymentReceiptPrompt',
    input: {schema: VerifyPaymentReceiptInputSchema},
    output: {schema: VerifyPaymentReceiptOutputSchema},
    prompt: `You are an expert financial document verifier for a ticket booking system. Your task is to analyze the provided image to determine if it is a valid payment receipt for a specific transaction.

    You must verify two things:
    1.  **Is it a receipt?** The image must be a screenshot or photo of a financial transaction (e.g., from a banking app, EasyPaisa, JazzCash). It should not be a random photo of a person, a landscape, or an object.
    2.  **Does the amount match?** Look for a transaction amount in the image. It must match the expected amount of **{{{expectedAmount}}}**. If you cannot find any amount, assume it matches.

    Based on your analysis, provide a structured response. If any check fails, provide a clear and concise reason.

    **Example Reasons for Failure:**
    - "The image is a picture of a cat, not a payment receipt."
    - "The receipt amount is for $50.00, but the expected amount was {{{expectedAmount}}}."
    
    Image to analyze: {{media url=photoDataUri}}`,
});

const verifyPaymentReceiptFlow = ai.defineFlow(
    {
        name: 'verifyPaymentReceiptFlow',
        inputSchema: VerifyPaymentReceiptInputSchema,
        outputSchema: VerifyPaymentReceiptOutputSchema,
    },
    async input => {
        const {output} = await prompt(input);
        return output!;
    }
);
