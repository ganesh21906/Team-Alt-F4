import { LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useSessionStore } from '../../store/sessionStore';

export function Navbar() {
  const { isAuthenticated, role, logout } = useSessionStore();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1040px] items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            E
          </div>
          <div className="leading-none">
            <p className="eyebrow">EDUPULSE</p>
            <p className="mt-1 text-sm font-bold text-slate-100 flex items-center gap-1.5">
              AI Performance Platform
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-300 sm:flex">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                {role === 'student' ? 'Student Access' : 'Mentor Access'}
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-white/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
