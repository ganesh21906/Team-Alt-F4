interface HeatmapProps {
  data: { subject: string; currentScore: number }[];
}

const getOpacity = (score: number) => {
  if (score >= 85) return 0.95;
  if (score >= 70) return 0.7;
  if (score >= 60) return 0.5;
  return 0.28;
};

export function Heatmap({ data }: HeatmapProps) {
  return (
    <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
      <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Subject performance</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.map((item) => (
          <div key={item.subject} className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--ink-soft)]">{item.subject}</span>
              <span className="text-xs font-bold text-[var(--ink)]">{item.currentScore}</span>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.currentScore}%`, backgroundColor: `rgba(11,11,15,${getOpacity(item.currentScore)})` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
