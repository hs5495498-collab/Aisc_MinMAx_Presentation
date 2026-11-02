const roles = [
  { label: 'MAX node', swatch: 'bg-accent-cyan' },
  { label: 'MIN node', swatch: 'bg-graph-node-min' },
]

const states = [
  { label: 'Active (currently open)', swatch: 'ring-2 ring-graph-amber-pulse bg-accent-cyan animate-pulse' },
  { label: 'Visited (exploring children)', swatch: 'bg-accent-cyan/55' },
  { label: 'Completed (value backed up)', swatch: 'bg-accent-cyan' },
  { label: 'Evaluated (terminal leaf)', swatch: 'bg-graph-node-min' },
  { label: 'Pruned (never explored)', swatch: 'border border-dashed border-graph-node-pruned bg-graph-node-pruned/40' },
]

/** Reflects the real VisualNode.status values exactly — see
 * types/searchTree.ts — not a generic illustrative legend. */
export function SearchTreeLegend() {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-text-tertiary">Role (color)</p>
        <ul className="space-y-1.5">
          {roles.map((r) => (
            <li key={r.label} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className={`h-3 w-3 rounded-full ${r.swatch}`} aria-hidden="true" />
              {r.label}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-text-tertiary">Status (shape/opacity)</p>
        <ul className="space-y-1.5">
          {states.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className={`h-3 w-3 rounded-full ${s.swatch}`} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[11px] text-text-tertiary">
        A pruned node shows "×" and has no children — it was never evaluated, only skipped.
      </p>
    </div>
  )
}
