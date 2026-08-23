import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Gauge, RefreshCw, School, ShieldCheck, Sliders, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Landing() {
  const [activeModel, setActiveModel] = useState<'school' | 'college'>('school');
  const [attendance, setAttendance] = useState(82);
  const [assessment, setAssessment] = useState(74);
  const [studyHours, setStudyHours] = useState(3);

  // Dynamic live calculation for the Landing Sandbox Preview
  const isSchool = activeModel === 'school';
  
  // Calculate dynamic simulated score
  const baseScore = isSchool ? 14.2 : 76.5;
  const attDelta = (attendance - 80) * (isSchool ? 0.08 : 0.4);
  const assDelta = (assessment - 70) * (isSchool ? 0.1 : 0.5);
  const studyDelta = (studyHours - 2) * (isSchool ? 0.4 : 2.5);

  const simulatedScoreRaw = baseScore + attDelta + assDelta + studyDelta;
  const simulatedScore = isSchool
    ? Math.min(20, Math.max(0, Number(simulatedScoreRaw.toFixed(1))))
    : Math.min(100, Math.max(0, Math.round(simulatedScoreRaw)));

  const riskLevel = isSchool
    ? simulatedScore >= 14 ? 'LOW' : simulatedScore >= 10 ? 'MEDIUM' : 'HIGH'
    : simulatedScore >= 80 ? 'LOW' : simulatedScore >= 65 ? 'MEDIUM' : 'HIGH';

  const riskColor = riskLevel === 'LOW' ? '#065F46' : riskLevel === 'MEDIUM' ? '#92400E' : '#991B1B';
  const riskBg = riskLevel === 'LOW' ? '#D1FAE5' : riskLevel === 'MEDIUM' ? '#FEF3C7' : '#FEE2E2';

  return (
    <div className="w-full space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--paper)] px-6 py-8 shadow-[0_20px_50px_rgba(20,34,29,0.08)] sm:px-10 sm:py-10">
        {/* Subtle Background Glow Accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <header className="relative flex flex-wrap items-center justify-between border-b border-[var(--line)] pb-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12231f] text-sm font-black tracking-wider text-[#d6efe2] shadow-sm">
              EP
            </div>
            <div>
              <span className="text-2xl font-black tracking-[-0.03em] text-[var(--ink)] sm:text-3xl">EduPulse</span>
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">v1.0 ML</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-ping" />
              Live AI Subsystem Online
            </div>
            <Link to="/role-picker">
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-xs font-bold text-[var(--paper)] transition duration-200 hover:scale-105">
                Launch Console <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] mb-4">
              <Zap className="h-3.5 w-3.5" /> Explainable Early Warning Intelligence
            </div>

            <h1 className="text-[38px] font-black leading-[1.02] tracking-[-0.05em] text-[var(--ink)] sm:text-[52px] lg:text-[60px]">
              Spot risk early,
              <span className="block text-[var(--accent)]">coach with confidence.</span>
            </h1>

            <p className="mt-4 max-w-[600px] text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
              EduPulse converts attendance, assessment trajectories, and study habits into transparent, SHAP-explained predictions — empowering students and mentors to act before grades slip.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/role-picker">
                <button type="button" className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--ink)] px-6 py-4 text-sm font-bold text-[var(--paper)] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-[#1a332c]">
                  <span>Get Started Free</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Link>
              <a href="#sandbox" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-5 py-4 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--ink-soft)]">
                <Sliders className="h-4 w-4 text-[var(--accent)]" />
                <span>Try Interactive Sandbox</span>
              </a>
            </div>
          </div>

          {/* Feature Highlight Card */}
          <div className="relative rounded-2xl border border-[var(--line)] bg-[#fdfdf9] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--ink-soft)]">Core Subsystem Architecture</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Dual-Model Engine
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 transition hover:border-[var(--accent)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--ink)]">School Performance Model</h4>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">GradientBoostingRegressor tuned for 0-20 course evaluation scores & 3-tier risk classification.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 transition hover:border-[var(--accent)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800 font-bold">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--ink)]">College Performance Model</h4>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">XGBClassifier optimized for higher-education semester GPA & midterm prep factors.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 transition hover:border-[var(--accent)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--ink)]">SHAP Explainability & What-If</h4>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">Every prediction reveals top positive & negative factors with counterfactual scenario simulation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Sandbox Section */}
      <section id="sandbox" className="rounded-[24px] border border-[var(--line)] bg-[#fcfcf8] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              <Gauge className="h-4 w-4" /> Live Interactive Sandbox
            </div>
            <h2 className="mt-1 text-2xl font-black text-[var(--ink)] sm:text-3xl">Test the AI Model Engine Live</h2>
            <p className="text-sm text-[var(--ink-soft)] mt-1">Adjust behavioral sliders to watch the real-time model forecast recalculate dynamically.</p>
          </div>

          {/* Model Switcher Buttons */}
          <div className="inline-flex rounded-xl border border-[var(--line)] bg-[var(--paper)] p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveModel('school')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                isSchool ? 'bg-[var(--ink)] text-[var(--paper)] shadow-sm' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <School className="h-3.5 w-3.5" /> School Model (0-20)
            </button>
            <button
              type="button"
              onClick={() => setActiveModel('college')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                !isSchool ? 'bg-[var(--ink)] text-[var(--paper)] shadow-sm' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> College Model (%)
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Sliders Input Panel */}
          <div className="space-y-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center justify-between">
              <span>Student Academic Profile</span>
              <button type="button" onClick={() => { setAttendance(82); setAssessment(74); setStudyHours(3); }} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline">
                <RefreshCw className="h-3 w-3" /> Reset
              </button>
            </h3>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
                  <span>Class Attendance Rate</span>
                  <span className="font-mono text-sm text-[var(--accent)]">{attendance}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={attendance}
                  onChange={(e) => setAttendance(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--line)] accent-[var(--accent)]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
                  <span>Midterm & Quiz Assessment Score</span>
                  <span className="font-mono text-sm text-[var(--accent)]">{assessment}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={assessment}
                  onChange={(e) => setAssessment(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--line)] accent-[var(--accent)]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
                  <span>Weekly Study Hours</span>
                  <span className="font-mono text-sm text-[var(--accent)]">{studyHours} hrs/week</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--line)] accent-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Model Output Card */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">Live Model Forecast</span>
                  <h4 className="text-lg font-bold text-[var(--ink)]">{isSchool ? 'School Score Prediction' : 'College Percentage Forecast'}</h4>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: riskBg, color: riskColor }}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {riskLevel} RISK
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-5xl font-black tracking-tight text-[var(--ink)]">{simulatedScore}</span>
                <span className="text-lg font-bold text-[var(--ink-soft)]">{isSchool ? '/ 20.0' : '%'}</span>
              </div>

              <div className="mt-6 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">SHAP Feature Contributions</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${attendance >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {attendance >= 80 ? '+' : '-'} Attendance ({attendance}%)
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${assessment >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {assessment >= 70 ? '+' : '-'} Assessment ({assessment}%)
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${studyHours >= 3 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {studyHours >= 3 ? '+' : '-'} Study Hours ({studyHours}h)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--line)]">
              <Link to="/role-picker" className="w-full">
                <button type="button" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] py-3 text-sm font-bold text-[var(--paper)] transition hover:bg-[#1f362f]">
                  <span>Explore Full Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Action Loop Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 transition hover:border-[var(--accent)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] font-black text-base mb-4">1</div>
          <h3 className="text-xl font-bold text-[var(--ink)]">Predict</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            Dedicated machine learning pipelines for School & College students evaluate academic and behavioral signals.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 transition hover:border-[var(--accent)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] font-black text-base mb-4">2</div>
          <h3 className="text-xl font-bold text-[var(--ink)]">Explain</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            SHAP TreeExplainer feature attributions break down positive and negative factors behind every score.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 transition hover:border-[var(--accent)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] font-black text-base mb-4">3</div>
          <h3 className="text-xl font-bold text-[var(--ink)]">Simulate & Intervene</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            Interactive What-If counterfactual scenario planning helps mentors and students test interventions.
          </p>
        </div>
      </section>
    </div>
  );
}
