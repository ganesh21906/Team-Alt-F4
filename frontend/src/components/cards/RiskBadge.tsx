import type { RiskLevel } from '../../lib/types';

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const label = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  }[level];

  const colors = {
    low: 'var(--risk-low)',
    medium: 'var(--risk-mid)',
    high: 'var(--risk-high)',
  } as const;

  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium"
      style={{
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: colors[level],
        color: colors[level],
      }}
    >
      {label}
    </span>
  );
}
