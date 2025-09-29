
'use server';
/**
 * @fileOverview A crop grading AI agent.
 *
 * - gradeCrop - A function that handles the crop grading process.
 * - GradeCropInput - The input type for the gradeCrop function.
 * - GradeCropOutput - The return type for the gradeCrop function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeCropInputSchema = z.object({
  cropName: z.string().describe('The name of the crop being graded.'),
  farmerName: z.string().describe('The name of the farmer who grew the crop.'),
  location: z.string().describe('The location where the crop was grown.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GradeCropInput = z.infer<typeof GradeCropInputSchema>;

const GradeCropOutputSchema = z.object({
  moisture: z.string().describe('The moisture content of the crop (e.g., "12%").'),
  impurities: z.string().describe('The percentage of impurities found (e.g., "0.5%").'),
  size: z.string().describe('The average size of the crop (e.g., "Uniform Medium").'),
  color: z.string().describe('The color of the crop (e.g., "Golden Brown").'),
  grade: z.enum(['Premium', 'Standard', 'Basic']).describe('The final grade assigned to the crop.'),
});
export type GradeCropOutput = z.infer<typeof GradeCropOutputSchema>;

export async function gradeCrop(input: GradeCropInput): Promise<GradeCropOutput> {
  return gradeCropFlow(input);
}

const gradingPrompt = ai.definePrompt({
  name: 'gradeCropPrompt',
  input: {schema: GradeCropInputSchema},
  output: {schema: GradeCropOutputSchema},
  prompt: `You are an expert AI crop grader for a digital mandi (agricultural market).
You are tasked with performing "hot grading" on a new crop batch using simulated IoT sensor data and image analysis.

Crop Details:
- Crop: {{{cropName}}}
- Farmer: {{{farmerName}}}
- Location: {{{location}}}
- Photo: {{media url=photoDataUri}}

Based on the provided information and the image, analyze the crop and determine the following quality parameters:
- moisture: Estimate a realistic moisture percentage.
- impurities: Estimate a realistic percentage of impurities.
- size: Describe the uniformity and size of the crop grains/pieces.
- color: Describe the color.
- grade: Based on all factors, assign a final grade of 'Premium', 'Standard', or 'Basic'. For example, high moisture or impurities might lead to a lower grade.

Return a JSON object with your findings.
`,
});

const gradeCropFlow = ai.defineFlow(
  {
    name: 'gradeCropFlow',
    inputSchema: GradeCropInputSchema,
    outputSchema: GradeCropOutputSchema,
  },
  async input => {
    const {output} = await gradingPrompt(input);
    return output!;
  }
);
