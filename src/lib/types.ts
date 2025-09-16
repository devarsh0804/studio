export interface Lot {
  lotId: string;
  farmer: string;
  cropName: string;
  weight: number; // in quintals
  harvestDate: string;
  photoUrl: string;
  price: number; // per quintal
  quality: string;
  owner?: string; // e.g., 'farmer', 'distributor-1', etc.
  location?: string;
  parentLotId?: string; // To link sub-lots to their origin
}

export interface TransportEvent {
  vehicleNumber: string;
  transportCondition: 'Cold Storage' | 'Normal';
  warehouseEntryDateTime: string;
  timestamp: string;
}

export interface RetailEvent {
  storeId: string;
  shelfDate: string;
  timestamp: string;
}

export interface RetailPack {
  packId: string;
  parentLotId: string;
  weight: number;
}

export interface LotHistory {
  lot: Lot;
  transportEvents: TransportEvent[];
  retailEvents: RetailEvent[];
  parentLot?: Lot;
  childLots?: Lot[];
}
