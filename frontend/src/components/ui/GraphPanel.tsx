import type { HTMLAttributes, ReactNode } from 'react'

interface GraphPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode
  title?: ReactNode
}

/** Graph-theme flat panel — no glass blur, keeps the canvas legible. See UI_UX_DESIGN.md §4. */
export function GraphPanel({ children, title, className = '', ...props }: GraphPanelProps) {
  return (
    <div
      className={`rounded-sm border border-graph-grid bg-graph-bg/80 p-4 font-mono text-sm text-text-secondary ${className}`}
      {...props}
    >
      {title ? (
        <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-wide text-accent-cyan">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  )
}
