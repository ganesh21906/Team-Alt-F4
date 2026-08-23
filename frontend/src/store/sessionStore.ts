import { create } from 'zustand';

import type { StudentLevel, UserRole } from '../lib/types';

interface SessionState {
  role: UserRole | null;
  studentLevel: StudentLevel;
  isAuthenticated: boolean;
  studentId: string | null;
  studentEmail: string | null;
  studentName: string | null;
  setRole: (role: UserRole) => void;
  setStudentLevel: (level: StudentLevel) => void;
  login: (
    role: UserRole,
    studentLevel?: StudentLevel,
    studentId?: string | null,
    studentEmail?: string | null,
    studentName?: string | null
  ) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  role: null,
  studentLevel: 'school',
  isAuthenticated: false,
  studentId: null,
  studentEmail: null,
  studentName: null,
  setRole: (role) => set({ role }),
  setStudentLevel: (studentLevel) => set({ studentLevel }),
  login: (role, studentLevel = 'school', studentId = null, studentEmail = null, studentName = null) =>
    set({ role, studentLevel, isAuthenticated: true, studentId, studentEmail, studentName }),
  logout: () =>
    set({
      role: null,
      studentLevel: 'school',
      isAuthenticated: false,
      studentId: null,
      studentEmail: null,
      studentName: null,
    }),
}));
