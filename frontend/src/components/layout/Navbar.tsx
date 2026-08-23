import { LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useSessionStore } from '../../store/sessionStore';

export function Navbar() {
  const { isAuthenticated, role, logout } = useSessionStore();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(255,255,255,0.84)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1040px] items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ink)] text-sm font-bold text-[var(--paper)]">
            E
          </div>
          <div className="leading-none">
            <p className="eyebrow">EDUPULSE</p>
            <p className="mt-1 text-sm font-medium text-[var(--ink)]">AI Performance Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs font-medium text-[var(--ink-soft)] sm:flex">
                <ShieldCheck className="h-3.5 w-3.5" />
                {role === 'student' ? 'Student access' : 'Mentor access'}
              </div>
              <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-medium text-[var(--ink)] hover:border-[var(--ink)]">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
