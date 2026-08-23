import { AlertTriangle, ArrowUpRight, BookOpen, BookOpenCheck, CalendarDays, Clock3, GraduationCap, School, TrendingUp, CheckSquare, Plus, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { LineChartCard } from '../components/charts/LineChartCard';
import { MetricCard } from '../components/cards/MetricCard';
import { ProgressRing } from '../components/cards/ProgressRing';
import { RiskBadge } from '../components/cards/RiskBadge';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import type { Student, StudentTask } from '../lib/types';
import { useSessionStore } from '../store/sessionStore';

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
  const [taskInput, setTaskInput] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const { studentLevel, studentId } = useSessionStore();

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await api.getStudentProfile(studentLevel, studentId);
      setStudent(result);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(true);
  }, [studentLevel, studentId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!student) return <EmptyState />;

  const isSchool = studentLevel === 'school';

  const handleAddTask = async (text: string) => {
    if (!text.trim() || !student) return;
    setAddingTask(true);
    try {
      await api.addTask(student.id, text);
      setTaskInput('');
      await loadData(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (!student) return;
    const nextStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    try {
      // Toggle on the server, which triggers risk and feature recalculations
      await api.toggleTask(student.id, taskId, nextStatus);
      // Reload profile to reflect live model risk shifts
      await loadData(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Group tasks
  const studentTasks = student.tasks || [];
  const todoTasks = studentTasks.filter(t => t.status !== 'completed');
  const completedTasks = studentTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      <section className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img src={student.avatarUrl} alt={student.name} className="h-16 w-16 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <p className="eyebrow">Welcome back</p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                  {isSchool ? <School className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                  {isSchool ? 'School Student' : 'College Student'}
                </span>
              </div>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] text-[var(--ink)]">{student.name}</h1>
              <p className="text-sm text-[var(--ink-soft)]">{student.className} • {isSchool ? 'Secondary Education (0-20 scale)' : 'Higher Education (GPA / 0-100 scale)'}</p>
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
        <MetricCard label="Predicted performance" value={isSchool ? `${(student.performanceScore * 0.2).toFixed(1)} / 20` : `${student.performanceScore}%`} hint="Model-predicted academic outcome" accent="blue" icon={<TrendingUp className="h-5 w-5 text-[var(--accent)]" />} />
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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <LineChartCard data={student.weeklyTrend} />

        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">AI guidance</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Recommendations</h2>
            </div>
          </div>

          <ul className="space-y-3">
            {student.recommendations.map((recommendation, index) => {
              const alreadyAdded = studentTasks.some(t => t.text === recommendation.text);
              return (
                <li key={recommendation.id} className="flex flex-col gap-2.5 rounded-[12px] bg-[#fdfdf9] border border-[var(--line)] p-4">
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">{index + 1}</div>
                    <div className="space-y-1 text-sm leading-6 text-[var(--ink-soft)]">
                      <p className="font-semibold text-[var(--ink)]">{recommendation.title}</p>
                      <p>{recommendation.text}</p>
                    </div>
                  </div>
                  <div className="mt-1 flex justify-end">
                    <Button
                      variant={alreadyAdded ? "secondary" : "outline"}
                      size="sm"
                      disabled={alreadyAdded}
                      onClick={() => handleAddTask(recommendation.text)}
                    >
                      {alreadyAdded ? 'Added to Planner' : '+ Add to Study Planner'}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* AI Study Planner Task Board Section */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
          <div className="mb-4 flex items-center gap-3">
            <ListTodo className="h-6 w-6 text-[var(--accent)]" />
            <div>
              <p className="eyebrow">AI Study Planner</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Interactive Task Board</h2>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* To Do Column */}
            <div className="rounded-[8px] bg-[#f7f7f3] border border-[var(--line)] p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ink-soft)] flex justify-between items-center">
                <span>To Do</span>
                <span className="rounded-full bg-[var(--line)] px-2 py-0.5 text-xs text-[var(--ink)] font-bold">{todoTasks.length}</span>
              </h3>
              
              <div className="space-y-3">
                {todoTasks.length === 0 ? (
                  <p className="text-xs text-[var(--ink-soft)] text-center py-6">All tasks completed! Or add a task below.</p>
                ) : (
                  todoTasks.map(task => (
                    <div key={task.id} className="flex gap-2 items-start rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-3 text-sm hover:border-[var(--accent)] transition-all">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleTask(task.id, 'todo')}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      <span className="text-[var(--ink)]">{task.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div className="rounded-[8px] bg-[#f2f4ef] border border-[var(--line)] p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)] flex justify-between items-center">
                <span>Completed</span>
                <span className="rounded-full bg-[#d7e3da] px-2 py-0.5 text-xs text-[var(--accent)] font-bold">{completedTasks.length}</span>
              </h3>
              
              <div className="space-y-3">
                {completedTasks.length === 0 ? (
                  <p className="text-xs text-[var(--ink-soft)] text-center py-6">No completed tasks yet.</p>
                ) : (
                  completedTasks.map(task => (
                    <div key={task.id} className="flex gap-2 items-start rounded-[6px] border border-[var(--line)] bg-[#f9faf6] p-3 text-sm line-through text-[var(--ink-soft)]">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleTask(task.id, 'completed')}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      <span>{task.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Creator Block */}
        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <p className="eyebrow">Action Planner</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Add Custom Study Goal</h2>
            </div>
            <p className="text-sm text-[var(--ink-soft)] mb-4">
              Define a personal study, submission, or review goal. Completing goals updates your raw study habits and dynamic risk metrics.
            </p>
            <textarea
              className="w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-3 text-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none resize-none"
              placeholder="e.g. Schedule a 2-hour mathematics study block..."
              rows={3}
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              className="w-full flex justify-center gap-1.5"
              disabled={addingTask || !taskInput.trim()}
              onClick={() => handleAddTask(taskInput)}
            >
              <Plus className="h-4 w-4" />
              <span>{addingTask ? 'Adding...' : 'Add Study Goal'}</span>
            </Button>
          </div>
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
              <span>Education Level</span>
              <span className="font-semibold text-[var(--ink)]">{isSchool ? 'School (Secondary)' : 'College (University)'}</span>
            </div>
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
