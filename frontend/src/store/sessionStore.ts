import { create } from 'zustand';

import type { StudentLevel, UserRole } from '../lib/types';

interface SessionState {
  role: UserRole | null;
  studentLevel: StudentLevel;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  setStudentLevel: (level: StudentLevel) => void;
  login: (role: UserRole, studentLevel?: StudentLevel) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  role: null,
  studentLevel: 'school',
  isAuthenticated: false,
  setRole: (role) => set({ role }),
  setStudentLevel: (studentLevel) => set({ studentLevel }),
  login: (role, studentLevel = 'school') => set({ role, studentLevel, isAuthenticated: true }),
  logout: () => set({ role: null, studentLevel: 'school', isAuthenticated: false }),
}));
