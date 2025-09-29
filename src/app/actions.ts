
'use server';

import { gradeCrop, type GradeCropInput, type GradeCropOutput } from "@/ai/flows/grade-crop-flow";
import { distributorUpdateConflictDetection, type DistributorUpdateConflictDetectionInput, type DistributorUpdateConflictDetectionOutput } from "@/ai/flows/distributor-update-conflict-detection";
import type { Lot, RetailEvent, User, UserRole } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch, addDoc } from "firebase/firestore";
import { seedLots } from "@/lib/seed-data";


// Firestore Collection References
const lotsCollection = collection(db, "lots");
const retailEventsCollection = collection(db, "retailEvents");
const usersCollection = collection(db, "users");


// Helper function to convert Firestore doc to Lot object
const docToLot = (doc: any): Lot => {
    const data = doc.data();
    return { lotId: doc.id, ...data } as Lot;
};


// Lot Functions
export async function getLot(lotId: string): Promise<Lot | null> {
    const docRef = doc(db, "lots", lotId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docToLot(docSnap);
    }
    return null;
}

export async function getAllLots(): Promise<Lot[]> {
    const q = query(lotsCollection);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToLot).sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
}

export async function getLotsByOwner(ownerId: string): Promise<Lot[]> {
    const q = query(lotsCollection, where("owner", "==", ownerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToLot);
}

export async function getLotsByFarmer(farmerName: string): Promise<Lot[]> {
    const q = query(lotsCollection, where("farmer", "==", farmerName));
    const querySnapshot = await getDocs(q);
    // Filter out sub-lots, so farmers only see their primary registered lots.
    return querySnapshot.docs.map(docToLot).filter(lot => !lot.parentLotId);
}

export async function getAvailableLotsForPurchase(): Promise<Lot[]> {
    // A lot is available if it is still owned by the original farmer.
    const allLots = await getAllLots();
    return allLots.filter(lot => lot.owner === lot.farmer && !lot.parentLotId);
}

export async function addLot(lot: Lot): Promise<void> {
    const { lotId, ...lotData } = lot;
    await setDoc(doc(db, "lots", lotId), lotData);
}

export async function addLots(lots: Lot[]): Promise<void> {
    const batch = writeBatch(db);
    lots.forEach(lot => {
        const { lotId, ...lotData } = lot;
        const lotRef = doc(db, "lots", lotId);
        batch.set(lotRef, lotData);
    });
    await batch.commit();
}

export async function updateLot(lotId: string, updates: Partial<Lot>): Promise<void> {
    const lotRef = doc(db, "lots", lotId);
    await updateDoc(lotRef, updates);
}

// Retail Event Functions
export async function addRetailEvent(event: Omit<RetailEvent, 'id'>): Promise<void> {
    await addDoc(retailEventsCollection, event);
}

export async function getRetailEventsForLot(lotId: string): Promise<RetailEvent[]> {
    const q = query(retailEventsCollection, where("lotId", "==", lotId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RetailEvent));
}


// Composite History Function
export async function getLotHistory(lotId: string): Promise<{ lot: Lot, parentLot?: Lot, childLots?: Lot[], retailEvents: RetailEvent[] } | null> {
    const currentLot = await getLot(lotId);
    if (!currentLot) return null;

    let parentLot: Lot | undefined = undefined;
    let parentLotId = currentLot.parentLotId;

    // Trace back to the ultimate parent if needed
    let rootLot = currentLot;
    while (rootLot.parentLotId) {
        const p = await getLot(rootLot.parentLotId);
        if (p) {
            rootLot = p;
        } else {
            break; // Stop if parent isn't found
        }
    }
    
    if (currentLot.lotId !== rootLot.lotId) {
        parentLot = rootLot;
    }


    const allLots = await getAllLots();
    const childLots = allLots.filter(l => l.parentLotId === (parentLot?.lotId || currentLot.lotId));
    
    // Find all retail events related to any of the sub-lots of the root lot
    const subLotIds = [currentLot.lotId, ...childLots.map(l => l.lotId)];
    let allRetailEvents: RetailEvent[] = [];
    if(subLotIds.length > 0) {
        const q = query(retailEventsCollection, where("lotId", "in", subLotIds));
        const querySnapshot = await getDocs(q);
        allRetailEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RetailEvent));
    }


    return {
        lot: currentLot,
        parentLot: parentLot,
        childLots: childLots.length > 0 ? childLots : undefined,
        retailEvents: allRetailEvents,
    };
}


// AI Flow Actions
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

    const result = await gradeCrop(input);
    return result;
}

export async function detectConflictAction(
    input: DistributorUpdateConflictDetectionInput
): Promise<DistributorUpdateConflictDetectionOutput> {
    const result = await distributorUpdateConflictDetection(input);
    return result;
}

// User Management Actions
export async function registerUser(user: User): Promise<{ success: boolean; message: string }> {
    const q = query(
        usersCollection, 
        where("name", "==", user.name),
        where("role", "==", user.role)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return { success: false, message: `A user with the name "${user.name}" already exists for the ${user.role} role.` };
    }

    await addDoc(usersCollection, user);
    return { success: true, message: "Registration successful! You can now log in." };
}

export async function loginUser(credentials: Omit<User, 'id'>): Promise<{ success: boolean; message: string; user?: User }> {
    let q;
    if (credentials.role === 'farmer') {
        q = query(
            usersCollection,
            where("role", "==", credentials.role),
            where("name", "==", credentials.name),
            where("identifier", "==", credentials.identifier),
            where("accessCode", "==", credentials.accessCode)
        );
    } else {
        q = query(
            usersCollection,
            where("role", "==", credentials.role),
            where("name", "==", credentials.name),
            where("accessCode", "==", credentials.accessCode)
        );
    }
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, message: "Invalid credentials. Please try again." };
    }

    const userDoc = querySnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;
    
    return { success: true, message: "Login successful!", user };
}


// Demo Actions
export async function resetData(): Promise<void> {
    // Delete all documents in the 'lots' collection
    const lotsSnapshot = await getDocs(lotsCollection);
    const deleteLotsBatch = writeBatch(db);
    lotsSnapshot.forEach(doc => {
        deleteLotsBatch.delete(doc.ref);
    });
    await deleteLotsBatch.commit();

    // Delete all documents in the 'retailEvents' collection
    const retailEventsSnapshot = await getDocs(retailEventsCollection);
    const deleteRetailEventsBatch = writeBatch(db);
    retailEventsSnapshot.forEach(doc => {
        deleteRetailEventsBatch.delete(doc.ref);
    });
    await deleteRetailEventsBatch.commit();
}
