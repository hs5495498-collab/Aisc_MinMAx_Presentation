import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import type { SearchTreePlayback } from '@/hooks/useSearchTreePlayback'

/**
 * Real, fully-wired transport controls over an actual recorded event
 * sequence — unlike Phase 3's placeholder `ExecutionToolbar` (kept
 * as-is for pages that still show illustrative content, e.g. RPS's
 * educational panel), every control here does what it says.
 */
export function PlaybackControls({ playback }: { playback: SearchTreePlayback }) {
  const atStart = playback.currentIndex <= -1
  const atEnd = playback.currentIndex + 1 >= playback.totalEvents

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-sm border border-graph-grid bg-graph-bg/80 p-3">
      <button
        onClick={playback.previous}
        disabled={atStart}
        aria-label="Previous event"
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-graph-grid text-text-secondary hover:text-text-primary disabled:opacity-40"
      >
        <SkipBack size={16} />
      </button>
      <button
        onClick={playback.isPlaying ? playback.pause : playback.play}
        disabled={atEnd && !playback.isPlaying}
        aria-label={playback.isPlaying ? 'Pause' : 'Play'}
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-graph-grid text-text-secondary hover:text-text-primary disabled:opacity-40"
      >
        {playback.isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button
        onClick={playback.next}
        disabled={atEnd}
        aria-label="Next event"
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-graph-grid text-text-secondary hover:text-text-primary disabled:opacity-40"
      >
        <SkipForward size={16} />
      </button>
      <button
        onClick={playback.reset}
        disabled={atStart}
        aria-label="Reset"
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-graph-grid text-text-secondary hover:text-text-primary disabled:opacity-40"
      >
        <RotateCcw size={16} />
      </button>

      <label className="flex items-center gap-1.5 text-xs text-text-tertiary">
        Speed
        <select
          value={playback.speed}
          onChange={(e) => playback.setSpeed(Number(e.target.value))}
          aria-label="Playback speed"
          className="rounded-sm border border-graph-grid bg-transparent px-1.5 py-1 text-xs text-text-secondary"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </label>

      <input
        type="range"
        min={-1}
        max={Math.max(playback.totalEvents - 1, 0)}
        value={playback.currentIndex}
        onChange={(e) => playback.jumpTo(Number(e.target.value))}
        aria-label="Scrub to event"
        className="h-1.5 flex-1 min-w-[120px] accent-accent-cyan"
      />

      <span className="font-mono text-xs text-text-tertiary">
        {Math.max(playback.currentIndex + 1, 0)} / {playback.totalEvents}
      </span>
    </div>
  )
}
