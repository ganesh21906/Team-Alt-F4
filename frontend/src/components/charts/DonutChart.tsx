import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  data: { level: string; count: number }[];
}

const colors = ['var(--ink)', 'var(--ink-soft)', 'var(--accent)'];

export function DonutChart({ data }: DonutChartProps) {
  return (
    <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
      <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Risk distribution</p>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="level" innerRadius={42} outerRadius={72} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.level} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {data.map((entry, index) => (
          <div key={entry.level} className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="capitalize">{entry.level}</span>
            </div>
            <span className="font-semibold text-[var(--ink)]">{entry.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
