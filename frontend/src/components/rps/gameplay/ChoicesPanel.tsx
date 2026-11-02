import { Hand, FileText, Scissors as ScissorsIcon } from 'lucide-react'
import type { Action } from '@/types/rps'
import type { RoundPhase } from '@/hooks/useRpsMatch'

const CHOICES: { value: Action; label: string; icon: typeof Hand; beats: string }[] = [
  { value: 'ROCK', label: 'Rock', icon: Hand, beats: 'Beats Scissors, loses to Paper' },
  { value: 'PAPER', label: 'Paper', icon: FileText, beats: 'Beats Rock, loses to Scissors' },
  { value: 'SCISSORS', label: 'Scissors', icon: ScissorsIcon, beats: 'Beats Paper, loses to Rock' },
]

interface ChoicesPanelProps {
  phase: RoundPhase
  pendingPlayerAction: Action | null
  disabled: boolean
  onSelect: (action: Action) => void
}

/**
 * The three main gameplay buttons. Never reveals the AI's action —
 * this component doesn't even receive it as a prop — only the
 * player's own (already-locked) choice, for the "selected" highlight.
 */
export function ChoicesPanel({ phase, pendingPlayerAction, disabled, onSelect }: ChoicesPanelProps) {
  const interactionDisabled = disabled || phase !== 'idle'

  return (
    <div
      role="group"
      aria-label="Choose Rock, Paper, or Scissors"
      className="flex flex-wrap justify-center gap-4"
    >
      {CHOICES.map((choice) => {
        const isSelected = pendingPlayerAction === choice.value
        return (
          <button
            key={choice.value}
            type="button"
            onClick={() => onSelect(choice.value)}
            disabled={interactionDisabled}
            aria-label={`${choice.label}. ${choice.beats}.`}
            aria-pressed={isSelected}
            className={`flex min-h-28 w-32 flex-col items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all focus-visible:outline-none ${
              isSelected
                ? 'border-accent-magenta bg-accent-magenta/15 text-text-primary'
                : 'border-surface-card-border bg-black/10 text-text-primary hover:-translate-y-0.5 hover:border-accent-magenta/40'
            } disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:-translate-y-0`}
          >
            <choice.icon size={32} className={isSelected ? 'text-accent-magenta' : 'text-accent-cyan'} />
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}
