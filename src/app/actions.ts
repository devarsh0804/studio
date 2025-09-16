'use server';

import { distributorUpdateConflictDetection, type DistributorUpdateConflictDetectionInput, type DistributorUpdateConflictDetectionOutput } from "@/ai/flows/distributor-update-conflict-detection";
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
