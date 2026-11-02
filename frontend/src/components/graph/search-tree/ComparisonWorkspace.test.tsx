import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ComparisonWorkspace } from './ComparisonWorkspace'

describe('ComparisonWorkspace', () => {
  it('does not run anything until the shared Run Comparison button is pressed', () => {
    render(<ComparisonWorkspace />)
    expect(screen.getAllByText(/no search run yet/i)).toHaveLength(2)
  })

  it('running the comparison loads both real fixtures and displays actual matching statistics', async () => {
    const user = userEvent.setup()
    render(<ComparisonWorkspace />)

    await user.click(screen.getByRole('button', { name: /run comparison/i }))

    await waitFor(() => expect(screen.getByText(/comparison summary/i)).toBeInTheDocument())

    // The default "immediate-win" position is known (Phase 5/6 docs) to
    // produce matching evaluations and matching best moves between the
    // two algorithms — asserting on the real rendered text, not a mock.
    expect(screen.getByText(/evaluations match/i)).toBeInTheDocument()
    expect(screen.getByText(/best move matches/i)).toBeInTheDocument()
    expect(screen.getByText(/minimax nodes/i)).toBeInTheDocument()
    expect(screen.getByText(/alpha-beta nodes/i)).toBeInTheDocument()
    expect(screen.getByText(/node reduction/i)).toBeInTheDocument()
  })
})
