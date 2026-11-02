const roles = [
  { label: 'MAX node', swatch: 'bg-graph-node-max' },
  { label: 'MIN node', swatch: 'bg-graph-node-min' },
]

const states = [
  { label: 'Unexplored', swatch: 'border border-dashed border-graph-node-unexplored bg-transparent' },
  { label: 'Active (evaluating)', swatch: 'bg-graph-amber-pulse animate-pulse' },
  { label: 'Visited', swatch: 'bg-graph-node-max/70' },
  { label: 'Evaluated (leaf)', swatch: 'bg-graph-node-min' },
  { label: 'Pruned', swatch: 'bg-graph-node-pruned opacity-60' },
]

/** Node role is always color; node state is always shape/opacity — see UI_UX_DESIGN.md §1.1. */
export function NodeLegend() {
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
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-text-tertiary">State (shape)</p>
        <ul className="space-y-1.5">
          {states.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className={`h-3 w-3 rounded-full ${s.swatch}`} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
