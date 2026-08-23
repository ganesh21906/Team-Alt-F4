import { Activity, CalendarRange, Gauge, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Heatmap } from '../components/charts/Heatmap';
import { LineChartCard } from '../components/charts/LineChartCard';
import { RiskBadge } from '../components/cards/RiskBadge';
import { api } from '../lib/api';
import type { Student } from '../lib/types';

function LoadingState() {
  return <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-8 text-center text-sm text-[var(--ink-soft)]">Loading student profile…</div>;
}

function EmptyState() {
  return <div className="rounded-[12px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-8 text-center text-sm text-[var(--ink-soft)]">No student profile data is available for this record.</div>;
}

function ErrorState() {
  return <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-8 text-center text-sm text-[var(--ink)]">The student profile could not be loaded right now.</div>;
}

export function StudentProfile() {
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

  const positiveFactors = student.riskFactors.filter((factor) => factor.impact === 'positive');
  const negativeFactors = student.riskFactors.filter((factor) => factor.impact === 'negative');

  return (
    <div className="space-y-6">
      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={student.avatarUrl} alt={student.name} className="h-16 w-16 rounded-full object-cover" />
            <div>
              <p className="eyebrow">Student profile</p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] text-[var(--ink)]">{student.name}</h1>
              <p className="text-sm text-[var(--ink-soft)]">{student.className}</p>
            </div>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Activity className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--ink)]">Academic timeline</h2>
          </div>
          <LineChartCard data={student.weeklyTrend} />
        </div>

        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Gauge className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--ink)]">Plain-language AI explanation</h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-[var(--ink-soft)]">
            <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Positive contributors</p>
              <ul className="list-disc space-y-1 pl-5">
                {positiveFactors.map((factor) => (
                  <li key={factor.id}>{factor.detail}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Things to watch</p>
              <ul className="list-disc space-y-1 pl-5">
                {negativeFactors.map((factor) => (
                  <li key={factor.id}>{factor.detail}</li>
                ))}
              </ul>
            </div>

            <p>
              The model predicts a {student.riskLevel}-risk pattern if the current study routine continues, but it is a model estimate rather than a guaranteed outcome.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Heatmap data={student.subjects.map(({ subject, currentScore }) => ({ subject, currentScore }))} />

        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--ink)]">Key metrics</h2>
          </div>

          <div className="space-y-3 text-sm text-[var(--ink-soft)]">
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
              <span>GPA</span>
              <span className="font-semibold text-[var(--ink)]">{student.gpa.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
              <span>Attendance</span>
              <span className="font-semibold text-[var(--ink)]">{student.attendancePct}%</span>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
              <span>Predicted performance</span>
              <span className="font-semibold text-[var(--ink)]">{student.performanceScore}</span>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
              <span>Risk score</span>
              <span className="font-semibold text-[var(--ink)]">{student.riskScore}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
        <div className="mb-5 flex items-center gap-3">
          <CalendarRange className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="text-xl font-bold text-[var(--ink)]">Upcoming assessment plan</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {student.upcomingExams.map((exam) => (
            <div key={exam.subject} className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
              <p className="text-sm font-semibold text-[var(--ink)]">{exam.subject}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Exam date</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                {new Date(exam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
