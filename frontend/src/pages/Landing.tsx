import { ArrowRight, BarChart3, Bot, CheckCircle2, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '92%', label: 'guidance accuracy' },
  { value: '3x', label: 'faster intervention planning' },
  { value: '9.4/10', label: 'student satisfaction' },
];

const featureCards = [
  {
    icon: Bot,
    title: 'AI-powered insight',
    text: 'Translate attendance, assessments, and subject trends into an understandable action plan for each learner.',
  },
  {
    icon: Target,
    title: 'Risk-aware planning',
    text: 'Highlight low, medium, and high-risk signals early so students and mentors can respond before gaps widen.',
  },
  {
    icon: TrendingUp,
    title: 'Actionable guidance',
    text: 'Turn model output into practical recommendations, intervention priorities, and measurable next steps.',
  },
];

const eduPulseLetters = 'EduPulse'.split('');

export function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1040px] px-4 py-4 sm:px-6">
        <section className="landing-shell mx-auto w-full max-w-[760px] p-6 sm:p-8 lg:p-10">
          <div className="floating-panel-ghost ghost-left" aria-hidden="true" />
          <div className="floating-panel-ghost ghost-right" aria-hidden="true" />
          <div className="floating-panel-ghost ghost-bottom" aria-hidden="true" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)] sm:mb-7">
              <Sparkles className="h-3.5 w-3.5" />
              Student success intelligence
            </div>

            <div className="text-center">
              <div className="eyebrow mb-3">EDUPULSE</div>

              <h1 className="title-animate text-5xl font-black leading-[0.9] tracking-[-0.08em] text-[var(--ink)] sm:text-6xl lg:text-[8rem]">
                {eduPulseLetters.map((letter, index) => (
                  <span key={`${letter}-${index}`} className="title-letter" style={{ animationDelay: `${index * 90}ms` }}>
                    {letter}
                  </span>
                ))}
              </h1>

              <div className="mt-3 flex justify-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ink-soft)] sm:text-base">Predict. Explain. Improve.</p>
              </div>

              <p className="mx-auto mt-4 max-w-[620px] text-sm leading-6 text-[var(--ink-soft)] sm:mt-6 sm:text-base sm:leading-7">
                Attendance, effort, and academic momentum — combined into a clear model view that guides timely action.
              </p>

              <div className="mt-6 flex justify-center sm:mt-8">
                <Link to="/role-picker">
                  <button type="button" className="cta">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-6 sm:mt-10 sm:gap-10">
                {stats.map((item) => (
                  <div key={item.label} className="stat-block">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <div key={title} className="surface-link rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ink)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
