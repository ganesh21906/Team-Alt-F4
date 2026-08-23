import { ArrowRight, BookOpen, GraduationCap, Lock, School, ShieldCheck, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { StudentLevel } from '../lib/types';
import { useSessionStore } from '../store/sessionStore';

export function RolePicker() {
  const navigate = useNavigate();
  const { login } = useSessionStore();
  const [selectedRole, setSelectedRole] = useState<'student' | 'mentor' | null>(null);
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('school');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRoleSelect = (role: 'student' | 'mentor') => {
    setSelectedRole(role);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRole || !email.trim() || !password.trim()) {
      return;
    }

    login(selectedRole, studentLevel);
    navigate(selectedRole === 'student' ? '/student/dashboard' : '/mentor/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#0F172A] py-12">
      <div className="mx-auto max-w-[920px] px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
          <div className="text-center">
            <span className="eyebrow-label">ENTERPRISE PORTAL ACCESS</span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Select Your Access Role
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Choose your profile type to proceed to student analytics or mentor intervention console.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`pro-card p-6 text-left transition ${
                selectedRole === 'student'
                  ? 'border-indigo-500 bg-slate-800/80 ring-1 ring-indigo-500/40'
                  : 'hover:border-slate-700 bg-slate-900/40'
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">Student Portal</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                View predicted scores, transparent SHAP feature breakdowns, and test What-If scenarios.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                Select Student Role <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('mentor')}
              className={`pro-card p-6 text-left transition ${
                selectedRole === 'mentor'
                  ? 'border-indigo-500 bg-slate-800/80 ring-1 ring-indigo-500/40'
                  : 'hover:border-slate-700 bg-slate-900/40'
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">Mentor Console</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Monitor student cohort health, identify at-risk learners, and track targeted interventions.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                Select Mentor Role <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          </div>

          {selectedRole && (
            <form onSubmit={handleSubmit} className="mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Sign in to {selectedRole === 'student' ? 'Student Portal' : 'Mentor Console'}
                  </h3>
                  <p className="text-xs text-slate-400">Enter institutional credentials to continue</p>
                </div>
              </div>

              {/* Student Education Level Selector */}
              {selectedRole === 'student' && (
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Institutional Education Subsystem
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setStudentLevel('school')}
                      className={`flex items-center gap-3 rounded-lg border p-3.5 text-left transition ${
                        studentLevel === 'school'
                          ? 'border-indigo-500 bg-indigo-950/50 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <School className={`h-5 w-5 shrink-0 ${studentLevel === 'school' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-200">Secondary School</p>
                        <p className="text-[11px] text-slate-400">G1-G3 scale (0-20 marks)</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentLevel('college')}
                      className={`flex items-center gap-3 rounded-lg border p-3.5 text-left transition ${
                        studentLevel === 'college'
                          ? 'border-indigo-500 bg-indigo-950/50 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <BookOpen className={`h-5 w-5 shrink-0 ${studentLevel === 'college' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-200">Higher Education / College</p>
                        <p className="text-[11px] text-slate-400">GPA / Semester Grade scale</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institutional Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={selectedRole === 'student' ? `${studentLevel}@edupulse.ai` : 'mentor@edupulse.ai'}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••••••"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-500">Hackathon demo mode: any valid email format will log in.</p>
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center gap-2 text-xs"
                >
                  Continue to Portal <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
