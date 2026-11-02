import type { ComponentType, ReactNode } from 'react'
import type { IconProps } from '@/types/nav'

interface EmptyStateProps {
  icon: ComponentType<IconProps>
  title: string
  message: string
  actions?: ReactNode
}

export function EmptyState({ icon: Icon, title, message, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-surface-card-border px-6 py-12 text-center">
      <Icon size={32} className="text-text-tertiary" />
      <h3 className="font-display text-base font-semibold text-text-primary">{title}</h3>
      <p className="max-w-sm text-sm text-text-secondary">{message}</p>
      {actions ? <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  )
}
