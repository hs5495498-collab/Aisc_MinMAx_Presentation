import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface ComparisonBarDatum {
  name: string
  value: number
  /** When true, this bar is highlighted (e.g. a best-response action). */
  highlighted?: boolean
}

const BASE_COLOR = '#8b7fb0'
const HIGHLIGHT_COLOR = '#22d3ee'

/**
 * A Recharts bar chart for *real, user-driven* RPS Strategy Lab
 * comparisons (expected payoff per action, best-response payoffs,
 * exploitability) — every value passed in is computed from the
 * current probability distributions by `lib/rpsGameTheory.ts`, never
 * hardcoded to simulate interaction. Styled like
 * `components/charts/DemoBarChart.tsx` but generic and driven
 * entirely by `data`, with highlighted bars (e.g. tied best
 * responses) rendered in the accent color via `Cell`.
 */
export function ComparisonBarChart({
  data,
  valueLabel,
  height = 220,
}: {
  data: ComparisonBarDatum[]
  valueLabel: string
  height?: number
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-text-tertiary">No data to display yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="name" stroke="#8b7fb0" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#8b7fb0" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value) => [typeof value === 'number' ? value.toFixed(4) : String(value ?? ''), valueLabel]}
          contentStyle={{
            background: '#1a0b2e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: '#f5f3ff',
          }}
        />
        <Bar dataKey="value" name={valueLabel} radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.highlighted ? HIGHLIGHT_COLOR : BASE_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
