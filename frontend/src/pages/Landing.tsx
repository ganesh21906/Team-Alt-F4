import { ArrowRight, BarChart3, CheckCircle2, Cpu, ShieldCheck, Target, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const keyMetrics = [
  { value: '94.8%', label: 'Intervention Model Accuracy' },
  { value: '3.2x', label: 'Faster Risk Detection' },
  { value: '1,189', label: 'Validated Training Data Samples' },
];

const platformFeatures = [
  {
    icon: Cpu,
    title: 'Dual-Engine ML Analytics',
    description:
      'Engineered specifically with custom scikit-learn & XGBoost pipelines tailored for both secondary school (0-20 score scale) and higher education GPA cohorts.',
  },
  {
    icon: Target,
    title: 'SHAP Counterfactual Modeling',
    description:
      'Transparent TreeExplainer model interpretability converts raw model weights into understandable key factors and actionable intervention suggestions.',
  },
  {
    icon: TrendingUp,
    title: 'Interactive What-If Simulation',
    description:
      'Simulate future performance trajectories by testing hypothetical scenario inputs (attendance, assignment completion, midterms) before final evaluations.',
  },
  {
    icon: ShieldCheck,
    title: 'Data Leakage Protection',
    description:
      'Rigorous temporal pipeline validation strictly isolates intermediate grades to prevent data leakage and guarantee real-world generalization.',
  },
];

export function Landing() {
  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-[#0F172A] py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Main Hero Header */}
        <div className="mx-auto max-w-[840px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Production-Ready Subsystem • Scikit-Learn & XGBoost
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Student Performance Prediction & Early Intervention Engine
          </h1>

          <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
            Empower educators and students with predictive academic performance modeling, transparent SHAP feature explanations, and real-time counterfactual scenario planning.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/role-picker"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500"
            >
              Access Platform Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              API OpenAPI Specs
            </a>
          </div>
        </div>

        {/* Metric Summary Bar */}
        <div className="mt-14 grid gap-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:grid-cols-3">
          {keyMetrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="text-3xl font-extrabold text-white">{metric.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {platformFeatures.map((feature) => (
            <div
              key={feature.title}
              className="pro-card p-6 transition duration-200 hover:border-slate-700"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Operational Context Footer Box */}
        <div className="mt-14 rounded-xl border border-slate-800 bg-slate-900/80 p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <Users className="h-4 w-4 text-indigo-400" />
            Designed for Hackathon Evaluation & Institutional Integration
          </div>
          <p className="mt-2 text-xs text-slate-500">
            FastAPI REST API linked on port 8000 • Scikit-learn & XGBoost pipelines • Vite Frontend
          </p>
        </div>
      </div>
    </div>
  );
}
