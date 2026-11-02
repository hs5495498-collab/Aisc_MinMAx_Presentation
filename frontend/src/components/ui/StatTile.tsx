import type { ComponentType } from 'react'
import type { IconProps } from '@/types/nav'

interface StatTileProps {
  label: string
  value: string
  icon?: ComponentType<IconProps>
  tone?: 'cyan' | 'teal' | 'violet'
}

const toneClass: Record<NonNullable<StatTileProps['tone']>, string> = {
  cyan: 'text-accent-cyan',
  teal: 'text-accent-teal',
  violet: 'text-accent-violet',
}

export function StatTile({ label, value, icon: Icon, tone = 'violet' }: StatTileProps) {
  return (
    <div className="rounded-lg border border-surface-card-border bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-text-tertiary">{label}</span>
        {Icon ? <Icon size={16} className={toneClass[tone]} /> : null}
      </div>
      <p className={`mt-2 font-display text-2xl font-bold ${toneClass[tone]}`}>{value}</p>
    </div>
  )
}
