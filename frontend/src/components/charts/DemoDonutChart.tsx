import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export interface DonutDatum {
  name: string
  value: number
  color: string
}

/** Thin Recharts wrapper for win/loss/draw style breakdowns. Demo data only. */
export function DemoDonutChart({ data }: { data: DonutDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#1a0b2e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: '#f5f3ff',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
