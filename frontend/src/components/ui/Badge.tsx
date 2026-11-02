import type { ReactNode } from 'react'

type Tone = 'neutral' | 'violet' | 'success' | 'warning' | 'error'

const tones: Record<Tone, string> = {
  neutral: 'bg-white/10 text-text-secondary border-white/10',
  violet: 'bg-accent-violet/15 text-accent-violet border-accent-violet/30',
  success: 'bg-state-success/15 text-state-success border-state-success/30',
  warning: 'bg-state-warning/15 text-state-warning border-state-warning/30',
  error: 'bg-state-error/15 text-state-error border-state-error/30',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
