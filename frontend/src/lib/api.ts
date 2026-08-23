import { defaultWhatIfInput, facultyDashboard, mentorStudents, student, whatIfPreview } from './mockData';
import type { FacultyDashboardData, Student, WhatIfInput, WhatIfResult } from './types';

export const mockPredict = async (input: WhatIfInput): Promise<WhatIfResult> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const attendanceBoost = (input.attendancePct - student.attendancePct) * 0.6;
  const assessmentBoost = (input.assessmentScore - 78) * 0.7;
  const assignmentBoost = (input.assignmentScore - 72) * 0.8;

  const simulatedScore = Math.min(
    100,
    Math.max(40, Math.round(student.performanceScore + attendanceBoost + assessmentBoost + assignmentBoost)),
  );

  const predictedRisk = simulatedScore >= 82 ? 'low' : simulatedScore >= 68 ? 'medium' : 'high';
  const deltaFromCurrent = Math.max(0, Math.round(((simulatedScore - student.performanceScore) / student.performanceScore) * 100));

  return {
    currentScore: student.performanceScore,
    simulatedScore,
    predictedRisk,
    deltaFromCurrent,
    scenarioLabel: 'Model-simulated scenario',
    explanation:
      'This estimate models a likely outcome if attendance, assessment performance, and assignment completion improve in line with the selected scenario.',
  };
};

export const api = {
  getStudentProfile: async (): Promise<Student> => student,
  getStudentById: async (id: string): Promise<Student | undefined> => mentorStudents.find((entry) => entry.id === id),
  getFacultyDashboard: async (): Promise<FacultyDashboardData> => facultyDashboard,
  getAtRiskStudents: async (): Promise<Student[]> => mentorStudents.filter((entry) => entry.riskLevel !== 'low'),
  getWhatIfPreview: async (): Promise<WhatIfResult> => whatIfPreview,
  getDefaultWhatIfInput: async (): Promise<WhatIfInput> => defaultWhatIfInput,
  predictWhatIf: mockPredict,
};
