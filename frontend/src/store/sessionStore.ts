import { create } from 'zustand';

import type { UserRole } from '../lib/types';

interface SessionState {
  role: UserRole | null;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  role: null,
  isAuthenticated: false,
  setRole: (role) => set({ role }),
  login: (role) => set({ role, isAuthenticated: true }),
  logout: () => set({ role: null, isAuthenticated: false }),
}));
