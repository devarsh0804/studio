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
  findLot: (lotId: string, findExact?: boolean) => Lot | undefined;
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
            // Find the parent lot to associate the event with the entire history
            const lot = get().findLot(lotId, true);
            const parentId = lot?.parentLotId || lotId;

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

        findLot: (lotId, findExact = false) => {
           if (!lotId) return undefined;
           
           if(findExact){
              return get().lots[lotId];
           }

           // Handle finding sub-lots or packs and returning the parent
           if (lotId.startsWith('PACK-')) {
              const pack = get().retailPacks[lotId];
              return pack ? get().lots[pack.parentLotId] : undefined;
           }
            if (lotId.includes('-SUB-')) {
                const parentId = lotId.split('-SUB-')[0];
                return get().lots[parentId];
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
          
          const transport = get().transportEvents[lot.lotId] || [];
          const retail = get().retailEvents[lot.lotId] || [];
          const parentLot = lot.parentLotId ? get().findLot(lot.parentLotId, true) : undefined;
          const childLots = Object.values(get().lots).filter(l => l.parentLotId === lot.lotId);

          return {
            lot,
            transportEvents: transport,
            retailEvents: retail,
            parentLot,
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

    