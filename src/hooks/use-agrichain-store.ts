'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Lot, TransportEvent, RetailEvent, RetailPack, LotHistory } from '@/lib/types';

interface AgriChainState {
  lots: Record<string, Lot>;
  transportEvents: Record<string, TransportEvent[]>;
  retailEvents: Record<string, RetailEvent[]>;
  retailPacks: Record<string, RetailPack>;
  addLot: (lot: Lot) => void;
  addLots: (lots: Lot[]) => void;
  updateLot: (lotId: string, updates: Partial<Lot>) => void;
  addTransportEvent: (lotId: string, event: TransportEvent) => void;
  addRetailEvent: (lotId: string, event: RetailEvent) => void;
  addRetailPacks: (packs: RetailPack[]) => void;
  findLot: (lotId: string) => Lot | undefined;
  findPack: (packId: string) => RetailPack | undefined;
  getLotHistory: (lotId: string) => LotHistory | null;
  getAllLots: () => Lot[];
}

export const useAgriChainStore = create<AgriChainState>()(
  devtools(
    persist(
      (set, get) => ({
        lots: {},
        transportEvents: {},
        retailEvents: {},
        retailPacks: {},

        addLot: (lot) =>
          set((state) => ({
            lots: { ...state.lots, [lot.lotId]: lot },
          })),
        
        addLots: (lots) =>
          set((state) => {
            const newLots = lots.reduce((acc, lot) => {
                acc[lot.lotId] = lot;
                return acc;
            }, {} as Record<string, Lot>);
            return {
                lots: { ...state.lots, ...newLots }
            };
          }),
        
        updateLot: (lotId, updates) =>
            set((state) => {
                if (state.lots[lotId]) {
                    const updatedLots = {
                        ...state.lots,
                        [lotId]: { ...state.lots[lotId], ...updates },
                    };
                    return { lots: updatedLots };
                }
                return state;
            }),

        addTransportEvent: (lotId, event) =>
          set((state) => {
            // Find the lot to associate the event with the entire history
            const lot = get().findLot(lotId);
            if (!lot) return state;

            // If it's a sub-lot, associate with the parent lot
            const parentId = lot.parentLotId || lotId;

            return {
              transportEvents: {
                ...state.transportEvents,
                [parentId]: [...(state.transportEvents[parentId] || []), event],
              },
            }
          }),

        addRetailEvent: (lotId, event) =>
          set((state) => ({
            retailEvents: {
              ...state.retailEvents,
              [lotId]: [...(state.retailEvents[lotId] || []), event],
            },
          })),
        
        addRetailPacks: (packs) => 
          set((state) => {
            const newPacks = packs.reduce((acc, pack) => {
              acc[pack.packId] = pack;
              return acc;
            }, {} as Record<string, RetailPack>);
            return {
              retailPacks: { ...state.retailPacks, ...newPacks }
            };
          }),

        findLot: (lotId) => {
           if (!lotId) return undefined;
           
           const lot = get().lots[lotId];
           if (lot) return lot;

           if (lotId.startsWith('PACK-')) {
              const pack = get().retailPacks[lotId];
              // Return the specific sub-lot it came from, or the parent lot
              return pack ? get().lots[pack.parentLotId] : undefined;
           }
           
           return get().lots[lotId];
        },

        findPack: (packId) => get().retailPacks[packId],
        
        getAllLots: () => Object.values(get().lots).sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()),

        getLotHistory: (id) => {
          let lot: Lot | undefined;
          
          if (id.startsWith('PACK-')) {
            const pack = get().findPack(id);
            if(pack) {
              lot = get().findLot(pack.parentLotId); 
            }
          } else {
            lot = get().findLot(id);
          }
          
          if (!lot) return null;
          
          // History is tracked on the top-level parent lot
          const parentLotId = lot.parentLotId || lot.lotId;
          const parentLot = get().lots[parentLotId];

          const transport = get().transportEvents[parentLotId] || [];
          const retail = get().retailEvents[parentLotId] || [];
          const childLots = Object.values(get().lots).filter(l => l.parentLotId === parentLotId);

          return {
            lot, // The specific lot we looked up (could be a sub-lot)
            transportEvents: transport,
            retailEvents: retail,
            parentLot: parentLotId !== lot.lotId ? parentLot : undefined,
            childLots,
          };
        },
      }),
      {
        name: 'agrichain-storage',
      }
    )
  )
);
