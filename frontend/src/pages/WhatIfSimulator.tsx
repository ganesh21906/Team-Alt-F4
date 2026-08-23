import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle, Gauge, HelpCircle, School, Sparkles } from 'lucide-react';

import { api } from '../lib/api';
import type { WhatIfInput, WhatIfResult } from '../lib/types';
import { useSessionStore } from '../store/sessionStore';

const emptyResult: WhatIfResult = {
  currentScore: 0,
  simulatedScore: 0,
  predictedRisk: 'low',
  deltaFromCurrent: 0,
  scenarioLabel: 'Model-simulated scenario',
  explanation: 'This result is a model estimate based on parameter sensitivities.',
};

export function WhatIfSimulator() {
  const [input, setInput] = useState<WhatIfInput>({ attendancePct: 88, assessmentScore: 78, assignmentScore: 72 });
  const [prediction, setPrediction] = useState<WhatIfResult>(emptyResult);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { studentLevel } = useSessionStore();

  const isSchool = studentLevel === 'school';

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await api.predictWhatIf(input, studentLevel);
        if (active) {
          setPrediction(result);
          setLoading(false);
        }
      } catch {
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [input, studentLevel]);

  const updateField = (field: keyof WhatIfInput, value: number) => {
    setInput((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      {/* Slider Controls */}
      <div className="pro-card p-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <span className="eyebrow-label">COUNTERFACTUAL ENGINE</span>
              <h1 className="mt-0.5 text-xl font-bold text-white">What-If Scenario Simulator</h1>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
            {isSchool ? <School className="h-3.5 w-3.5 text-indigo-400" /> : <BookOpen className="h-3.5 w-3.5 text-indigo-400" />}
            {isSchool ? 'Secondary (0-20)' : 'Higher Ed (GPA)'}
          </span>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Adjust key effort parameters below to test model counterfactual scenarios and view real-time score trajectory projections.
        </p>

        <div className="mt-6 space-y-6">
          {[
            { label: 'Cumulative Attendance Rate', value: input.attendancePct, unit: '%', min: 40, max: 100, step: 1, key: 'attendancePct', hint: 'Impacts baseline participation features' },
            { label: 'Midterm Assessment Score', value: input.assessmentScore, unit: isSchool ? ' Marks' : '%', min: 40, max: 100, step: 1, key: 'assessmentScore', hint: 'Primary academic performance feature' },
            { label: 'Assignment Completion & Effort', value: input.assignmentScore, unit: '%', min: 40, max: 100, step: 1, key: 'assignmentScore', hint: 'Study time & homework consistency proxy' },
          ].map((field) => (
            <div key={field.label} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-200">{field.label}</span>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-indigo-400 border border-indigo-500/20 font-bold">
                  {field.value}{field.unit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">{field.hint}</p>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={field.value}
                onChange={(event) => updateField(field.key as keyof WhatIfInput, Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Output Card */}
      <div className="pro-card p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="eyebrow-label">LIVE MODEL OUTPUT</span>
            <h2 className="mt-0.5 text-lg font-bold text-white">Simulated Performance Result</h2>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            {prediction.predictedRisk.toUpperCase()} RISK BAND
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center text-xs font-semibold text-slate-400">
            Executing scenario inference against live FastAPI model server…
          </div>
        ) : error ? (
          <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center text-xs font-semibold text-rose-400">
            Scenario evaluation endpoint unavailable.
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/80 p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{prediction.scenarioLabel}</p>
              <div className="mt-2 flex items-baseline justify-center gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-white">
                  {isSchool ? (prediction.simulatedScore * 0.2).toFixed(1) : prediction.simulatedScore}
                </span>
                <span className="text-xs font-semibold text-slate-400">{isSchool ? '/ 20 marks' : '% score'}</span>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-slate-400">Baseline Score</span>
                <span className="font-semibold text-slate-200">
                  {isSchool ? (prediction.currentScore * 0.2).toFixed(1) : prediction.currentScore}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-slate-400">Simulated Delta</span>
                <span className="font-semibold text-emerald-400">+{prediction.deltaFromCurrent}%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-slate-400">Risk Trajectory</span>
                <span className="font-semibold text-white capitalize">{prediction.predictedRisk} Risk Band</span>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs leading-relaxed text-slate-300">
              <p className="font-bold text-white mb-1">Scenario Explanation</p>
              <p>{prediction.explanation}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
