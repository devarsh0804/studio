
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserRole = 'FARMER' | 'DISTRIBUTOR' | 'RETAILER';

interface User {
    name: string;
    id: string;
    role: UserRole;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-session-storage',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage
    }
  )
);
