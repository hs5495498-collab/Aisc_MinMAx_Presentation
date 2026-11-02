import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode
  title?: ReactNode
  interactive?: boolean
}

/** Dashboard-theme glassmorphism card — see UI_UX_DESIGN.md §4. */
export function Card({ children, title, interactive = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-surface-card-border bg-surface-card p-6 shadow-card backdrop-blur-xl transition-all duration-150 ${
        interactive ? 'hover:-translate-y-0.5 hover:border-accent-magenta/30 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {title ? <h3 className="mb-4 text-lg font-semibold text-text-primary">{title}</h3> : null}
      {children}
    </div>
  )
}
