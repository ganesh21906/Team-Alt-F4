import type { ReactNode } from 'react';

interface BadgeProps {
  tone: 'low' | 'medium' | 'high' | 'neutral';
  children: ReactNode;
}

const toneStyles = {
  low: 'bg-[color:rgba(16,185,129,0.08)] text-[var(--risk-low)] border border-[color:rgba(16,185,129,0.25)]',
  medium: 'bg-[color:rgba(245,158,11,0.08)] text-[var(--risk-mid)] border border-[color:rgba(245,158,11,0.25)]',
  high: 'bg-[color:rgba(239,68,68,0.08)] text-[var(--risk-high)] border border-[color:rgba(239,68,68,0.25)]',
  neutral: 'bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)]',
};

export function Badge({ tone, children }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]}`}>{children}</span>;
}
