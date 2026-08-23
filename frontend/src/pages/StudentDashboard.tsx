import { AlertTriangle, ArrowRight, ArrowUpRight, BookOpen, BookOpenCheck, CalendarDays, Clock3, GraduationCap, School, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { LineChartCard } from '../components/charts/LineChartCard';
import { MetricCard } from '../components/cards/MetricCard';
import { ProgressRing } from '../components/cards/ProgressRing';
import { RiskBadge } from '../components/cards/RiskBadge';
import { api } from '../lib/api';
import type { Student } from '../lib/types';
import { useSessionStore } from '../store/sessionStore';

function LoadingState() {
  return (
    <div className="pro-card p-12 text-center">
      <p className="text-sm font-semibold text-slate-400">Loading student performance analytics…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="pro-card p-12 text-center border-dashed">
      <p className="text-sm font-semibold text-slate-400">No student profile data available for this selection.</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="pro-card p-12 text-center">
      <p className="text-sm font-semibold text-rose-400">Unable to connect to ML Subsystem API. Please check server connection.</p>
    </div>
  );
}

export function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { studentLevel } = useSessionStore();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const result = await api.getStudentProfile(studentLevel);
        if (mounted) {
          setStudent(result);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [studentLevel]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!student) return <EmptyState />;

  const isSchool = studentLevel === 'school';

  return (
    <div className="space-y-6">
      {/* Student Profile Header Bar */}
      <section className="pro-card p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <img src={student.avatarUrl} alt={student.name} className="h-16 w-16 rounded-xl object-cover border border-slate-700 shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow-label">Academic Profile</span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                  {isSchool ? <School className="h-3.5 w-3.5 text-indigo-400" /> : <BookOpen className="h-3.5 w-3.5 text-indigo-400" />}
                  {isSchool ? 'Secondary Education' : 'Higher Education'}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{student.name}</h1>
              <p className="text-xs text-slate-400 mt-1">
                {student.className} • Evaluation Metric: {isSchool ? 'G1-G3 Period Scale (0-20)' : 'Cumulative GPA / 100 Scale'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RiskBadge level={student.riskLevel} />
            <Link
              to="/student/what-if"
              className="btn-primary inline-flex items-center gap-2 text-xs"
            >
              Open What-If Simulator
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Metric Cards Grid */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Model Forecast Score"
          value={isSchool ? `${(student.performanceScore * 0.2).toFixed(1)} / 20` : `${student.performanceScore}%`}
          hint="XGBoost/GBR ML pipeline projection"
          accent="blue"
          icon={<TrendingUp className="h-5 w-5 text-indigo-400" />}
        />
        <MetricCard
          label="Cumulative GPA"
          value={student.gpa.toFixed(1)}
          hint="Institutional academic GPA benchmark"
          accent="purple"
          icon={<GraduationCap className="h-5 w-5 text-indigo-400" />}
        />
        <MetricCard
          label="Attendance Rate"
          value={`${student.attendancePct}%`}
          hint="Cumulative class attendance percentage"
          accent="emerald"
          icon={<Clock3 className="h-5 w-5 text-emerald-400" />}
        />
        <MetricCard
          label="Risk Intensity Score"
          value={String(student.riskScore)}
          hint="SHAP vulnerability coefficient"
          accent="amber"
          icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
        />
      </section>

      {/* Subject Progress & Performance Ring */}
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="pro-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="eyebrow-label">Performance Gauge</span>
              <h2 className="mt-1 text-lg font-bold text-white">Overall Academic Trajectory</h2>
            </div>
            <RiskBadge level={student.riskLevel} />
          </div>
          <div className="flex justify-center py-4">
            <ProgressRing value={student.performanceScore} color="#4F46E5" size={160} strokeWidth={14} />
          </div>
        </div>

        <div className="pro-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="eyebrow-label">Subject Breakdown</span>
              <h2 className="mt-1 text-lg font-bold text-white">Current Assessment Marks</h2>
            </div>
            <BookOpenCheck className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {student.subjects.map((subject) => (
              <div key={subject.subject} className="rounded-lg bg-slate-900/60 border border-slate-800 p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{subject.subject}</span>
                  <span className="text-indigo-400">{subject.currentScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${subject.currentScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trend Chart & Recommendations */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <LineChartCard data={student.weeklyTrend} />

        <div className="pro-card p-6">
          <div className="mb-5">
            <span className="eyebrow-label">Actionable Intelligence</span>
            <h2 className="mt-1 text-lg font-bold text-white">Recommended Interventions</h2>
          </div>

          <ul className="space-y-3">
            {student.recommendations.map((recommendation, index) => (
              <li key={recommendation.id} className="flex gap-3 rounded-lg bg-slate-900/60 border border-slate-800 p-3.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400 border border-indigo-500/30">
                  {index + 1}
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <p className="font-bold text-white">{recommendation.title}</p>
                  <p className="text-slate-400 leading-relaxed">{recommendation.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Assessment Timeline & Profile Summary */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="pro-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-indigo-400" />
            <div>
              <span className="eyebrow-label">Schedule</span>
              <h2 className="mt-1 text-lg font-bold text-white">Upcoming Assessment Timeline</h2>
            </div>
          </div>

          <div className="space-y-3">
            {student.upcomingExams.map((item) => (
              <div key={item.subject} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
                <div>
                  <p className="text-xs font-bold text-white">{item.subject}</p>
                  <p className="text-[11px] text-slate-400">Official Exam Evaluation</p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  <CalendarDays className="h-3.5 w-3.5 text-indigo-400" />
                  {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pro-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="eyebrow-label">Institutional Profile</span>
              <h2 className="mt-1 text-lg font-bold text-white">Metrics Summary</h2>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Education Subsystem</span>
              <span className="font-semibold text-white">{isSchool ? 'Secondary School (UCI Mat/Por)' : 'Higher Education / College'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Cumulative GPA</span>
              <span className="font-semibold text-white">{student.gpa.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Attendance Percentage</span>
              <span className="font-semibold text-white">{student.attendancePct}%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Top Performing Subject</span>
              <span className="font-semibold text-white">
                {student.subjects.reduce((best, current) => (current.currentScore > best.currentScore ? current : best), student.subjects[0]).subject}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
