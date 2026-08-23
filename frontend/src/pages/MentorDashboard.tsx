import { ArrowRight, Filter, ShieldAlert, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { DonutChart } from '../components/charts/DonutChart';
import { MetricCard } from '../components/cards/MetricCard';
import { RiskBadge } from '../components/cards/RiskBadge';
import { api } from '../lib/api';
import type { FacultyDashboardData, RiskLevel } from '../lib/types';

function LoadingState() {
  return <div className="pro-card p-12 text-center text-xs font-semibold text-slate-400">Loading cohort intervention console…</div>;
}

function EmptyState() {
  return <div className="pro-card p-12 text-center border-dashed text-xs font-semibold text-slate-400">No cohort data available for display.</div>;
}

function ErrorState() {
  return <div className="pro-card p-12 text-center text-xs font-semibold text-rose-400">Unable to load mentor cohort analytics.</div>;
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
      {/* Console Header */}
      <section className="pro-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="eyebrow-label">FACULTY & MENTOR CONSOLE</span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Cohort Intervention Overview</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
              <Filter className="h-3.5 w-3.5 text-indigo-400" />
              <span>Filter Risk Level:</span>
              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value as 'all' | RiskLevel)}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
              >
                <option value="all">All Risk Categories</option>
                <option value="low">Low Risk Only</option>
                <option value="medium">Medium Risk Only</option>
                <option value="high">High Risk Only</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Cohort Summary Metrics */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Cohort Size" value={String(dashboard.totalStudents)} hint="Enrolled students monitored" accent="blue" icon={<Users className="h-5 w-5 text-indigo-400" />} />
        <MetricCard label="High-Risk Priority" value={String(dashboard.highRiskCount)} hint="Requires immediate support" accent="amber" icon={<ShieldAlert className="h-5 w-5 text-rose-400" />} />
        <MetricCard label="Medium-Risk Monitor" value={String(dashboard.mediumRiskCount)} hint="Under close monitoring" accent="purple" icon={<Users className="h-5 w-5 text-amber-400" />} />
        <MetricCard label="Low-Risk Stable" value={String(dashboard.lowRiskCount)} hint="Stable trajectory" accent="emerald" icon={<ArrowRight className="h-5 w-5 text-emerald-400" />} />
      </section>

      {/* Roster Table & Donut Chart */}
      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="pro-card p-6">
          <div className="mb-4">
            <span className="eyebrow-label">INTERVENTION ROSTER</span>
            <h2 className="mt-1 text-lg font-bold text-white">Priority Student Roster</h2>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">GPA / Score</th>
                  <th className="px-4 py-3">Risk State</th>
                  <th className="px-4 py-3">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {students.length ? (
                  students.map((student) => (
                    <tr key={student.id} className="transition hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <Link to={`/student/profile/${student.id}`} className="flex items-center gap-3 font-semibold text-white hover:text-indigo-400">
                          <img src={student.avatarUrl} alt={student.name} className="h-8 w-8 rounded-lg object-cover border border-slate-700" />
                          {student.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{student.gpa}</td>
                      <td className="px-4 py-3">
                        <RiskBadge level={student.riskLevel} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-300">{student.attendancePct}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">
                      No student records match the selected risk category filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DonutChart data={dashboard.riskDistribution} />
      </section>

      {/* Priority Action Cards */}
      <section className="pro-card p-6">
        <div className="mb-4">
          <span className="eyebrow-label">ACTION PLAN</span>
          <h2 className="mt-1 text-lg font-bold text-white">Recommended Cohort Interventions</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {dashboard.interventions.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-bold text-white">{item.title}</p>
                <RiskBadge level={item.priority === 'high' ? 'high' : item.priority === 'medium' ? 'medium' : 'low'} />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
              <div className="mt-3 border-t border-slate-800/80 pt-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Action Step</span>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
