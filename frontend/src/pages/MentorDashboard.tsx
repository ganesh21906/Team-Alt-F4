import { ArrowRight, Filter, ShieldAlert, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { DonutChart } from '../components/charts/DonutChart';
import { MetricCard } from '../components/cards/MetricCard';
import { RiskBadge } from '../components/cards/RiskBadge';
import { api } from '../lib/api';
import type { FacultyDashboardData, RiskLevel } from '../lib/types';

function LoadingState() {
  return <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-8 text-center text-sm text-[var(--ink-soft)]">Loading faculty dashboard…</div>;
}

function EmptyState() {
  return <div className="rounded-[12px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-8 text-center text-sm text-[var(--ink-soft)]">No cohort data is available yet.</div>;
}

function ErrorState() {
  return <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-8 text-center text-sm text-[var(--ink)]">The faculty dashboard could not be loaded right now.</div>;
}

export function MentorDashboard() {
  const [dashboard, setDashboard] = useState<FacultyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const result = await api.getFacultyDashboard();
        if (mounted) {
          setDashboard(result);
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

  const students = useMemo(() => {
    if (!dashboard) return [];

    return [...dashboard.students]
      .filter((student) => (riskFilter === 'all' ? true : student.riskLevel === riskFilter))
      .sort((a, b) => b.riskScore - a.riskScore || b.gpa - a.gpa);
  }, [dashboard, riskFilter]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!dashboard) return <EmptyState />;

  return (
    <div className="space-y-6">
      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Faculty dashboard</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] text-[var(--ink)]">Cohort overview</h1>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-medium text-[var(--ink)]">
              <Filter className="h-4 w-4" />
              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value as 'all' | RiskLevel)}
                className="bg-transparent text-sm font-medium text-[var(--ink)] outline-none"
              >
                <option value="all">All risk levels</option>
                <option value="low">Low risk</option>
                <option value="medium">Medium risk</option>
                <option value="high">High risk</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total students" value={String(dashboard.totalStudents)} hint="Across the current cohort" accent="blue" icon={<Users className="h-5 w-5 text-[var(--accent)]" />} />
        <MetricCard label="High-risk count" value={String(dashboard.highRiskCount)} hint="Needs intervention" accent="amber" icon={<ShieldAlert className="h-5 w-5 text-[var(--risk-high)]" />} />
        <MetricCard label="Medium-risk count" value={String(dashboard.mediumRiskCount)} hint="Monitor closely" accent="purple" icon={<Users className="h-5 w-5 text-[var(--accent)]" />} />
        <MetricCard label="Low-risk count" value={String(dashboard.lowRiskCount)} hint="Stable pattern" accent="emerald" icon={<ArrowRight className="h-5 w-5 text-[var(--risk-low)]" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Student list</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Intervention priority</h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-[12px] border border-[var(--line)]">
            <table className="min-w-full divide-y divide-[var(--line)] text-left">
              <thead className="bg-[var(--paper)] text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">GPA</th>
                  <th className="px-4 py-3 font-semibold">Risk</th>
                  <th className="px-4 py-3 font-semibold">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] bg-[var(--paper)] text-sm text-[var(--ink)]">
                {students.length ? students.map((student) => (
                  <tr key={student.id} className="hover:bg-[var(--accent-soft)]">
                    <td className="px-4 py-3">
                      <Link to={`/student/profile/${student.id}`} className="flex items-center gap-3 font-medium text-[var(--ink)] hover:text-[var(--accent)]">
                        <img src={student.avatarUrl} alt={student.name} className="h-9 w-9 rounded-full object-cover" />
                        {student.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{student.gpa}</td>
                    <td className="px-4 py-3"><RiskBadge level={student.riskLevel} /></td>
                    <td className="px-4 py-3">{student.attendancePct}%</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--ink-soft)]">No students match the selected filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DonutChart data={dashboard.riskDistribution} />
      </section>

      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
        <div className="mb-4">
          <p className="eyebrow">Intervention cards</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Priority actions</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {dashboard.interventions.map((item) => (
            <div key={item.id} className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[var(--ink)]">{item.title}</p>
                <RiskBadge level={item.priority === 'high' ? 'high' : item.priority === 'medium' ? 'medium' : 'low'} />
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{item.text}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Action</p>
              <p className="mt-2 text-sm text-[var(--ink)]">{item.action}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
