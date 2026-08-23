import { ArrowRight, Filter, ShieldAlert, Users, Settings, Database, Activity, Check, X, AlertTriangle, CheckSquare, BarChart3, TrendingUp, BarChart2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { DonutChart } from '../components/charts/DonutChart';
import { MetricCard } from '../components/cards/MetricCard';
import { RiskBadge } from '../components/cards/RiskBadge';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import type { FacultyDashboardData, FacultyStudentRow, RiskLevel, ModelDiagnostics } from '../lib/types';

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
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'cohort' | 'governance'>('cohort');

  // Diagnostics and thresholds state
  const [diagnostics, setDiagnostics] = useState<ModelDiagnostics | null>(null);
  const [thresholds, setThresholds] = useState({
    school_high: 10.0,
    school_medium: 14.0,
    college_high: 60.0,
    college_medium: 80.0
  });
  const [updatingThresholds, setUpdatingThresholds] = useState(false);

  // Selection for comparison
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await api.getFacultyDashboard();
      setDashboard(result);
      
      const threshRes = await api.getThresholds();
      setThresholds(threshRes);
      
      const diagRes = await api.getModelDiagnostics();
      setDiagnostics(diagRes);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(true);
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

  const handleThresholdChange = (key: string, val: number) => {
    setThresholds(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveThresholds = async () => {
    setUpdatingThresholds(true);
    try {
      await api.updateThresholds(thresholds);
      await loadData(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingThresholds(false);
    }
  };

  // Student list row checkbox handlers
  const handleToggleSelect = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedStudentIds(students.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  // Compare detail mapping
  const selectedStudentsData = dashboard.students.filter(s => selectedStudentIds.includes(s.id));

  return (
    <div className="space-y-6">
      {/* Title & Tabs section */}
      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Faculty dashboard</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] text-[var(--ink)]">Cohort overview</h1>
          </div>

          <div className="flex items-center gap-2 border border-[var(--line)] bg-[#f7f7f3] rounded-[8px] p-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('cohort')}
              className={`px-4 py-2 rounded-[6px] transition-all ${activeTab === 'cohort' ? 'bg-[#12231f] text-[#d6efe2]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
            >
              Cohort Analytics
            </button>
            <button
              onClick={() => setActiveTab('governance')}
              className={`px-4 py-2 rounded-[6px] transition-all flex items-center gap-1.5 ${activeTab === 'governance' ? 'bg-[#12231f] text-[#d6efe2]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
            >
              <Settings className="h-4 w-4" />
              <span>Model Governance</span>
            </button>
          </div>
        </div>
      </section>

      {activeTab === 'cohort' ? (
        <>
          {/* Metrics summary grid */}
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total students" value={String(dashboard.totalStudents)} hint="Across the current cohort" accent="blue" icon={<Users className="h-5 w-5 text-[var(--accent)]" />} />
            <MetricCard label="High-risk count" value={String(dashboard.highRiskCount)} hint="Needs intervention" accent="amber" icon={<ShieldAlert className="h-5 w-5 text-[var(--risk-high)]" />} />
            <MetricCard label="Medium-risk count" value={String(dashboard.mediumRiskCount)} hint="Monitor closely" accent="purple" icon={<Users className="h-5 w-5 text-[var(--accent)]" />} />
            <MetricCard label="Low-risk count" value={String(dashboard.lowRiskCount)} hint="Stable pattern" accent="emerald" icon={<ArrowRight className="h-5 w-5 text-[var(--risk-low)]" />} />
          </section>

          {/* Student list + Selection Action header */}
          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Student list</p>
                  <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Intervention priority</h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Select status button */}
                  {selectedStudentIds.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowComparisonModal(true)}
                      className="animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      Compare Profiles ({selectedStudentIds.length})
                    </Button>
                  )}

                  <label className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
                    <Filter className="h-3.5 w-3.5 text-[var(--ink-soft)]" />
                    <select
                      value={riskFilter}
                      onChange={(event) => setRiskFilter(event.target.value as 'all' | RiskLevel)}
                      className="bg-transparent outline-none cursor-pointer"
                    >
                      <option value="all">All risk levels</option>
                      <option value="low">Low risk</option>
                      <option value="medium">Medium risk</option>
                      <option value="high">High risk</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Student table grid */}
              <div className="overflow-hidden rounded-[12px] border border-[var(--line)]">
                <table className="min-w-full divide-y divide-[var(--line)] text-left">
                  <thead className="bg-[var(--paper)] text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)] border-b border-[var(--line)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold w-8">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.length === students.length && students.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold text-center w-20">GPA</th>
                      <th className="px-4 py-3 font-semibold text-center w-32">Risk Level</th>
                      <th className="px-4 py-3 font-semibold text-center w-28">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] bg-[var(--paper)] text-sm text-[var(--ink)]">
                    {students.length ? students.map((student) => (
                      <tr
                        key={student.id}
                        className={`transition-all hover:bg-[var(--accent-soft)] ${selectedStudentIds.includes(student.id) ? 'bg-[#f4faf7]' : ''}`}
                      >
                        <td className="px-4 py-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => handleToggleSelect(student.id)}
                            className="h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/student/profile/${student.id}`} className="flex items-center gap-3 font-medium text-[var(--ink)] hover:text-[var(--accent)]">
                            <img src={student.avatarUrl} alt={student.name} className="h-9 w-9 rounded-full object-cover border border-[var(--line)]" />
                            <div>
                              <p className="font-semibold leading-tight">{student.name}</p>
                              <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">{student.className}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold">{student.gpa.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex justify-center">
                            <RiskBadge level={student.riskLevel} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold">{student.attendancePct}%</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--ink-soft)]">No students match the selected filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <DonutChart data={dashboard.riskDistribution} />
          </section>

          {/* Intervention logs */}
          <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
            <div className="mb-4">
              <p className="eyebrow">Intervention cards</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Priority actions</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {dashboard.interventions.map((item) => (
                <div key={item.id} className="rounded-[12px] border border-[var(--line)] bg-[#fdfdf9] p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-[var(--ink)]">{item.title}</p>
                    <RiskBadge level={item.priority === 'high' ? 'high' : item.priority === 'medium' ? 'medium' : 'low'} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{item.text}</p>
                  <div className="mt-4 border-t border-[var(--line)] pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--ink-soft)]">
                    <span>Action Plan:</span>
                    <span className="font-semibold text-[var(--ink)] mt-1 sm:mt-0">{item.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Model Governance Tab View */
        <div className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Interactive Threshold Configuration Card */}
            <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
              <div className="mb-4 flex items-center gap-3">
                <Database className="h-5 w-5 text-[var(--accent)]" />
                <div>
                  <p className="eyebrow">Alert Settings</p>
                  <h2 className="text-xl font-bold text-[var(--ink)]">Risk Boundary Tuning</h2>
                </div>
              </div>
              <p className="text-sm text-[var(--ink-soft)] mb-6">
                Adjust predicted metrics that classify high/medium risks. Moving slides dynamically recomputes active risk categorizations for the entire cohort.
              </p>

              <div className="space-y-6 text-sm text-[var(--ink)]">
                {/* High School Boundaries */}
                <div className="border border-[var(--line)] rounded-[8px] p-4 bg-[#fdfdf9]">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--ink-soft)] mb-4">High School Boundaries (0 - 20)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>High Risk Trigger (Predicted score &lt;)</span>
                        <span className="font-mono font-bold text-[var(--risk-high)]">{thresholds.school_high.toFixed(1)}</span>
                      </div>
                      <input
                        type="range" min="6.0" max="15.0" step="0.5"
                        value={thresholds.school_high}
                        onChange={e => handleThresholdChange('school_high', parseFloat(e.target.value))}
                        className="w-full h-1 bg-[var(--line)] rounded-lg appearance-none cursor-pointer accent-[var(--risk-high)]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Medium Risk Trigger (Predicted score &lt;)</span>
                        <span className="font-mono font-bold text-[var(--risk-mid)]">{thresholds.school_medium.toFixed(1)}</span>
                      </div>
                      <input
                        type="range" min="10.0" max="18.0" step="0.5"
                        value={thresholds.school_medium}
                        onChange={e => handleThresholdChange('school_medium', parseFloat(e.target.value))}
                        className="w-full h-1 bg-[var(--line)] rounded-lg appearance-none cursor-pointer accent-[var(--risk-mid)]"
                      />
                    </div>
                  </div>
                </div>

                {/* College Boundaries */}
                <div className="border border-[var(--line)] rounded-[8px] p-4 bg-[#fdfdf9]">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--ink-soft)] mb-4">College Boundaries (0% - 100%)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>High Risk Trigger (Score &lt;)</span>
                        <span className="font-mono font-bold text-[var(--risk-high)]">{thresholds.college_high}%</span>
                      </div>
                      <input
                        type="range" min="40" max="75" step="5"
                        value={thresholds.college_high}
                        onChange={e => handleThresholdChange('college_high', parseInt(e.target.value))}
                        className="w-full h-1 bg-[var(--line)] rounded-lg appearance-none cursor-pointer accent-[var(--risk-high)]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Medium Risk Trigger (Score &lt;)</span>
                        <span className="font-mono font-bold text-[var(--risk-mid)]">{thresholds.college_medium}%</span>
                      </div>
                      <input
                        type="range" min="60" max="90" step="5"
                        value={thresholds.college_medium}
                        onChange={e => handleThresholdChange('college_medium', parseInt(e.target.value))}
                        className="w-full h-1 bg-[var(--line)] rounded-lg appearance-none cursor-pointer accent-[var(--risk-mid)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[var(--line)]">
                  <Button variant="primary" disabled={updatingThresholds} onClick={handleSaveThresholds}>
                    {updatingThresholds ? 'Applying Changes...' : 'Save & Recompute Risk Alerting'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Model Evaluation Metrics Benchmarks */}
            <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
              <div className="mb-4 flex items-center gap-3">
                <Activity className="h-5 w-5 text-[var(--accent)]" />
                <div>
                  <p className="eyebrow">Governance telemetry</p>
                  <h2 className="text-xl font-bold text-[var(--ink)]">Validation Performance</h2>
                </div>
              </div>
              <p className="text-sm text-[var(--ink-soft)] mb-6">
                Active test metrics retrieved from cross-validated model pipelines during offline training sessions.
              </p>

              {diagnostics && (
                <div className="space-y-5 text-sm text-[var(--ink)]">
                  {/* High School Model metrics */}
                  <div className="rounded-[8px] border border-[var(--line)] bg-[#fdfdf9] p-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--ink-soft)] mb-3 flex items-center justify-between">
                      <span>Secondary School Pipeline (GBR)</span>
                      <span className="font-mono text-[10px] text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">v1.2.0</span>
                    </h3>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-[var(--paper)] p-2 border border-[var(--line)] rounded-[4px]">
                        <p className="text-[10px] text-[var(--ink-soft)]">Accuracy</p>
                        <p className="text-base font-bold text-[var(--ink)] mt-1">{(diagnostics.accuracy_benchmarks.school.accuracy * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-[var(--paper)] p-2 border border-[var(--line)] rounded-[4px]">
                        <p className="text-[10px] text-[var(--ink-soft)]">Precision</p>
                        <p className="text-base font-bold text-[var(--ink)] mt-1">{(diagnostics.accuracy_benchmarks.school.precision * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-[var(--paper)] p-2 border border-[var(--line)] rounded-[4px]">
                        <p className="text-[10px] text-[var(--ink-soft)]">Recall</p>
                        <p className="text-base font-bold text-[var(--ink)] mt-1">{(diagnostics.accuracy_benchmarks.school.recall * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-[var(--paper)] p-2 border border-[var(--line)] rounded-[4px]">
                        <p className="text-[10px] text-[var(--ink-soft)]">F1-Score</p>
                        <p className="text-base font-bold text-[var(--ink)] mt-1">{(diagnostics.accuracy_benchmarks.school.f1 * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* College Model metrics */}
                  <div className="rounded-[8px] border border-[var(--line)] bg-[#fdfdf9] p-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--ink-soft)] mb-3 flex items-center justify-between">
                      <span>Higher Ed Pipeline (XGBoost)</span>
                      <span className="font-mono text-[10px] text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">v2.1.0</span>
                    </h3>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-[var(--paper)] p-2 border border-[var(--line)] rounded-[4px]">
                        <p className="text-[10px] text-[var(--ink-soft)]">Accuracy</p>
                        <p className="text-base font-bold text-[var(--ink)] mt-1">{(diagnostics.accuracy_benchmarks.college.accuracy * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-[var(--paper)] p-2 border border-[var(--line)] rounded-[4px]">
                        <p className="text-[10px] text-[var(--ink-soft)]">Precision</p>
                        <p className="text-base font-bold text-[var(--ink)] mt-1">{(diagnostics.accuracy_benchmarks.college.precision * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-[var(--paper)] p-2 border border-[var(--line)] rounded-[4px]">
                        <p className="text-[10px] text-[var(--ink-soft)]">Recall</p>
                        <p className="text-base font-bold text-[var(--ink)] mt-1">{(diagnostics.accuracy_benchmarks.college.recall * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-[var(--paper)] p-2 border border-[var(--line)] rounded-[4px]">
                        <p className="text-[10px] text-[var(--ink-soft)]">F1-Score</p>
                        <p className="text-base font-bold text-[var(--ink)] mt-1">{(diagnostics.accuracy_benchmarks.college.f1 * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[8px] bg-[var(--accent-soft)] p-3.5 border border-[#1f5f46]/10 text-xs text-[#1f5f46] flex gap-2">
                    <TrendingUp className="h-4.5 w-4.5 shrink-0" />
                    <span>Explainability features are calculated locally using linear tree SHAP approximations on 100% of validated student rows.</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Global feature importance SHAP metrics */}
          <section className="grid gap-6 lg:grid-cols-2">
            {diagnostics && (
              <>
                {/* Secondary School Global SHAP */}
                <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="eyebrow">Global SHAP Importance</p>
                      <h2 className="text-xl font-bold text-[var(--ink)]">Secondary School Model</h2>
                    </div>
                    <BarChart3 className="h-5 w-5 text-[var(--ink-soft)]" />
                  </div>
                  <div className="space-y-4">
                    {diagnostics.global_shap.school.map(item => (
                      <div key={item.feature} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{item.feature.toUpperCase()} ({item.category})</span>
                          <span>{(item.importance * 100).toFixed(0)}% weight</span>
                        </div>
                        <div className="h-2 bg-[var(--line)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--accent)]" style={{ width: `${item.importance * 200}%` }} />
                        </div>
                        <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* College Global SHAP */}
                <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="eyebrow">Global SHAP Importance</p>
                      <h2 className="text-xl font-bold text-[var(--ink)]">Higher Education Model</h2>
                    </div>
                    <BarChart2 className="h-5 w-5 text-[var(--ink-soft)]" />
                  </div>
                  <div className="space-y-4">
                    {diagnostics.global_shap.college.map(item => (
                      <div key={item.feature} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{item.feature} ({item.category})</span>
                          <span>{(item.importance * 100).toFixed(0)}% weight</span>
                        </div>
                        <div className="h-2 bg-[var(--line)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--accent)]" style={{ width: `${item.importance * 200}%` }} />
                        </div>
                        <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Multi-Student Profile Comparison Matrix Overlay Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-[850px] rounded-[18px] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start border-b border-[var(--line)] pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink)]">Cohort Profile Comparison</h2>
                <p className="text-xs text-[var(--ink-soft)] mt-0.5">Contrasting student baseline features and model metrics side-by-side.</p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="h-8 w-8 rounded-full border border-[var(--line)] hover:bg-[var(--line)] flex items-center justify-center transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-auto flex-1 border border-[var(--line)] rounded-[8px] bg-[#fdfdf9]">
              <table className="min-w-full divide-y divide-[var(--line)] text-left text-sm text-[var(--ink)]">
                <thead>
                  <tr className="bg-[var(--paper)] divide-x divide-[var(--line)] border-b border-[var(--line)]">
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--ink-soft)]">Metric</th>
                    {selectedStudentsData.map(s => (
                      <th key={s.id} className="px-4 py-3 font-bold text-center">
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <img src={s.avatarUrl} className="h-10 w-10 rounded-full object-cover border border-[var(--line)]" />
                          <span className="leading-tight">{s.name}</span>
                          <span className="text-[10px] font-mono text-[var(--ink-soft)]">{s.id}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {/* Class row */}
                  <tr className="divide-x divide-[var(--line)]">
                    <td className="px-4 py-3 font-medium bg-[var(--paper)] text-xs uppercase tracking-wider text-[var(--ink-soft)]">ClassName / Major</td>
                    {selectedStudentsData.map(s => (
                      <td key={s.id} className="px-4 py-3 text-center font-medium">{s.className}</td>
                    ))}
                  </tr>
                  {/* GPA row */}
                  <tr className="divide-x divide-[var(--line)]">
                    <td className="px-4 py-3 font-medium bg-[var(--paper)] text-xs uppercase tracking-wider text-[var(--ink-soft)]">Current GPA</td>
                    {selectedStudentsData.map(s => (
                      <td key={s.id} className="px-4 py-3 text-center font-mono font-bold text-base">{s.gpa.toFixed(1)}</td>
                    ))}
                  </tr>
                  {/* Attendance row */}
                  <tr className="divide-x divide-[var(--line)]">
                    <td className="px-4 py-3 font-medium bg-[var(--paper)] text-xs uppercase tracking-wider text-[var(--ink-soft)]">Attendance Rate</td>
                    {selectedStudentsData.map(s => (
                      <td key={s.id} className="px-4 py-3 text-center font-mono">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold">{s.attendancePct}%</span>
                          <div className="h-1.5 w-24 bg-[var(--line)] rounded-full overflow-hidden">
                            <div className={`h-full ${s.attendancePct < 75 ? 'bg-[var(--risk-high)]' : s.attendancePct < 90 ? 'bg-[var(--risk-mid)]' : 'bg-[var(--risk-low)]'}`} style={{ width: `${s.attendancePct}%` }} />
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Risk Level row */}
                  <tr className="divide-x divide-[var(--line)]">
                    <td className="px-4 py-3 font-medium bg-[var(--paper)] text-xs uppercase tracking-wider text-[var(--ink-soft)]">Risk Level</td>
                    {selectedStudentsData.map(s => (
                      <td key={s.id} className="px-4 py-3 text-center">
                        <div className="inline-flex">
                          <RiskBadge level={s.riskLevel} />
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Risk Score row */}
                  <tr className="divide-x divide-[var(--line)]">
                    <td className="px-4 py-3 font-medium bg-[var(--paper)] text-xs uppercase tracking-wider text-[var(--ink-soft)]">Risk Score Intensity</td>
                    {selectedStudentsData.map(s => (
                      <td key={s.id} className="px-4 py-3 text-center font-mono font-bold">{s.riskScore} / 100</td>
                    ))}
                  </tr>
                  {/* Actions row */}
                  <tr className="divide-x divide-[var(--line)]">
                    <td className="px-4 py-3 font-medium bg-[var(--paper)] text-xs uppercase tracking-wider text-[var(--ink-soft)]">Next Step Action</td>
                    {selectedStudentsData.map(s => (
                      <td key={s.id} className="px-4 py-3 text-xs text-[var(--ink-soft)] leading-relaxed italic">
                        Explore profile to view localized interventions and add study plans to support.
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-4 border-t border-[var(--line)] pt-3">
              <Button variant="outline" onClick={() => setSelectedStudentIds([])}>
                Clear Selections
              </Button>
              <Button variant="primary" onClick={() => setShowComparisonModal(false)}>
                Close Matrix View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
