import type { FacultyDashboardData, Student, StudentLevel, WhatIfInput, WhatIfResult } from './types';

const ML_SERVICE_URL = 'http://localhost:8000';

const sampleSchoolPayload = {
  school: 'GP', sex: 'F', age: 17, address: 'U', famsize: 'GT3', Pstatus: 'T',
  Medu: 4, Fedu: 4, Mjob: 'health', Fjob: 'teacher', reason: 'home', guardian: 'mother',
  traveltime: 1, studytime: 3, failures: 0, schoolsup: 'no', famsup: 'yes', paid: 'no',
  activities: 'yes', nursery: 'yes', higher: 'yes', internet: 'yes', romantic: 'no',
  famrel: 4, freetime: 3, goout: 3, Dalc: 1, Walc: 1, health: 5, absences: 2, G1: 15, G2: 14,
  course_subject: 'Math'
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

export const api = {
  getStudentProfile: async (studentLevel: StudentLevel = 'school', studentId?: string | null): Promise<Student> => {
    try {
      if (studentId) {
        const res = await fetch(`${ML_SERVICE_URL}/api/students/${studentId}`);
        if (res.ok) return await res.json();
      }
      
      // Fallback: Query all students of this level and pick the first one
      const listRes = await fetch(`${ML_SERVICE_URL}/api/students?level=${studentLevel}`);
      if (listRes.ok) {
        const list = await listRes.json();
        if (list && list.length > 0) {
          return list[0];
        }
      }
      throw new Error("No student records available from backend.");
    } catch (err) {
      console.error("Failed to fetch student profile, using static fallback", err);
      // Basic static fallback
      return {
        id: studentId || 'st-default',
        name: 'Demo Student',
        className: studentLevel === 'school' ? 'Class 10-A' : 'Computer Science',
        email: 'demo@edupulse.ai',
        studentLevel,
        gpa: 8.5,
        attendancePct: 90,
        riskLevel: 'low',
        riskScore: 15,
        performanceScore: 85,
        subjects: [],
        weeklyTrend: [],
        upcomingExams: [],
        recommendations: [],
        riskFactors: [],
        prediction: {
          studentId: studentId || 'st-default',
          predictedScore: 85,
          riskLevel: 'low',
          confidence: 0.9,
          summary: 'Fallback static profile loaded.',
          generatedAt: new Date().toISOString(),
          riskFactors: []
        }
      };
    }
  },

  getStudentById: async (id: string): Promise<Student | undefined> => {
    try {
      const res = await fetch(`${ML_SERVICE_URL}/api/students/${id}`);
      if (res.ok) return await res.json();
      return undefined;
    } catch {
      return undefined;
    }
  },

  getFacultyDashboard: async (studentLevel: StudentLevel = 'school'): Promise<FacultyDashboardData> => {
    try {
      const res = await fetch(`${ML_SERVICE_URL}/api/mentor/dashboard?level=${studentLevel}`);
      if (res.ok) return await res.json();
      throw new Error("Failed to fetch faculty dashboard data.");
    } catch (err) {
      console.error(err);
      return {
        totalStudents: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        riskDistribution: [],
        students: [],
        interventions: [],
        summary: 'Failed to connect to backend service.'
      };
    }
  },

  getAtRiskStudents: async (studentLevel: StudentLevel = 'school'): Promise<Student[]> => {
    try {
      const res = await fetch(`${ML_SERVICE_URL}/api/students?level=${studentLevel}&risk_level=high`);
      if (res.ok) return await res.json();
      return [];
    } catch {
      return [];
    }
  },

  getStudentsByLevel: async (studentLevel: StudentLevel = 'school'): Promise<Student[]> => {
    try {
      const res = await fetch(`${ML_SERVICE_URL}/api/students?level=${studentLevel}`);
      if (res.ok) return await res.json();
      return [];
    } catch {
      return [];
    }
  },

  predictWhatIf: async (input: WhatIfInput, studentLevel: StudentLevel = 'school', studentId?: string | null): Promise<WhatIfResult> => {
    try {
      // Map sliders to model-ready features
      const scenario: Record<string, any> = {};
      const isSchool = studentLevel === 'school';
      
      if (isSchool) {
        scenario.absences = Math.max(0, Math.round((100 - input.attendancePct) * 0.3));
        scenario.G1 = Math.round((input.assessmentScore / 100) * 20);
        scenario.studytime = input.assignmentScore > 85 ? 4 : input.assignmentScore > 70 ? 3 : input.assignmentScore > 50 ? 2 : 1;
      } else {
        scenario['Attendance to classes'] = input.attendancePct > 80 ? 1 : 2;
        scenario['Preparation to midterm exams 1'] = input.assessmentScore > 75 ? 1 : 2;
        scenario['Weekly study hours'] = input.assignmentScore > 80 ? 4 : input.assignmentScore > 60 ? 3 : 2;
      }

      const bodyPayload: Record<string, any> = {
        student_level: studentLevel,
        scenario_payload: scenario
      };

      if (studentId) {
        bodyPayload.student_id = studentId;
      } else {
        bodyPayload.baseline_payload = isSchool ? sampleSchoolPayload : sampleCollegePayload;
      }

      const response = await fetch(`${ML_SERVICE_URL}/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) throw new Error("Simulation request failed.");
      const res = await response.json();

      // Return simulated outcome
      const simulatedScore = isSchool ? Math.round(res.scenario_predicted_score * 5) : Math.round(res.scenario_predicted_score);
      const currentScore = isSchool ? Math.round(res.current_predicted_score * 5) : Math.round(res.current_predicted_score);
      const deltaFromCurrent = Math.max(0, Math.round(((simulatedScore - currentScore) / (currentScore || 1)) * 100));

      return {
        currentScore,
        simulatedScore,
        predictedRisk: res.scenario_risk_level.toLowerCase() as 'low' | 'medium' | 'high',
        deltaFromCurrent,
        scenarioLabel: `Model Scenario (${res.model_version || 'Production Pipeline'})`,
        explanation: res.summary
      };
    } catch (err) {
      console.error("Simulation failed, falling back to local mock", err);
      const attendanceBoost = (input.attendancePct - 88) * 0.6;
      const assessmentBoost = (input.assessmentScore - 78) * 0.7;
      const assignmentBoost = (input.assignmentScore - 72) * 0.8;

      const simulatedScore = Math.min(
        100,
        Math.max(40, Math.round(84 + attendanceBoost + assessmentBoost + assignmentBoost)),
      );

      return {
        currentScore: 84,
        simulatedScore,
        predictedRisk: simulatedScore >= 82 ? 'low' : simulatedScore >= 68 ? 'medium' : 'high',
        deltaFromCurrent: Math.max(0, Math.round(((simulatedScore - 84) / 84) * 100)),
        scenarioLabel: 'Scenario simulation (Local Fallback)',
        explanation: 'Failed to connect to backend What-If service. Displaying client-calculated local projection.'
      };
    }
  },

  verifyLogin: async (role: 'student' | 'mentor', email?: string, studentLevel: StudentLevel = 'school') => {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, student_level: studentLevel })
      });
      if (response.ok) return await response.json();
      throw new Error("Authentication failed.");
    } catch (err) {
      console.error(err);
      return { authenticated: false };
    }
  },

  addTask: async (studentId: string, text: string) => {
    const response = await fetch(`${ML_SERVICE_URL}/api/students/${studentId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!response.ok) throw new Error("Failed to add task");
    return response.json();
  },

  toggleTask: async (studentId: string, taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
    const response = await fetch(`${ML_SERVICE_URL}/api/students/${studentId}/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, status })
    });
    if (!response.ok) throw new Error("Failed to toggle task");
    return response.json();
  },

  addIntervention: async (studentId: string, title: string, priority: string, text: string, action: string) => {
    const response = await fetch(`${ML_SERVICE_URL}/api/students/${studentId}/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority, text, action })
    });
    if (!response.ok) throw new Error("Failed to add intervention");
    return response.json();
  },

  getThresholds: async () => {
    const response = await fetch(`${ML_SERVICE_URL}/api/thresholds`);
    if (!response.ok) throw new Error("Failed to get thresholds");
    return response.json();
  },

  updateThresholds: async (thresholds: { school_high: number, school_medium: number, college_high: number, college_medium: number }) => {
    const response = await fetch(`${ML_SERVICE_URL}/api/thresholds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thresholds)
    });
    if (!response.ok) throw new Error("Failed to update thresholds");
    return response.json();
  },

  getModelDiagnostics: async () => {
    const response = await fetch(`${ML_SERVICE_URL}/api/model-diagnostics`);
    if (!response.ok) throw new Error("Failed to get model diagnostics");
    return response.json();
  }
};
