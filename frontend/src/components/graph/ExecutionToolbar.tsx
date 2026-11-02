import { Play, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'

const disabledNote =
  'Playback activates once the real Minimax/Alpha-Beta engine ships (Phase 5–7) — not wired to a fabricated tree.'

/**
 * Transport controls honestly disabled in this phase — see Phase 3
 * brief: "do not draw fabricated search trees... any sample tree must
 * be explicitly labelled as illustrative demo data."
 */
export function ExecutionToolbar({ extra }: { extra?: React.ReactNode }) {
  const buttons = [
    { icon: SkipBack, label: 'Previous step' },
    { icon: Play, label: 'Play' },
    { icon: SkipForward, label: 'Next step' },
    { icon: RotateCcw, label: 'Reset' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-sm border border-graph-grid bg-graph-bg/80 p-3">
      {buttons.map(({ icon: Icon, label }) => (
        <Tooltip key={label} label={disabledNote}>
          <button
            disabled
            aria-label={`${label} (inactive placeholder)`}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-graph-grid text-text-tertiary disabled:opacity-40"
          >
            <Icon size={16} />
          </button>
        </Tooltip>
      ))}
      <Tooltip label={disabledNote}>
        <select
          disabled
          aria-label="Playback speed (inactive placeholder)"
          className="h-9 rounded-sm border border-graph-grid bg-transparent px-2 text-xs text-text-tertiary disabled:opacity-40"
        >
          <option>0.5x</option>
          <option>1x</option>
          <option>2x</option>
          <option>4x</option>
        </select>
      </Tooltip>
      {extra}
    </div>
  )
}
