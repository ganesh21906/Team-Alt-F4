import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: 'blue' | 'purple' | 'emerald' | 'amber';
  icon?: ReactNode;
}

const accentStyles = {
  blue: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  purple: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  emerald: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  amber: 'bg-[var(--accent-soft)] text-[var(--accent)]',
};

export function MetricCard({ label, value, hint, accent = 'blue', icon }: MetricCardProps) {
  return (
    <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-5">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[12px] ${accentStyles[accent]}`}>
        {icon}
      </div>
      <p className="text-sm text-[var(--ink-soft)]">{label}</p>
      <h3 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">{value}</h3>
      {hint ? <p className="mt-2 text-xs text-[var(--ink-soft)]">{hint}</p> : null}
    </div>
  );
}
