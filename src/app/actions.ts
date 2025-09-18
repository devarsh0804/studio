'use server';

import { gradeCrop, type GradeCropInput, type GradeCropOutput } from "@/ai/flows/grade-crop-flow";
import type { Lot } from "@/lib/types";


export async function gradeCropAction(
    formData: {
        farmerName: string;
        cropName: string;
        location: string;
        photoDataUri: string;
    }
): Promise<GradeCropOutput> {
    const input: GradeCropInput = {
        cropName: formData.cropName,
        farmerName: formData.farmerName,
        location: formData.location,
        photoDataUri: formData.photoDataUri,
    };

    // No try-catch here, let the error propagate to the client component
    // so it can be handled there (e.g. show a toast notification).
    const result = await gradeCrop(input);
    return result;
}
