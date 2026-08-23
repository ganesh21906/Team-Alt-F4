import { ArrowRight, BookOpen, GraduationCap, LockKeyhole, School, ShieldCheck } from 'lucide-react';
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
    <div className="mx-auto max-w-[1040px] px-6 py-12">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-8 sm:p-11 backdrop-blur-xl shadow-2xl shadow-black/60">
        <p className="eyebrow">CHOOSE YOUR ACCESS</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-200 sm:text-4xl">
          Continue as a student or mentor.
        </h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`group rounded-[16px] border p-6 text-left transition-all duration-300 ${
              selectedRole === 'student'
                ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'border-white/10 bg-slate-950/50 hover:border-blue-400/40 hover:-translate-y-1'
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-blue-500/15 text-blue-400 border border-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">I’m a Student</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">See your live performance forecast, review recommendations, and explore what-if improvements.</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-400">
              Select student access <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('mentor')}
            className={`group rounded-[16px] border p-6 text-left transition-all duration-300 ${
              selectedRole === 'mentor'
                ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
                : 'border-white/10 bg-slate-950/50 hover:border-indigo-400/40 hover:-translate-y-1'
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">I’m a Mentor</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Track cohort health, prioritize interventions, and drill into a student’s profile with context.</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-400">
              Select mentor access <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {selectedRole ? (
          <form onSubmit={handleSubmit} className="mt-8 rounded-[16px] border border-white/10 bg-slate-950/60 p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-blue-600 text-white shadow-md shadow-blue-500/30">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow">AUTHENTICATION</p>
                <h2 className="text-xl font-bold text-slate-100">Secure access for {selectedRole === 'student' ? 'students' : 'mentors'}</h2>
              </div>
            </div>

            {/* Student Education Level Selector */}
            {selectedRole === 'student' && (
              <div className="rounded-[14px] border border-white/10 bg-slate-900/80 p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Select Education Level
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setStudentLevel('school')}
                    className={`flex items-center gap-3 rounded-[12px] border p-4 text-left transition-all ${
                      studentLevel === 'school'
                        ? 'border-blue-500 bg-blue-950/50 ring-1 ring-blue-500/40 text-white'
                        : 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${studentLevel === 'school' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      <School className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">School Student</p>
                      <p className="text-xs text-slate-400">High School / Secondary (0-20 score scale)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentLevel('college')}
                    className={`flex items-center gap-3 rounded-[12px] border p-4 text-left transition-all ${
                      studentLevel === 'college'
                        ? 'border-indigo-500 bg-indigo-950/50 ring-1 ring-indigo-500/40 text-white'
                        : 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${studentLevel === 'college' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">College Student</p>
                      <p className="text-xs text-slate-400">University / Higher Ed (GPA / 0-100 scale)</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-200">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={selectedRole === 'student' ? `${studentLevel}@edupulse.ai` : 'mentor@edupulse.ai'}
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-200">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter secure password"
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">Demo access: any valid email and password will work.</p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5"
              >
                Continue to dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
