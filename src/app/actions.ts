'use server';

import { distributorUpdateConflictDetection, type DistributorUpdateConflictDetectionInput, type DistributorUpdateConflictDetectionOutput } from "@/ai/flows/distributor-update-conflict-detection";
import { gradeCrop, type GradeCropInput, type GradeCropOutput } from "@/ai/flows/grade-crop-flow";
import type { Lot } from "@/lib/types";

export async function detectConflictAction(
    lot: Lot,
    formData: {
        vehicleNumber: string;
        transportCondition: 'Cold Storage' | 'Normal';
        warehouseEntryDateTime: string;
    }
): Promise<DistributorUpdateConflictDetectionOutput> {
    const input: DistributorUpdateConflictDetectionInput = {
        lotDetails: JSON.stringify({
            crop: lot.cropName,
            harvest_date: lot.harvestDate,
            weight: `${lot.weight}kg`,
        }),
        vehicleNumber: formData.vehicleNumber,
        transportCondition: formData.transportCondition,
        warehouseEntryDateTime: formData.warehouseEntryDateTime,
    };

    try {
        const result = await distributorUpdateConflictDetection(input);
        return result;
    } catch (error) {
        console.error("Error in conflict detection flow:", error);
        return {
            conflictDetected: true,
            conflictDetails: "An unexpected error occurred while checking for conflicts. Please try again.",
        };
    }
}


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
