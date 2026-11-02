import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface LineDatum {
  name: string
  value: number
}

/** Thin Recharts wrapper for trend lines. Demo data only. */
export function DemoLineChart({ data, color = '#22d3ee' }: { data: LineDatum[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="name" stroke="#8b7fb0" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#8b7fb0" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: '#1a0b2e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: '#f5f3ff',
          }}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
