import { ArrowRight, BookOpen, GraduationCap, LockKeyhole, School, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { StudentLevel } from '../lib/types';
import { useSessionStore } from '../store/sessionStore';
import { api } from '../lib/api';

interface DemoStudent {
  name: string;
  email: string;
  level: StudentLevel;
  riskLabel: string;
  avatar: string;
}

const demoStudents: DemoStudent[] = [
  {
    name: 'Aanya Sharma',
    email: 'aanya.sharma0@edupulse.ai',
    level: 'school',
    riskLabel: 'Low Risk (GP School)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
  },
  {
    name: 'Priya Das',
    email: 'priya.das3@edupulse.ai',
    level: 'school',
    riskLabel: 'High Risk (Support Target)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'
  },
  {
    name: 'Kabir Sharma',
    email: 'kabir.sharma0@edupulse.ai',
    level: 'college',
    riskLabel: 'Low Risk (Engineering)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
  },
  {
    name: 'Rohan Iyer',
    email: 'rohan.iyer1@edupulse.ai',
    level: 'college',
    riskLabel: 'Medium Risk (Engineering)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
  }
];

export function RolePicker() {
  const navigate = useNavigate();
  const { login } = useSessionStore();
  const [selectedRole, setSelectedRole] = useState<'student' | 'mentor' | null>(null);
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('school');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: 'student' | 'mentor') => {
    setSelectedRole(role);
    setAuthError(null);
  };

  const handleQuickLogin = (demo: DemoStudent) => {
    setStudentLevel(demo.level);
    setEmail(demo.email);
    setPassword('demo-access');
    setAuthError(null);
    
    // Execute login sequence
    void triggerLogin('student', demo.level, demo.email);
  };

  const triggerLogin = async (role: 'student' | 'mentor', level: StudentLevel, emailVal: string) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await api.verifyLogin(role, emailVal, level);
      if (res && res.authenticated) {
        login(role, level, res.studentId, emailVal, res.studentName);
        navigate(role === 'student' ? '/student/dashboard' : '/mentor/dashboard');
      } else {
        setAuthError('Authentication failed. Student record not found in the UCI dataset.');
      }
    } catch {
      setAuthError('Could not connect to the backend ML service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRole || !email.trim() || !password.trim()) {
      return;
    }

    void triggerLogin(selectedRole, studentLevel, email);
  };

  return (
    <div className="mx-auto max-w-[1040px] px-6 py-12">
      <div className="rounded-[20px] border border-[var(--line)] bg-[var(--paper)] p-7 sm:p-10">
        <p className="eyebrow">Choose your access</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[var(--ink)] sm:text-4xl">Continue as a student or mentor.</h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`group rounded-[12px] border p-6 text-left transition duration-200 ${
              selectedRole === 'student'
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:-translate-y-1'
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--accent-soft)] text-[var(--accent)]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--ink)]">I’m a Student</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">See your live performance forecast, review recommendations, and explore what-if improvements.</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              Select student access <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('mentor')}
            className={`group rounded-[12px] border p-6 text-left transition duration-200 ${
              selectedRole === 'mentor'
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:-translate-y-1'
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--ink)]">I’m a Mentor</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">Track cohort health, prioritize interventions, and drill into a student’s profile with context.</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              Select mentor access <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {selectedRole ? (
          <div className="mt-8 rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--ink)] text-[var(--paper)]">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <div>
                <p className="eyebrow">Authentication</p>
                <h2 className="text-xl font-bold text-[var(--ink)]">Secure access for {selectedRole === 'student' ? 'students' : 'mentors'}</h2>
              </div>
            </div>

            {/* Quick Login Section */}
            {selectedRole === 'student' && (
              <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-3">
                  Or Quick Login as a Demo Student
                </label>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {demoStudents.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleQuickLogin(demo)}
                      className="flex flex-col items-center text-center p-3 rounded-[10px] border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition text-left"
                    >
                      <img src={demo.avatar} alt={demo.name} className="h-10 w-10 rounded-full object-cover mb-2" />
                      <p className="text-xs font-bold text-[var(--ink)] leading-tight">{demo.name}</p>
                      <p className="text-[10px] text-[var(--ink-soft)] mt-1 capitalize">{demo.level} Student</p>
                      <p className="text-[9px] text-[var(--accent)] mt-0.5 font-medium">{demo.riskLabel}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedRole === 'mentor' && (
              <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-3">
                  Or Quick Login as a Demo Mentor
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('mentor@edupulse.ai');
                    setPassword('demo-access');
                    void triggerLogin('mentor', studentLevel, 'mentor@edupulse.ai');
                  }}
                  className="flex items-center gap-3 p-3 w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-sm">MP</div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[var(--ink)]">Dr. Amit Patel (Mentor)</p>
                    <p className="text-[9px] text-[var(--ink-soft)]">Click to login & access full cohort analytics</p>
                  </div>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Education Level Selector */}
              {selectedRole === 'student' && (
                <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-3">
                    Select Education Level
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setStudentLevel('school')}
                      className={`flex items-center gap-3 rounded-[10px] border p-3.5 text-left transition ${
                        studentLevel === 'school'
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]/20'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink-soft)]'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${studentLevel === 'school' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--line)] text-[var(--ink)]'}`}>
                        <School className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--ink)]">School Student</p>
                        <p className="text-xs text-[var(--ink-soft)]">High School / Secondary (0-20 score scale)</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentLevel('college')}
                      className={`flex items-center gap-3 rounded-[10px] border p-3.5 text-left transition ${
                        studentLevel === 'college'
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]/20'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink-soft)]'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${studentLevel === 'college' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--line)] text-[var(--ink)]'}`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--ink)]">College Student</p>
                        <p className="text-xs text-[var(--ink-soft)]">University / Higher Ed (GPA / 0-100 scale)</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Mentor Level Selector */}
              {selectedRole === 'mentor' && (
                <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-3">
                    Select Cohort Level to Track
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setStudentLevel('school')}
                      className={`flex items-center gap-3 rounded-[10px] border p-3.5 text-left transition ${
                        studentLevel === 'school'
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]/20'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink-soft)]'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${studentLevel === 'school' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--line)] text-[var(--ink)]'}`}>
                        <School className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--ink)]">Track School Students</p>
                        <p className="text-xs text-[var(--ink-soft)]">GPA & risk analysis for school cohort</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentLevel('college')}
                      className={`flex items-center gap-3 rounded-[10px] border p-3.5 text-left transition ${
                        studentLevel === 'college'
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]/20'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink-soft)]'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${studentLevel === 'college' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--line)] text-[var(--ink)]'}`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--ink)]">Track College Students</p>
                        <p className="text-xs text-[var(--ink-soft)]">GPA & risk analysis for university cohort</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-[var(--ink)]">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={selectedRole === 'student' ? `${studentLevel}@edupulse.ai` : 'mentor@edupulse.ai'}
                    className="mt-2 w-full rounded-[12px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 outline-none ring-0 transition"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-[var(--ink)]">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter secure password"
                    className="mt-2 w-full rounded-[12px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 outline-none transition"
                    required
                  />
                </label>
              </div>

              {authError && (
                <div className="text-sm font-semibold text-red-500 rounded-[8px] bg-red-50 border border-red-200 p-3">
                  {authError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-sm text-[var(--ink-soft)]">Demo credentials: select a quick login card or type email with any password.</p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--paper)] transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Continue to dashboard'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
