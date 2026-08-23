import { ArrowRight, ArrowUpRight, BookOpenCheck, LineChart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="w-full space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--paper)] px-6 py-10 shadow-[0_20px_50px_rgba(20,34,29,0.06)] sm:px-12 sm:py-14">
        {/* Soft Background Accents */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />

        <header className="relative flex items-center justify-between border-b border-[var(--line)] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12231f] text-sm font-black tracking-wider text-[#d6efe2] shadow-sm">
              EP
            </div>
            <span className="text-2xl font-black tracking-[-0.03em] text-[var(--ink)] sm:text-3xl">EduPulse</span>
          </div>

          <Link to="/role-picker">
            <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-xs font-bold text-[var(--paper)] transition duration-200 hover:scale-105">
              Launch App <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </header>

        <div className="mt-10 max-w-[800px]">
          <p className="eyebrow mb-3">Student Performance & Intervention Platform</p>

          <h1 className="text-[40px] font-black leading-[1.02] tracking-[-0.05em] text-[var(--ink)] sm:text-[56px] lg:text-[64px]">
            Spot risk early,
            <span className="block text-[var(--accent)]">coach with confidence.</span>
          </h1>

          <p className="mt-5 max-w-[620px] text-base leading-relaxed text-[var(--ink-soft)] sm:text-xl">
            EduPulse turns attendance, assessment results, and study habits into clear, actionable insights — helping students and mentors succeed before grades slip.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/role-picker">
              <button type="button" className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--ink)] px-7 py-4 text-sm font-bold text-[var(--paper)] shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[#1a332c]">
                <span>Get Started</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Simple Value Pillar Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7 transition duration-200 hover:border-[var(--accent)] hover:-translate-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-5">
            <LineChart className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--ink)]">1. Predict</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-soft)]">
            Clear academic forecasts tailored for school and college students to identify performance trends early.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7 transition duration-200 hover:border-[var(--accent)] hover:-translate-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800 mb-5">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--ink)]">2. Explain</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-soft)]">
            Understand the exact positive and negative factors influencing a student’s performance.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7 transition duration-200 hover:border-[var(--accent)] hover:-translate-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 mb-5">
            <BookOpenCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--ink)]">3. Simulate & Act</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-soft)]">
            Test what-if study scenarios and receive practical recommendations to guide meaningful academic improvement.
          </p>
        </div>
      </section>
    </div>
  );
}
