
export interface Lot {
  lotId: string;
  farmer: string;
  cropName: string;
  weight: number; // in quintals
  harvestDate: string;
  photoUrl: string;
  price: number; // per quintal
  owner?: string; // e.g., 'farmer', 'distributor-1', etc.
  location?: string;
  parentLotId?: string; // To link sub-lots to their origin
  logisticsInfo?: {
    vehicleNumber: string;
    dispatchDate: string;
  };

  // Digital Certificate Fields
  quality: string; // The final grade: Premium, Standard, Basic
  gradingDate: string;
  moisture?: string;
  impurities?: string;
  size?: string;
  color?: string;
  status?: 'Registered' | 'Purchased' | 'Split' | 'Awaiting Advance Payment' | 'Dispatched' | 'Stocked' | 'Delivered';
  paymentStatus?: 'Unpaid' | 'Advance Paid' | 'Fully Paid';
}

export interface GradedLot extends Omit<Lot, 'price' | 'owner'> {}


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
  retailEvents: RetailEvent[];
  parentLot?: Lot;
  childLots?: Lot[];
}
