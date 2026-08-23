import { defaultWhatIfInput, facultyDashboard, mentorStudents, student, whatIfPreview } from './mockData';
import type { FacultyDashboardData, Student, StudentLevel, WhatIfInput, WhatIfResult } from './types';

const ML_SERVICE_URL = 'http://localhost:8000';

const sampleSchoolPayload = {
  school: 'GP', sex: 'F', age: 17, address: 'U', famsize: 'GT3', Pstatus: 'T',
  Medu: 4, Fedu: 4, Mjob: 'health', Fjob: 'teacher', reason: 'home', guardian: 'mother',
  traveltime: 1, studytime: 3, failures: 0, schoolsup: 'no', famsup: 'yes', paid: 'no',
  activities: 'yes', nursery: 'yes', higher: 'yes', internet: 'yes', romantic: 'no',
  famrel: 4, freetime: 3, goout: 3, Dalc: 1, Walc: 1, health: 5, absences: 2, G1: 15
};

const sampleCollegePayload = {
  Sex: 1, 'Graduated high-school type': 1, 'Scholarship type': 2, 'Additional work': 1,
  'Regular artistic or sports activity': 2, 'Do you have a partner': 2, 'Total salary if available': 1,
  'Transportation to the university': 1, 'Accomodation type in Cyprus': 1, "Mother's education": 3,
  "Father's education": 3, 'Number of sisters/brothers (if available)': 2, 'Parental status': 1,
  "Mother's occupation": 2, "Father's occupation": 2, 'Weekly study hours': 3,
  'Reading frequency (non-scientific books/journals)': 2, 'Reading frequency (scientific books/journals)': 2,
  'Attendance to the seminars/conferences related to the department': 1,
  'Impact of your projects/activities on your success': 1, 'Attendance to classes': 1,
  'Preparation to midterm exams 1': 1, 'Preparation to midterm exams 2': 1,
  'Taking notes in classes': 1, 'Listening in classes': 1,
  'Discussion improves my interest and success in the course': 1, 'Flip-classroom': 1,
  'Cumulative grade point average in the last semester (/4.00)': 3,
  'Expected Cumulative grade point average in the graduation (/4.00)': 3, 'Course ID': 1, 'Student Age': 2
};

export const fetchMlPrediction = async (studentLevel: StudentLevel = 'school') => {
  try {
    const payload = studentLevel === 'school' ? sampleSchoolPayload : sampleCollegePayload;
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_level: studentLevel, payload })
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const fetchMlWhatIf = async (input: WhatIfInput, studentLevel: StudentLevel = 'school'): Promise<WhatIfResult | null> => {
  try {
    const isSchool = studentLevel === 'school';
    const baseline = isSchool ? { ...sampleSchoolPayload } : { ...sampleCollegePayload };
    
    // Map slider inputs to scenario overrides
    const scenario: Record<string, any> = {};
    if (isSchool) {
      // Map attendance 40-100 to absences 0-25
      scenario.absences = Math.max(0, Math.round((100 - input.attendancePct) * 0.3));
      // Map assessmentScore 40-100 to G1 (0-20)
      scenario.G1 = Math.round((input.assessmentScore / 100) * 20);
      // Map assignmentScore to studytime 1-4
      scenario.studytime = input.assignmentScore > 85 ? 4 : input.assignmentScore > 70 ? 3 : input.assignmentScore > 50 ? 2 : 1;
    } else {
      scenario['Attendance to classes'] = input.attendancePct > 80 ? 1 : 2;
      scenario['Preparation to midterm exams 1'] = input.assessmentScore > 75 ? 1 : 2;
      scenario['Weekly study hours'] = input.assignmentScore > 80 ? 4 : input.assignmentScore > 60 ? 3 : 2;
    }

    const response = await fetch(`${ML_SERVICE_URL}/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_level: studentLevel,
        baseline_payload: baseline,
        scenario_payload: scenario
      })
    });

    if (!response.ok) return null;
    const res = await response.json();

    return {
      currentScore: res.current_predicted_score,
      simulatedScore: res.scenario_predicted_score,
      predictedRisk: res.scenario_risk_level.toLowerCase() as 'low' | 'medium' | 'high',
      deltaFromCurrent: res.score_difference,
      scenarioLabel: `Model Scenario (${res.model_version || 'Production ML Pipeline'})`,
      explanation: res.summary
    };
  } catch {
    return null;
  }
};

export const mockPredict = async (input: WhatIfInput, studentLevel: StudentLevel = 'school'): Promise<WhatIfResult> => {
  // Try real ML API first
  const realRes = await fetchMlWhatIf(input, studentLevel);
  if (realRes) return realRes;

  // Fallback to local calculation if ML service is unreachable
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
    scenarioLabel: 'Model-simulated scenario (Local Fallback)',
    explanation:
      'This estimate models a likely outcome if attendance, assessment performance, and assignment completion improve in line with the selected scenario.',
  };
};

export const api = {
  getStudentProfile: async (studentLevel: StudentLevel = 'school'): Promise<Student> => {
    const mlRes = await fetchMlPrediction(studentLevel);
    if (mlRes) {
      const isSchool = studentLevel === 'school';
      return {
        ...student,
        studentLevel,
        performanceScore: isSchool ? Math.round(mlRes.predicted_score * 5) : Math.round(mlRes.predicted_score),
        riskLevel: mlRes.risk_level.toLowerCase() as 'low' | 'medium' | 'high',
        recommendations: mlRes.recommended_interventions.map((text: string, idx: number) => ({
          id: `ml-rec-${idx}`,
          title: `Intervention Recommendation #${idx + 1}`,
          priority: idx === 0 ? 'high' : 'medium',
          text,
          action: 'Follow AI guidance'
        })),
        riskFactors: mlRes.top_factors.map((factor: any, idx: number) => ({
          id: `ml-factor-${idx}`,
          label: factor.feature_display_name,
          impact: factor.direction,
          magnitude: Math.round(Math.abs(factor.impact) * 20),
          detail: factor.description
        }))
      };
    }
    return { ...student, studentLevel };
  },
  getStudentById: async (id: string): Promise<Student | undefined> => mentorStudents.find((entry) => entry.id === id),
  getFacultyDashboard: async (): Promise<FacultyDashboardData> => facultyDashboard,
  getAtRiskStudents: async (): Promise<Student[]> => mentorStudents.filter((entry) => entry.riskLevel !== 'low'),
  getWhatIfPreview: async (): Promise<WhatIfResult> => whatIfPreview,
  getDefaultWhatIfInput: async (): Promise<WhatIfInput> => defaultWhatIfInput,
  predictWhatIf: mockPredict,
};
