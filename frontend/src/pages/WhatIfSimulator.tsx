import { useEffect, useState } from 'react';
import { ArrowRight, Gauge, Sparkles } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import type { WhatIfInput, WhatIfResult } from '../lib/types';

const sliderStyle = {
  accentColor: 'var(--accent)',
};

const emptyResult: WhatIfResult = {
  currentScore: 0,
  simulatedScore: 0,
  predictedRisk: 'low',
  deltaFromCurrent: 0,
  scenarioLabel: 'Model-simulated scenario',
  explanation: 'This result is a model estimate and not a guaranteed future outcome.',
};

export function WhatIfSimulator() {
  const [input, setInput] = useState<WhatIfInput>({ attendancePct: 88, assessmentScore: 78, assignmentScore: 72 });
  const [prediction, setPrediction] = useState<WhatIfResult>(emptyResult);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await api.predictWhatIf(input);
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
  }, [input]);

  const updateField = (field: keyof WhatIfInput, value: number) => {
    setInput((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
        <div className="flex items-center gap-3">
          <Gauge className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="eyebrow">Scenario planner</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] text-[var(--ink)]">What-if simulator</h1>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {[
            { label: 'Attendance', value: input.attendancePct, min: 40, max: 100, step: 1, key: 'attendancePct' },
            { label: 'Assessment score', value: input.assessmentScore, min: 40, max: 100, step: 1, key: 'assessmentScore' },
            { label: 'Assignment score', value: input.assignmentScore, min: 40, max: 100, step: 1, key: 'assignmentScore' },
          ].map((field) => (
            <div key={field.label}>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--ink)]">
                <span>{field.label}</span>
                <span>{field.value}%</span>
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={field.value}
                onChange={(event) => updateField(field.key as keyof WhatIfInput, Number(event.target.value))}
                style={sliderStyle}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--line)]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Predicted outcome</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Scenario result</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            {prediction.predictedRisk === 'low' ? 'Low risk' : prediction.predictedRisk === 'medium' ? 'Medium risk' : 'High risk'}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-[12px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-5 text-sm text-[var(--ink-soft)]">Loading model-simulated scenario…</div>
        ) : error ? (
          <div className="mt-8 rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-5 text-sm text-[var(--ink)]">The simulation could not be generated right now.</div>
        ) : (
          <>
            <div className="mt-8 rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">{prediction.scenarioLabel}</p>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-5xl font-black tracking-[-0.08em] text-[var(--ink)]">{prediction.simulatedScore}</span>
                <span className="pb-1 text-sm font-semibold text-[var(--ink-soft)]">/100</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-[var(--ink-soft)]">
              <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
                <span>Current performance</span>
                <span className="font-semibold text-[var(--ink)]">{prediction.currentScore}</span>
              </div>
              <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
                <span>Projected change</span>
                <span className="font-semibold text-[var(--ink)]">+{prediction.deltaFromCurrent}%</span>
              </div>
              <div className="flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
                <span>Risk trend</span>
                <span className="font-semibold text-[var(--ink)]">{prediction.predictedRisk === 'low' ? 'Stable' : prediction.predictedRisk === 'medium' ? 'Monitor' : 'Needs support'}</span>
              </div>
            </div>

            <div className="mt-6 rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
              <p className="font-semibold text-[var(--ink)]">Model-simulated scenario</p>
              <p className="mt-2">{prediction.explanation}</p>
            </div>
          </>
        )}

        <div className="mt-8 flex justify-end">
          <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>Save scenario</Button>
        </div>
      </div>
    </div>
  );
}
