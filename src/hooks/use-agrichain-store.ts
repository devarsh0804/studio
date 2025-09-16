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
  addTransportEvent: (lotId: string, event: TransportEvent) => void;
  addRetailEvent: (lotId: string, event: RetailEvent) => void;
  addRetailPacks: (packs: RetailPack[]) => void;
  findLot: (lotId: string) => Lot | undefined;
  findPack: (packId: string) => RetailPack | undefined;
  getLotHistory: (lotId: string) => LotHistory | null;
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
