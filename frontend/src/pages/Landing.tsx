import { ArrowRight, Bot, Sparkles, Target, TrendingUp } from 'lucide-react';
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
    <div className="relative overflow-hidden py-6">
      <div className="relative mx-auto max-w-[1040px] px-4 sm:px-6">
        <section className="mx-auto w-full max-w-[820px] rounded-[28px] border border-white/10 bg-slate-900/80 p-8 sm:p-12 backdrop-blur-xl shadow-2xl shadow-black/70">
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400 shadow-sm shadow-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              Student Success Intelligence
            </div>

            <div className="text-center">
              <div className="eyebrow mb-2">EDUPULSE ML SUBSYSTEM</div>

              <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200 sm:text-6xl lg:text-[7rem]">
                {eduPulseLetters.map((letter, index) => (
                  <span key={`${letter}-${index}`} className="inline-block transition duration-300 hover:text-blue-400 hover:scale-105">
                    {letter}
                  </span>
                ))}
              </h1>

              <div className="mt-4 flex justify-center">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-400 sm:text-sm">Predict. Explain. Improve.</p>
              </div>

              <p className="mx-auto mt-5 max-w-[620px] text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                Attendance, effort, and academic momentum — combined into a transparent ML pipeline that guides timely interventions.
              </p>

              <div className="mt-8 flex justify-center">
                <Link to="/role-picker">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/30 border border-white/20 transition hover:scale-105 hover:shadow-blue-500/50"
                  >
                    Get Started Now
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-8 border-t border-white/10 pt-8 sm:gap-12">
                {stats.map((item) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <strong className="text-2xl font-black tracking-tight text-white sm:text-3xl">{item.value}</strong>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-[20px] border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition duration-300 hover:border-blue-500/40 hover:bg-slate-900/90 hover:-translate-y-1 shadow-lg shadow-black/40"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
