import { Activity, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useSessionStore } from '../../store/sessionStore';

export function Navbar() {
  const { isAuthenticated, role, studentLevel, logout } = useSessionStore();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white">EduPulse</span>
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                Enterprise ML
              </span>
            </div>
            <p className="text-xs text-slate-400">Student Performance & Early Intervention System</p>
          </div>
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex">
            {role === 'student' ? (
              <>
                <Link
                  to="/student/dashboard"
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    location.pathname === '/student/dashboard'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Student Dashboard
                </Link>
                <Link
                  to="/student/what-if"
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    location.pathname === '/student/what-if'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  What-If Simulator
                </Link>
              </>
            ) : (
              <Link
                to="/mentor/dashboard"
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  location.pathname === '/mentor/dashboard'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Cohort Intervention Console
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-300 sm:flex">
                {role === 'student' ? <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> : <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />}
                <span className="capitalize">{role}</span>
                {role === 'student' && (
                  <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">
                    {studentLevel === 'school' ? 'School Level' : 'College Level'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/role-picker"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
