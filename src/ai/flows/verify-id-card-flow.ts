'use server';
/**
 * @fileOverview An AI flow to verify user-submitted ID cards.
 *
 * - verifyIdCard - A function that analyzes an image to verify if it's a valid ID card.
 * - VerifyIdCardInput - The input type for the verifyIdCard function.
 * - VerifyIdCardOutput - The return type for the verifyIdCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyIdCardInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an ID card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyIdCardInput = z.infer<typeof VerifyIdCardInputSchema>;

const VerifyIdCardOutputSchema = z.object({
  isIdCard: z.boolean().describe('Whether or not the image appears to be a government-issued ID card (e.g., driver\'s license, passport).'),
  hasFace: z.boolean().describe('Whether or not a person\'s face is clearly visible in the ID card photo.'),
  dateOfBirth: z.string().nullable().describe('The date of birth found on the ID card in YYYY-MM-DD format. Null if not found.'),
  reason: z.string().describe('A brief explanation for the verification decision, especially if it fails.'),
});
export type VerifyIdCardOutput = z.infer<typeof VerifyIdCardOutputSchema>;


export async function verifyIdCard(input: VerifyIdCardInput): Promise<VerifyIdCardOutput> {
    return verifyIdCardFlow(input);
}


const prompt = ai.definePrompt({
    name: 'verifyIdCardPrompt',
    input: {schema: VerifyIdCardInputSchema},
    output: {schema: VerifyIdCardOutputSchema},
    prompt: `You are an expert document verifier. Analyze the provided image to determine if it is a valid government-issued identification document.

    Your task is to assess the following criteria and provide a structured response:
    1.  **Is it an ID card?** The image must be an official ID like a driver's license or passport. A picture of a person, a cat, or a landscape is not an ID card.
    2.  **Does it contain a face?** There must be a clear, visible portrait of a person on the ID card.
    3.  **What is the Date of Birth?** Extract the date of birth from the document. If it is visible, return it in YYYY-MM-DD format. If it's not clear or not present, return null.

    Provide a brief reason for your decision, especially if verification fails. For example, "The image is a landscape photo, not an ID card." or "The image is a valid ID card, but the date of birth is obscured."

    Image to analyze: {{media url=photoDataUri}}`,
});

const verifyIdCardFlow = ai.defineFlow(
    {
        name: 'verifyIdCardFlow',
        inputSchema: VerifyIdCardInputSchema,
        outputSchema: VerifyIdCardOutputSchema,
    },
    async input => {
        const {output} = await prompt(input);
        return output!;
    }
);
