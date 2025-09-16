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
        
        updateLot: (lotId, updates) =>
            set((state) => {
                if (state.lots[lotId]) {
                    return {
                        lots: {
                            ...state.lots,
                            [lotId]: { ...state.lots[lotId], ...updates },
                        },
                    };
                }
                return state;
            }),

        addTransportEvent: (lotId, event) =>
          set((state) => ({
            transportEvents: {
              ...state.transportEvents,
              [lotId]: [...(state.transportEvents[lotId] || []), event],
            },
          })),

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

        findLot: (lotId) => get().lots[lotId],

        findPack: (packId) => get().retailPacks[packId],
        
        getAllLots: () => Object.values(get().lots).sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()),

        getLotHistory: (lotId) => {
          const lot = get().findLot(lotId);
          if (!lot) return null;
          
          const transport = get().transportEvents[lotId] || [];
          const retail = get().retailEvents[lotId] || [];

          return {
            lot,
            transportEvents: transport,
            retailEvents: retail,
          };
        },
      }),
      {
        name: 'agrichain-storage',
      }
    )
  )
);
