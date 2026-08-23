import { ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
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
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
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
          {/* Card 1: AI Model Engine */}
          <article className="rounded-[8px] border border-[var(--line)] bg-[#fdfdf9] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                <span>AI Model Engine</span>
                <span>Live Pipeline</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#cdeedc] text-[#1f5f46]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--ink)]">Explainable Intelligence</h3>
                  <p className="text-xs text-[var(--ink-soft)]">SHAP Feature Attribution</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                Model predictions powered by Gradient Boosting & XGBoost with SHAP feature attribution to explain key positive and negative performance factors.
              </p>
            </div>

            <div className="mt-5 border-t border-[var(--line)] pt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--ink-soft)]">System Status</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Operational
              </span>
            </div>
          </article>

          {/* Card 2: Behavioral Vectors */}
          <article className="rounded-[8px] border border-[var(--line)] bg-[#fdfdf9] p-5">
            <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              <span>Behavioral Vectors</span>
              <span>Early Warning</span>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-3">
                <div className="flex items-center justify-between text-sm font-medium text-[var(--ink)]">
                  <span>Attendance Health</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Active Monitoring
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#e7e9e1] overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-[var(--accent)]" />
                </div>
              </div>

              <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-3">
                <div className="flex items-center justify-between text-sm font-medium text-[var(--ink)]">
                  <span>Assessment Momentum</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#92400E]">
                    Trajectory Mapping
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#e7e9e1] overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-[#cf6847]" />
                </div>
              </div>

              <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-3">
                <div className="flex items-center justify-between text-sm font-medium text-[var(--ink)]">
                  <span>Study Consistency</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                    Pattern Analysis
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#e7e9e1] overflow-hidden">
                  <div className="h-full w-5/6 rounded-full bg-[var(--accent)]" />
                </div>
              </div>
            </div>
          </article>

          {/* Card 3: Action Loop */}
          <article className="rounded-[8px] border border-[var(--line)] bg-[#fdfdf9] p-5">
            <div className="mb-4 flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              <span>How EduPulse Helps</span>
              <span>Action Loop</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <p className="text-base font-bold text-[var(--ink)]">1. Predict</p>
                <p className="mt-0.5 text-xs text-[var(--ink-soft)]">Multi-level ML models evaluate academic and behavioral signals.</p>
              </div>

              <div>
                <p className="text-base font-bold text-[var(--ink)]">2. Explain</p>
                <p className="mt-0.5 text-xs text-[var(--ink-soft)]">SHAP breakdown reveals top positive and negative risk factors.</p>
              </div>

              <div>
                <p className="text-base font-bold text-[var(--ink)]">3. Intervene</p>
                <p className="mt-0.5 text-xs text-[var(--ink-soft)]">What-If scenario simulation and actionable guidance for early coaching.</p>
              </div>
            </div>
          </article>
        </section>
      </section>
    </div>
  );
}
