import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface LineChartCardProps {
  data: { week: string; score: number }[];
}

export function LineChartCard({ data }: LineChartCardProps) {
  return (
    <div className="rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Performance trend</p>
          <p className="text-xs text-[var(--ink-soft)]">Weekly score movement</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.22} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: 'var(--ink-soft)', fontSize: 12 }} />
            <YAxis domain={[50, 100]} tickLine={false} axisLine={false} tick={{ fill: 'var(--ink-soft)', fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
