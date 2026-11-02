import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSearchTreePlayback } from './useSearchTreePlayback'
import type { SearchEvent } from '@/types/searchTree'

const EVENTS: SearchEvent[] = [
  { index: 0, type: 'node_entered', nodeId: 'n0', parentId: null, depth: 0, role: 'MAX', board: [], move: null },
  { index: 1, type: 'terminal_evaluated', nodeId: 'n0', depth: 0, board: [], value: 7 },
  { index: 2, type: 'value_returned', nodeId: 'n0', depth: 0, value: 7 },
]

describe('useSearchTreePlayback', () => {
  it('starts with nothing revealed and playback stopped', () => {
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    expect(result.current.currentIndex).toBe(-1)
    expect(result.current.isPlaying).toBe(false)
    expect(Object.keys(result.current.state.revealedNodes)).toHaveLength(0)
  })

  it('next() advances through real events one at a time', () => {
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    act(() => result.current.next())
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.state.revealedNodes.n0).toBeDefined()

    act(() => result.current.next())
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.state.revealedNodes.n0.isTerminal).toBe(true)
  })

  it('next() does nothing past the last event', () => {
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    act(() => {
      result.current.next()
      result.current.next()
      result.current.next()
    })
    expect(result.current.currentIndex).toBe(2)
    act(() => result.current.next())
    expect(result.current.currentIndex).toBe(2) // unchanged, no crash
  })

  it('previous() steps back and recomputes the correct state', () => {
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    act(() => {
      result.current.next()
      result.current.next()
    })
    expect(result.current.currentIndex).toBe(1)
    act(() => result.current.previous())
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.state.revealedNodes.n0.isTerminal).toBe(false)
  })

  it('previous() at the start resets to the empty state', () => {
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    act(() => result.current.previous())
    expect(result.current.currentIndex).toBe(-1)
    expect(Object.keys(result.current.state.revealedNodes)).toHaveLength(0)
  })

  it('reset() restores the initial (empty, stopped) state after advancing and playing', () => {
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    act(() => {
      result.current.next()
      result.current.play()
    })
    expect(result.current.isPlaying).toBe(true)
    act(() => result.current.reset())
    expect(result.current.currentIndex).toBe(-1)
    expect(result.current.isPlaying).toBe(false)
    expect(Object.keys(result.current.state.revealedNodes)).toHaveLength(0)
  })

  it('pause() stops playback from advancing further', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(130))
    const indexAfterOneTick = result.current.currentIndex
    expect(indexAfterOneTick).toBeGreaterThanOrEqual(0)

    act(() => result.current.pause())
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.currentIndex).toBe(indexAfterOneTick)
    expect(result.current.isPlaying).toBe(false)
    vi.useRealTimers()
  })

  it('play() autoplay reaches the end and stops itself', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.currentIndex).toBe(EVENTS.length - 1)
    expect(result.current.isPlaying).toBe(false)
    vi.useRealTimers()
  })

  it('jumpTo() scrubs directly to an arbitrary index', () => {
    const { result } = renderHook(() => useSearchTreePlayback(EVENTS))
    act(() => result.current.jumpTo(1))
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.state.revealedNodes.n0.isTerminal).toBe(true)
  })

  it('resets automatically when the events array itself changes', async () => {
    const { result, rerender } = renderHook(({ events }: { events: SearchEvent[] }) => useSearchTreePlayback(events), {
      initialProps: { events: EVENTS },
    })
    act(() => result.current.next())
    expect(result.current.currentIndex).toBe(0)

    rerender({ events: [EVENTS[0]] })
    await waitFor(() => expect(result.current.currentIndex).toBe(-1))
  })
})
