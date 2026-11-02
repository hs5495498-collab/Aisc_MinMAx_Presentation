import { FlaskConical } from 'lucide-react'

/**
 * Mandatory label for every placeholder/sample statistic in this phase.
 * Never render fabricated numbers without this notice nearby — see
 * Phase 3 brief §6/§10/§11 ("clearly identify any sample/demo data").
 */
export function DemoDataNotice({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-center gap-1.5 text-xs text-text-tertiary ${className}`}>
      <FlaskConical size={14} aria-hidden="true" />
      <span>Sample data for layout purposes — not a real match or simulation record.</span>
    </p>
  )
}
