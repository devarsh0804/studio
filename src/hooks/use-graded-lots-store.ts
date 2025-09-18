'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GradedLot } from '@/lib/types';

interface GradedLotsState {
  gradedLots: Record<string, GradedLot>;
  addLot: (lot: GradedLot) => void;
  findAndRemoveLot: (lotId: string) => GradedLot | undefined;
}

export const useGradedLotsStore = create<GradedLotsState>()(
  devtools(
    persist(
      (set, get) => ({
        gradedLots: {},

        addLot: (lot) =>
          set((state) => ({
            gradedLots: { ...state.gradedLots, [lot.lotId]: lot },
          })),
        
        findAndRemoveLot: (lotId) => {
            const lot = get().gradedLots[lotId];
            if (lot) {
                set((state) => {
                    const newLots = { ...state.gradedLots };
                    delete newLots[lotId];
                    return { gradedLots: newLots };
                });
            }
            return lot;
        }
      }),
      {
        name: 'graded-lots-storage',
      }
    )
  )
);
