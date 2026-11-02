import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Required, permanently-visible label for the sequential RPS Alpha-Beta
 * demonstration — never applied to standard simultaneous RPS content.
 * See docs/GAME_THEORY_DESIGN.md and docs/ROCK_PAPER_SCISSORS_DESIGN.md.
 */
export function EducationalVariantBanner({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-lg border-2 border-dashed border-state-warning/50 bg-state-warning/5 p-5">
      <div className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-state-warning">
        <AlertTriangle size={18} aria-hidden="true" />
        Educational — Sequential Variant, Not Standard RPS
      </div>
      <div className="text-sm text-text-secondary">{children}</div>
    </section>
  )
}
