import { useCallback, useEffect, useRef, useState } from 'react'
import type { SearchEvent } from '@/types/searchTree'
import { applyEvent, buildStateAtIndex, EMPTY_REPLAY_STATE, type ReplayState } from '@/lib/searchTreeReplay'

export interface SearchTreePlayback {
  state: ReplayState
  currentIndex: number
  totalEvents: number
  isPlaying: boolean
  speed: number
  setSpeed: (speed: number) => void
  play: () => void
  pause: () => void
  next: () => void
  previous: () => void
  reset: () => void
  jumpTo: (index: number) => void
}

const TICK_MS = 120

/**
 * Drives playback of a real, already-recorded event sequence (see
 * types/searchTree.ts). Every control here (play/pause/next/previous/
 * reset/jumpTo) only moves `currentIndex` and replays the
 * corresponding real events through `applyEvent` — nothing here
 * generates or reorders events.
 */
export function useSearchTreePlayback(events: SearchEvent[]): SearchTreePlayback {
  const [trackedEvents, setTrackedEvents] = useState(events)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [state, setState] = useState<ReplayState>(EMPTY_REPLAY_STATE)
  const stateRef = useRef<ReplayState>(EMPTY_REPLAY_STATE)

  // Reset playback whenever the underlying event sequence itself changes
  // (e.g. the user picked a different position/algorithm fixture). This
  // is React's documented "adjust state during render" pattern for
  // resetting derived state on a prop change — plain setState calls
  // only, no refs touched here, so it runs synchronously within this
  // render with no stale frame ever committed.
  if (trackedEvents !== events) {
    setTrackedEvents(events)
    setCurrentIndex(-1)
    setIsPlaying(false)
    setState(EMPTY_REPLAY_STATE)
  }

  const applyAndSet = useCallback((next: ReplayState) => {
    stateRef.current = next
    setState(next)
  }, [])

  const next = useCallback(() => {
    setCurrentIndex((i) => {
      if (i + 1 >= events.length) {
        setIsPlaying(false)
        return i
      }
      applyAndSet(applyEvent(stateRef.current, events[i + 1]))
      return i + 1
    })
  }, [events, applyAndSet])

  const previous = useCallback(() => {
    setCurrentIndex((i) => {
      if (i <= 0) {
        applyAndSet(EMPTY_REPLAY_STATE)
        return -1
      }
      const newIndex = i - 1
      applyAndSet(buildStateAtIndex(events, newIndex))
      return newIndex
    })
  }, [events, applyAndSet])

  const jumpTo = useCallback(
    (index: number) => {
      const clamped = Math.max(-1, Math.min(index, events.length - 1))
      applyAndSet(clamped === -1 ? EMPTY_REPLAY_STATE : buildStateAtIndex(events, clamped))
      setCurrentIndex(clamped)
    },
    [events, applyAndSet],
  )

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(-1)
    applyAndSet(EMPTY_REPLAY_STATE)
  }, [applyAndSet])

  const play = useCallback(() => {
    if (currentIndex + 1 < events.length) setIsPlaying(true)
  }, [currentIndex, events])

  const pause = useCallback(() => setIsPlaying(false), [])

  useEffect(() => {
    if (!isPlaying) return undefined
    const stepsPerTick = Math.max(1, Math.round(speed))
    const id = window.setInterval(() => {
      setCurrentIndex((i) => {
        if (i + 1 >= events.length) {
          setIsPlaying(false)
          return i
        }
        let idx = i
        let st = stateRef.current
        for (let step = 0; step < stepsPerTick && idx + 1 < events.length; step++) {
          idx += 1
          st = applyEvent(st, events[idx])
        }
        applyAndSet(st)
        return idx
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [isPlaying, speed, events, applyAndSet])

  return {
    state,
    currentIndex,
    totalEvents: events.length,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    next,
    previous,
    reset,
    jumpTo,
  }
}
