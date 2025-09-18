'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Lot, RetailEvent, RetailPack, LotHistory } from '@/lib/types';

interface AgriChainState {
  lots: Record<string, Lot>;
  retailEvents: Record<string, RetailEvent[]>;
  retailPacks: Record<string, RetailPack>;
  addLot: (lot: Lot) => void;
  addLots: (lots: Lot[]) => void;
  updateLot: (lotId: string, updates: Partial<Lot>) => void;
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

        addRetailEvent: (lotId, event) =>
          set((state) => {
            const lot = get().findLot(lotId);
            if (!lot) return state;
            
            const parentLotId = lot.parentLotId || lot.lotId;

            return {
                retailEvents: {
                ...state.retailEvents,
                [parentLotId]: [...(state.retailEvents[parentLotId] || []), event],
                },
            };
          }),
        
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
              return pack ? get().lots[pack.parentLotId] : undefined;
           }
           
           return undefined;
        },

        findPack: (packId) => get().retailPacks[packId],
        
        getAllLots: () => Object.values(get().lots).sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()),

        getLotHistory: (id) => {
          let currentLot: Lot | undefined;
          
          if (id.startsWith('PACK-')) {
            const pack = get().findPack(id);
            if(pack) {
              currentLot = get().findLot(pack.parentLotId); 
            }
          } else {
            currentLot = get().findLot(id);
          }
          
          if (!currentLot) return null;
          
          let lotHierarchy: Lot[] = [currentLot];
          let tempLot = currentLot;
          while (tempLot.parentLotId && get().lots[tempLot.parentLotId]) {
            tempLot = get().lots[tempLot.parentLotId]!;
            lotHierarchy.unshift(tempLot);
          }
          
          const parentLot = lotHierarchy[0];

          const retail = get().retailEvents[parentLot.lotId] || [];
          const childLots = Object.values(get().lots).filter(l => l.parentLotId === parentLot.lotId);

          return {
            lot: currentLot, 
            retailEvents: retail,
            parentLot: parentLot.lotId !== currentLot.lotId ? parentLot : undefined,
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
