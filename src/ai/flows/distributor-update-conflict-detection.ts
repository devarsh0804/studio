'use server';
/**
 * @fileOverview This file defines a Genkit flow to detect conflicts between new distributor updates and existing lot details.
 *
 * - distributorUpdateConflictDetection - A function that takes distributor input and checks for conflicts with existing lot data.
 * - DistributorUpdateConflictDetectionInput - The input type for the distributorUpdateConflictDetection function.
 * - DistributorUpdateConflictDetectionOutput - The return type for the distributorUpdateConflictDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DistributorUpdateConflictDetectionInputSchema = z.object({
  lotDetails: z.string().describe('The existing lot details in JSON format.'),
  vehicleNumber: z.string().describe('The vehicle number used for transportation.'),
  transportCondition: z.string().describe('The transport condition (e.g., Cold Storage, Normal).'),
  warehouseEntryDateTime: z.string().describe('The warehouse entry date and time.'),
});
export type DistributorUpdateConflictDetectionInput = z.infer<typeof DistributorUpdateConflictDetectionInputSchema>;

const DistributorUpdateConflictDetectionOutputSchema = z.object({
  conflictDetected: z.boolean().describe('Whether a conflict was detected.'),
  conflictDetails: z.string().optional().describe('Details about the conflict, if any.'),
  resolutionOptions: z.string().optional().describe('Suggested resolution options, if a conflict is detected.'),
});
export type DistributorUpdateConflictDetectionOutput = z.infer<typeof DistributorUpdateConflictDetectionOutputSchema>;

export async function distributorUpdateConflictDetection(
  input: DistributorUpdateConflictDetectionInput
): Promise<DistributorUpdateConflictDetectionOutput> {
  return distributorUpdateConflictDetectionFlow(input);
}

const conflictDetectionPrompt = ai.definePrompt({
  name: 'conflictDetectionPrompt',
  input: {schema: DistributorUpdateConflictDetectionInputSchema},
  output: {schema: DistributorUpdateConflictDetectionOutputSchema},
  prompt: `You are an AI agent responsible for detecting conflicts in supply chain data.

You are given the existing details for a lot and new transportation details added by a distributor.
Your task is to determine if the new details conflict with the existing information.

Existing Lot Details:
{{lotDetails}}

New Transportation Details:
Vehicle Number: {{vehicleNumber}}
Transport Condition: {{transportCondition}}
Warehouse Entry Date/Time: {{warehouseEntryDateTime}}

Consider aspects like:
*   Consistency of transport conditions with the crop type.
*   Reasonableness of the warehouse entry date/time compared to the harvest date in the lot details.
*   Any other factors that might indicate a discrepancy or conflict.

Based on your analysis, determine if a conflict exists and provide details and resolution options if one is found.

Return a JSON object with:
*   conflictDetected: true or false
*   conflictDetails: A string describing the conflict, if any.
*   resolutionOptions: Suggested resolution options, if a conflict is detected.

If no conflict is found, conflictDetails and resolutionOptions should be empty strings.
`,
});

const distributorUpdateConflictDetectionFlow = ai.defineFlow(
  {
    name: 'distributorUpdateConflictDetectionFlow',
    inputSchema: DistributorUpdateConflictDetectionInputSchema,
    outputSchema: DistributorUpdateConflictDetectionOutputSchema,
  },
  async input => {
    const {output} = await conflictDetectionPrompt(input);
    return output!;
  }
);
