export interface Lot {
  lotId: string;
  farmer: string;
  cropName: string;
  weight: number;
  harvestDate: string;
  photoUrl: string;
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
}
