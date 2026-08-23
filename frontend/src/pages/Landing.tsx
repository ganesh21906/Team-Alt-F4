import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="w-full">
      <section className="rounded-[20px] border border-[var(--line)] bg-[var(--paper)] px-6 py-5 shadow-[0_18px_40px_rgba(20,34,29,0.06)] sm:px-8 sm:py-6">
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12231f] text-xs font-semibold tracking-[0.02em] text-[#d6efe2]">
                EP
              </div>
              <span className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-[28px]">EduPulse</span>
            </div>

            <div className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Live prediction model
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--ink-soft)]">Student intelligence console</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#cdeedc] text-sm font-semibold text-[#1f5f46]">
              AI
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-center">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">Early intervention system / 01</p>

            <h1 className="max-w-[760px] text-[36px] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--ink)] sm:text-[48px] lg:text-[56px]">
              Spot risk early,
              <span className="block text-[var(--accent)]">coach with confidence.</span>
            </h1>

            <p className="mt-3 max-w-[640px] text-base leading-[1.45] text-[var(--ink-soft)] sm:text-[18px]">
              EduPulse turns attendance, assessments, and study behavior into explainable predictions so students and mentors can act before performance drops.
            </p>
          </div>

          <div className="flex justify-start lg:justify-end">
            <Link to="/role-picker" className="inline-flex w-full max-w-[170px] items-center justify-between rounded-[8px] bg-[#162420] px-5 py-3.5 text-sm font-semibold text-[#ecf7f1] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#1d302a]">
              <span>Start now</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-[4px] border border-[var(--line)] bg-[#fdfdf9] p-5">
            <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              <span>Prediction quality</span>
              <span>Live pipeline</span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <p className="text-[52px] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--ink)]">92%</p>
              <p className="mb-2 text-[20px] font-semibold text-[var(--ink-soft)]">trust</p>
            </div>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">confidence window based on active model and current student inputs</p>

            <div className="mt-4 inline-flex bg-[#ffe8bc] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#936000]">
              Explainability enabled
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
              <span className="text-sm text-[var(--ink-soft)]">Status</span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">Operational</span>
            </div>
          </article>

          <article className="rounded-[4px] border border-[var(--line)] bg-[#fdfdf9] p-5">
            <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              <span>Impact channels</span>
              <span>Intervention reach</span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-base text-[var(--ink)]">
                  <span>Attendance health</span>
                  <span className="font-semibold">73%</span>
                </div>
                <div className="h-2 bg-[#e7e9e1]">
                  <div className="h-2 w-[73%] bg-[#cf6847]" />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-base text-[var(--ink)]">
                  <span>Assessment momentum</span>
                  <span className="font-semibold">69%</span>
                </div>
                <div className="h-2 bg-[#e7e9e1]">
                  <div className="h-2 w-[69%] bg-[#cf6847]" />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-base text-[var(--ink)]">
                  <span>Study consistency</span>
                  <span className="font-semibold">3.2h / wk</span>
                </div>
                <div className="h-2 bg-[#e7e9e1]">
                  <div className="h-2 w-[64%] bg-[var(--accent)]" />
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[4px] border border-[var(--line)] bg-[#fdfdf9] p-5">
            <div className="mb-4 flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              <span>How EduPulse helps</span>
              <span>Action loop</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-[var(--ink)]">1. Predict</p>
                <p className="mt-0.5 text-sm text-[var(--ink-soft)]">Estimate outcome and classify risk level from student profile data.</p>
              </div>

              <div>
                <p className="text-lg font-semibold text-[var(--ink)]">2. Explain</p>
                <p className="mt-0.5 text-sm text-[var(--ink-soft)]">Show which factors raised or lowered the predicted performance.</p>
              </div>

              <div>
                <p className="text-lg font-semibold text-[var(--ink)]">3. Intervene</p>
                <p className="mt-0.5 text-sm text-[var(--ink-soft)]">Recommend practical next steps mentors and students can apply immediately.</p>
              </div>
            </div>
          </article>
        </section>
      </section>
    </div>
  );
}
