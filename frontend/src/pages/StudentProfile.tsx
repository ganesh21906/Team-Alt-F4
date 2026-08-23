import { Activity, CalendarRange, Gauge, TrendingUp, Plus, FileText, ClipboardList, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Heatmap } from '../components/charts/Heatmap';
import { LineChartCard } from '../components/charts/LineChartCard';
import { RiskBadge } from '../components/cards/RiskBadge';
import { api } from '../lib/api';
import type { Student } from '../lib/types';
import { useSessionStore } from '../store/sessionStore';
import { Button } from '../components/ui/Button';

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
  const { id } = useParams<{ id?: string }>();
  const { studentLevel, studentId, role: userRole } = useSessionStore();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Intervention modal state
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [intTitle, setIntTitle] = useState('');
  const [intPriority, setIntPriority] = useState('medium');
  const [intText, setIntText] = useState('');
  const [intAction, setIntAction] = useState('');
  const [submittingInt, setSubmittingInt] = useState(false);

  const targetStudentId = id || studentId;

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(false);
    try {
      const result = id
        ? await api.getStudentById(id)
        : await api.getStudentProfile(studentLevel, studentId);
      
      if (result) {
        setStudent(result);
      } else {
        setError(true);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(true);
  }, [id, studentLevel, studentId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!student) return <EmptyState />;

  const positiveFactors = student.riskFactors.filter((factor) => factor.impact === 'positive');
  const negativeFactors = student.riskFactors.filter((factor) => factor.impact === 'negative');
  const isMentor = userRole === 'mentor';

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intTitle.trim() || !intText.trim() || submittingInt) return;
    setSubmittingInt(true);
    try {
      await api.addIntervention(student.id, intTitle, intPriority, intText, intAction);
      setShowInterventionModal(false);
      setIntTitle('');
      setIntPriority('medium');
      setIntText('');
      setIntAction('');
      await loadData(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingInt(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={student.avatarUrl} alt={student.name} className="h-16 w-16 rounded-full object-cover" />
            <div>
              <p className="eyebrow">Student profile</p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] text-[var(--ink)]">{student.name}</h1>
              <p className="text-sm text-[var(--ink-soft)]">{student.className} • {student.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <RiskBadge level={student.riskLevel} />
            {isMentor && (
              <Button variant="primary" onClick={() => setShowInterventionModal(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Log Intervention</span>
              </Button>
            )}
          </div>
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

      {/* Intervention Log Feed Timeline */}
      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--ink)]">Coaching & Intervention History</h2>
          </div>
          {isMentor && (
            <Button variant="outline" size="sm" onClick={() => setShowInterventionModal(true)}>
              + Add Log Entry
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {(!student.interventions || student.interventions.length === 0) ? (
            <div className="border border-dashed border-[var(--line)] bg-[#fdfdf9] rounded-[8px] p-6 text-center text-sm text-[var(--ink-soft)]">
              No formal interventions have been logged for this student yet.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-[var(--line)] ml-3 space-y-6">
              {student.interventions.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <span className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-4 border-[var(--paper)] ${
                    item.priority === 'high' ? 'bg-[var(--risk-high)]' : item.priority === 'medium' ? 'bg-[var(--risk-mid)]' : 'bg-[var(--risk-low)]'
                  }`} />
                  
                  <div className="rounded-[12px] border border-[var(--line)] bg-[#fdfdf9] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <h3 className="text-base font-bold text-[var(--ink)] mt-1">{item.title}</h3>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        item.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
                        item.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {item.priority} priority
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[var(--ink-soft)] leading-relaxed">{item.text}</p>
                    {item.action && (
                      <div className="mt-4 flex gap-2 items-center text-xs font-medium text-[var(--ink)] border-t border-[var(--line)] pt-3 bg-transparent">
                        <FileText className="h-4 w-4 text-[var(--ink-soft)]" />
                        <span className="text-[var(--ink-soft)]">Advisor Action:</span>
                        <span className="font-semibold">{item.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Log Intervention Modal */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-[500px] rounded-[18px] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-[var(--ink)] mb-1 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[var(--accent)]" />
              <span>Log Student Intervention</span>
            </h2>
            <p className="text-xs text-[var(--ink-soft)] mb-5">
              Initiate a formal coaching action plan, warning contract, or milestone timeline.
            </p>

            <form onSubmit={handleCreateIntervention} className="space-y-4 text-sm text-[var(--ink)]">
              <div>
                <label className="block font-medium mb-1.5">Contract Title / Focus</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Math Tutoring Assignment"
                  value={intTitle}
                  onChange={e => setIntTitle(e.target.value)}
                  className="w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-2.5 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1.5">Alert Level</label>
                  <select
                    value={intPriority}
                    onChange={e => setIntPriority(e.target.value)}
                    className="w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-2.5 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1.5">Action Code</label>
                  <input
                    type="text"
                    placeholder="e.g. Check-in on Friday"
                    value={intAction}
                    onChange={e => setIntAction(e.target.value)}
                    className="w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-2.5 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1.5">Contract & Counseling Notes</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed guidelines, objectives, or behavior changes agreed with the student..."
                  value={intText}
                  onChange={e => setIntText(e.target.value)}
                  className="w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-2.5 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <Button variant="secondary" type="button" onClick={() => setShowInterventionModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submittingInt || !intTitle.trim() || !intText.trim()}>
                  {submittingInt ? 'Creating...' : 'Create Contract'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
