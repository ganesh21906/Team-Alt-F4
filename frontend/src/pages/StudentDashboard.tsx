import { AlertTriangle, ArrowUpRight, BookOpenCheck, CalendarDays, Clock3, GraduationCap, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { LineChartCard } from '../components/charts/LineChartCard';
import { MetricCard } from '../components/cards/MetricCard';
import { ProgressRing } from '../components/cards/ProgressRing';
import { RiskBadge } from '../components/cards/RiskBadge';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import type { Student } from '../lib/types';

function LoadingState() {
  return (
    <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-8 text-center">
      <p className="text-sm font-medium text-[var(--ink-soft)]">Loading student dashboard…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[12px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-8 text-center">
      <p className="text-sm font-medium text-[var(--ink-soft)]">No student data is available for this view yet.</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-8 text-center">
      <p className="text-sm font-medium text-[var(--ink)]">We could not load the student dashboard right now.</p>
    </div>
  );
}

export function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const result = await api.getStudentProfile();
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
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!student) return <EmptyState />;

  return (
    <div className="space-y-6">
      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img src={student.avatarUrl} alt={student.name} className="h-16 w-16 rounded-full object-cover" />
            <div>
              <p className="eyebrow">Welcome back</p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] text-[var(--ink)]">{student.name}</h1>
              <p className="text-sm text-[var(--ink-soft)]">{student.className}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RiskBadge level={student.riskLevel} />
            <Link to="/student/what-if">
              <Button variant="primary">Open What-If Simulator</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Predicted performance" value={`${student.performanceScore}`} hint="Model-predicted academic outcome" accent="blue" icon={<TrendingUp className="h-5 w-5 text-[var(--accent)]" />} />
        <MetricCard label="GPA" value={student.gpa.toFixed(1)} hint="Current benchmark" accent="purple" icon={<GraduationCap className="h-5 w-5 text-[var(--accent)]" />} />
        <MetricCard label="Attendance" value={`${student.attendancePct}%`} hint="Current attendance" accent="emerald" icon={<Clock3 className="h-5 w-5 text-[var(--risk-low)]" />} />
        <MetricCard label="Risk score" value={String(student.riskScore)} hint="Model risk intensity" accent="amber" icon={<AlertTriangle className="h-5 w-5 text-[var(--risk-mid)]" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Student status</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Performance ring</h2>
            </div>
            <RiskBadge level={student.riskLevel} />
          </div>
          <div className="flex justify-center">
            <ProgressRing value={student.performanceScore} color="var(--accent)" size={160} strokeWidth={14} />
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Subjects</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Current progress</h2>
            </div>
            <BookOpenCheck className="h-5 w-5 text-[var(--ink-soft)]" />
          </div>

          <div className="mt-5 space-y-4">
            {student.subjects.map((subject) => (
              <div key={subject.subject} className="rounded-[12px] bg-[var(--paper)] border border-[var(--line)] p-4">
                <div className="mb-2 flex items-center justify-between gap-4 text-sm text-[var(--ink)]">
                  <span className="font-medium">{subject.subject}</span>
                  <span className="font-semibold">{subject.currentScore}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[var(--line)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${subject.currentScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <LineChartCard data={student.weeklyTrend} />

        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">AI guidance</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Recommendations</h2>
            </div>
          </div>

          <ul className="space-y-3">
            {student.recommendations.map((recommendation, index) => (
              <li key={recommendation.id} className="flex gap-3 rounded-[12px] bg-[var(--paper)] border border-[var(--line)] p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">{index + 1}</div>
                <div className="space-y-1 text-sm leading-6 text-[var(--ink-soft)]">
                  <p className="font-semibold text-[var(--ink)]">{recommendation.title}</p>
                  <p>{recommendation.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-4 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[var(--accent)]" />
            <div>
              <p className="eyebrow">Upcoming exams</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Assessment timeline</h2>
            </div>
          </div>

          <div className="space-y-3">
            {student.upcomingExams.map((item) => (
              <div key={item.subject} className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
                <div>
                  <p className="font-medium text-[var(--ink)]">{item.subject}</p>
                  <p className="text-xs text-[var(--ink-soft)]">Exam scheduled</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Profile</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Quick view</h2>
            </div>
            <Link to="/student/profile" className="text-sm font-semibold text-[var(--accent)]">Open profile</Link>
          </div>

          <div className="space-y-4 text-sm text-[var(--ink-soft)]">
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
              <span>Current GPA</span>
              <span className="font-semibold text-[var(--ink)]">{student.gpa.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
              <span>Attendance</span>
              <span className="font-semibold text-[var(--ink)]">{student.attendancePct}%</span>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
              <span>Strongest subject</span>
              <span className="font-semibold text-[var(--ink)]">{student.subjects.reduce((best, current) => (current.currentScore > best.currentScore ? current : best), student.subjects[0]).subject}</span>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
              <span>Priority focus</span>
              <span className="font-semibold text-[var(--ink)]">{student.subjects.reduce((lowest, current) => (current.currentScore < lowest.currentScore ? current : lowest), student.subjects[0]).subject}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end pb-4">
        <Link to="/student/profile">
          <Button variant="secondary" icon={<ArrowUpRight className="h-4 w-4" />}>View full profile</Button>
        </Link>
      </div>
    </div>
  );
}
