export type RiskLevel = 'low' | 'medium' | 'high';
export type Trend = 'up' | 'down' | 'flat';
export type UserRole = 'student' | 'mentor';
export type StudentLevel = 'school' | 'college';
export type RiskImpact = 'positive' | 'negative';
export type RecommendationPriority = 'low' | 'medium' | 'high';

export interface RiskFactor {
  id: string;
  label: string;
  impact: RiskImpact;
  magnitude: number;
  detail: string;
}

export interface Prediction {
  studentId: string;
  predictedScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  summary: string;
  generatedAt: string;
  riskFactors: RiskFactor[];
}

export interface Recommendation {
  id: string;
  title: string;
  priority: RecommendationPriority;
  text: string;
  action: string;
}

export interface SubjectProgress {
  subject: string;
  currentScore: number;
  trend: Trend;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  email: string;
  studentLevel?: StudentLevel;
  avatarUrl?: string;
  gpa: number;
  attendancePct: number;
  riskLevel: RiskLevel;
  riskScore: number;
  performanceScore: number;
  subjects: SubjectProgress[];
  weeklyTrend: { week: string; score: number }[];
  upcomingExams: { subject: string; date: string }[];
  recommendations: Recommendation[];
  riskFactors: RiskFactor[];
  prediction: Prediction;
}

export interface WhatIfInput {
  attendancePct: number;
  assessmentScore: number;
  assignmentScore: number;
  studyHours?: number;
}

export interface WhatIfResult {
  currentScore: number;
  simulatedScore: number;
  predictedRisk: RiskLevel;
  deltaFromCurrent: number;
  scenarioLabel: string;
  explanation: string;
}

export interface FacultyStudentRow {
  id: string;
  name: string;
  className: string;
  email: string;
  gpa: number;
  attendancePct: number;
  riskLevel: RiskLevel;
  riskScore: number;
  lastUpdated: string;
  priority: RecommendationPriority;
}

export interface FacultyDashboardData {
  totalStudents: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  riskDistribution: { level: RiskLevel; count: number }[];
  students: FacultyStudentRow[];
  interventions: Recommendation[];
  summary: string;
}

export interface CohortSummary {
  totalStudents: number;
  highRiskCount: number;
  avgGpa: number;
  riskDistribution: { level: RiskLevel; count: number }[];
}
