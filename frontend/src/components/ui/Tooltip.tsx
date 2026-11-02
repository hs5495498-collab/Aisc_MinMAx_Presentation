import type { ReactNode } from 'react'

/**
 * Minimal CSS-only tooltip (no portal/positioning library needed for
 * Phase 3's static content). Visible on hover AND focus, so it works
 * for keyboard users too.
 */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-56 -translate-x-1/2 scale-95 rounded-sm border border-surface-card-border bg-bg-base px-2.5 py-1.5 text-xs text-text-secondary opacity-0 shadow-card transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  )
}
