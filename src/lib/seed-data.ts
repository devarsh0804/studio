
import type { Lot } from './types';
import { placeHolderImages } from './placeholder-images';
import { format } from 'date-fns';

const cropImage = placeHolderImages.find(p => p.id === 'crop1');

export const seedLots: Lot[] = [];
