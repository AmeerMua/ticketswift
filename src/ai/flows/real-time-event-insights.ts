'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating real-time event insights.
 *
 * - getRealTimeEventInsights - A function that retrieves real-time insights about event performance.
 * - RealTimeEventInsightsInput - The input type for the getRealTimeEventInsights function.
 * - RealTimeEventInsightsOutput - The return type for the getRealTimeEventInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeEventInsightsInputSchema = z.object({
  totalTicketsSold: z.number().describe('The total number of tickets sold for the event.'),
  totalRevenue: z.number().describe('The total revenue generated from ticket sales for the event.'),
  categoryWiseTicketDistribution: z.record(z.string(), z.number()).describe('A map of ticket category to the number of tickets sold in that category.'),
});
export type RealTimeEventInsightsInput = z.infer<typeof RealTimeEventInsightsInputSchema>;

const RealTimeEventInsightsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the event performance based on the provided data.'),
  recommendations: z.string().describe('AI-driven recommendations for improving event performance in the future.'),
});
export type RealTimeEventInsightsOutput = z.infer<typeof RealTimeEventInsightsOutputSchema>;

export async function getRealTimeEventInsights(input: RealTimeEventInsightsInput): Promise<RealTimeEventInsightsOutput> {
  return realTimeEventInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeEventInsightsPrompt',
  input: {schema: RealTimeEventInsightsInputSchema},
  output: {schema: RealTimeEventInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes event data and provides insights to event organizers.

  Based on the following data, provide a summary of the event's performance and recommendations for future events:

  Total Tickets Sold: {{{totalTicketsSold}}}
  Total Revenue: {{{totalRevenue}}}
  Category-wise Ticket Distribution: {{#each categoryWiseTicketDistribution}}{{{@key}}}: {{{this}}}, {{/each}}

  Summary:
  - Provide a concise summary of the event performance.

  Recommendations:
  - Suggest at least 2 specific, actionable recommendations for improving event performance in the future.  Be specific, suggesting concrete changes to ticket pricing, distribution, or event organization.
  `,
});

const realTimeEventInsightsFlow = ai.defineFlow(
  {
    name: 'realTimeEventInsightsFlow',
    inputSchema: RealTimeEventInsightsInputSchema,
    outputSchema: RealTimeEventInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
