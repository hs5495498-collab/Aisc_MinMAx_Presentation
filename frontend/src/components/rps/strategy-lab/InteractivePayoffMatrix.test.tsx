import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InteractivePayoffMatrix } from './InteractivePayoffMatrix'

const PAIRS: { a: string; b: string; value: number }[] = [
  { a: 'Rock', b: 'Rock', value: 0 },
  { a: 'Rock', b: 'Paper', value: -1 },
  { a: 'Rock', b: 'Scissors', value: 1 },
  { a: 'Paper', b: 'Rock', value: 1 },
  { a: 'Paper', b: 'Paper', value: 0 },
  { a: 'Paper', b: 'Scissors', value: -1 },
  { a: 'Scissors', b: 'Rock', value: -1 },
  { a: 'Scissors', b: 'Paper', value: 1 },
  { a: 'Scissors', b: 'Scissors', value: 0 },
]

describe('InteractivePayoffMatrix', () => {
  it.each(PAIRS)('shows the correct Player A payoff for $a vs $b', ({ a, b, value }) => {
    render(<InteractivePayoffMatrix />)
    const label = `Player A plays ${a}, Player B plays ${b}: Player A's payoff is ${value}`
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
  })

  it('clicking a cell reveals an explanation naming the action combination', async () => {
    const user = userEvent.setup()
    render(<InteractivePayoffMatrix />)
    await user.click(screen.getByRole('button', { name: "Player A plays Rock, Player B plays Scissors: Player A's payoff is 1" }))
    expect(screen.getByText('A: Rock vs. B: Scissors')).toBeInTheDocument()
    expect(screen.getByText(/Rock beats Scissors — Player A wins this pairing\./i)).toBeInTheDocument()
  })

  it('explains a tie correctly', async () => {
    const user = userEvent.setup()
    render(<InteractivePayoffMatrix />)
    await user.click(screen.getByRole('button', { name: "Player A plays Paper, Player B plays Paper: Player A's payoff is 0" }))
    expect(screen.getByText(/Both play Paper — a tie\./i)).toBeInTheDocument()
  })

  it('switching perspective to Player B negates the displayed payoff without changing the table', async () => {
    const user = userEvent.setup()
    render(<InteractivePayoffMatrix />)
    // From A's perspective, Rock vs Scissors is +1 for A.
    expect(screen.getByRole('button', { name: "Player A plays Rock, Player B plays Scissors: Player A's payoff is 1" })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Player B' }))

    // Same cell, now shown as -1 from B's perspective (never re-deriving the convention).
    expect(screen.getByRole('button', { name: "Player A plays Rock, Player B plays Scissors: Player B's payoff is -1" })).toBeInTheDocument()
  })

  it('shows a neutral prompt before any cell is hovered or selected', () => {
    render(<InteractivePayoffMatrix />)
    expect(screen.getByText(/hover or select a cell above/i)).toBeInTheDocument()
  })
})
