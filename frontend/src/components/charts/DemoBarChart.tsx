import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface BarDatum {
  name: string
  value: number
}

const COLORS = ['#8b5cf6', '#22d3ee', '#2dd4bf']

/** Thin Recharts wrapper styled to the Dashboard theme. All data passed in is demo/sample data. */
export function DemoBarChart({ data, color = COLORS[0] }: { data: BarDatum[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
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
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
