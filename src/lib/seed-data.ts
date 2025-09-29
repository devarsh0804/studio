
import type { Lot } from './types';
import { placeHolderImages } from './placeholder-images';
import { format } from 'date-fns';

const cropImage = placeHolderImages.find(p => p.id === 'crop1');

export const seedLots: Lot[] = [
  {
    lotId: `LOT-${format(new Date(), 'yyyyMMdd')}-001`,
    farmer: 'Ramesh',
    cropName: 'Wheat',
    location: 'Bhubaneswar, Odisha',
    weight: 20,
    harvestDate: format(new Date(), 'yyyy-MM-dd'),
    price: 2100,
    owner: 'Ramesh',
    photoUrl: cropImage?.imageUrl || '',
    quality: 'Premium',
    gradingDate: new Date().toISOString(),
    status: 'Registered',
    moisture: '12%',
    impurities: '0.5%',
    size: 'Uniform Medium',
    color: 'Golden Brown',
    paymentStatus: 'Unpaid',
  },
  {
    lotId: `LOT-${format(new Date(), 'yyyyMMdd')}-002`,
    farmer: 'Ramesh',
    cropName: 'Paddy',
    location: 'Bhubaneswar, Odisha',
    weight: 30,
    harvestDate: format(new Date(new Date().setDate(new Date().getDate() - 5)), 'yyyy-MM-dd'),
    price: 1950,
    owner: 'distro', // This lot is already purchased by the distributor
    photoUrl: "https://picsum.photos/seed/paddy/600/400",
    quality: 'Standard',
    gradingDate: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    status: 'Purchased',
    moisture: '14%',
    impurities: '1.2%',
    size: 'Mixed',
    color: 'Light Brown',
    paymentStatus: 'Fully Paid', // Paid by distributor to farmer
  },
  {
    lotId: `LOT-${format(new Date(), 'yyyyMMdd')}-003`,
    farmer: 'Suresh',
    cropName: 'Corn',
    location: 'Cuttack, Odisha',
    weight: 15,
    harvestDate: format(new Date(new Date().setDate(new Date().getDate() - 10)), 'yyyy-MM-dd'),
    price: 1800,
    owner: 'Suresh',
    photoUrl: "https://picsum.photos/seed/corn/600/400",
    quality: 'Standard',
    gradingDate: new Date(new Date().setDate(new Date().getDate() - 9)).toISOString(),
    status: 'Registered',
    moisture: '13.5%',
    impurities: '1.0%',
    size: 'Uniform Large',
    color: 'Yellow',
    paymentStatus: 'Unpaid',
  },
  // Sub-lot created from the purchased Paddy lot
  {
    lotId: `LOT-${format(new Date(), 'yyyyMMdd')}-002-SUB-001`,
    parentLotId: `LOT-${format(new Date(), 'yyyyMMdd')}-002`,
    farmer: 'Ramesh',
    cropName: 'Paddy',
    location: 'Bhubaneswar, Odisha',
    weight: 15,
    harvestDate: format(new Date(new Date().setDate(new Date().getDate() - 5)), 'yyyy-MM-dd'),
    price: 1950,
    owner: 'retail', // This sub-lot is owned by the retailer
    photoUrl: "https://picsum.photos/seed/paddy/600/400",
    quality: 'Standard',
    gradingDate: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    status: 'Delivered', // Delivered to retailer
    moisture: '14%',
    impurities: '1.2%',
    size: 'Mixed',
    color: 'Light Brown',
    paymentStatus: 'Fully Paid', // Paid by retailer to distributor
    logisticsInfo: {
        vehicleNumber: "OR-02-XY-5678",
        dispatchDate: format(new Date(new Date().setDate(new Date().getDate() - 2)), 'yyyy-MM-dd'),
    }
  },
   // Sub-lot created from the purchased Paddy lot, awaiting payment from retailer
  {
    lotId: `LOT-${format(new Date(), 'yyyyMMdd')}-002-SUB-002`,
    parentLotId: `LOT-${format(new Date(), 'yyyyMMdd')}-002`,
    farmer: 'Ramesh',
    cropName: 'Paddy',
    location: 'Bhubaneswar, Odisha',
    weight: 15,
    harvestDate: format(new Date(new Date().setDate(new Date().getDate() - 5)), 'yyyy-MM-dd'),
    price: 1950,
    owner: 'distro', // Still owned by distributor
    photoUrl: "https://picsum.photos/seed/paddy/600/400",
    quality: 'Standard',
    gradingDate: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    status: 'Split', // Ready for purchase
    moisture: '14%',
    impurities: '1.2%',
    size: 'Mixed',
    color: 'Light Brown',
    paymentStatus: 'Unpaid',
  }
];
