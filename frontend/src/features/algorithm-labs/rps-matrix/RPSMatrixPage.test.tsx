import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RPSMatrixPage } from './RPSMatrixPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <RPSMatrixPage />
    </MemoryRouter>,
  )
}

describe('RPSMatrixPage', () => {
  it('renders the page heading and all six tabs', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'RPS Strategy Matrix', level: 1 })).toBeInTheDocument()
    for (const label of [
      'Payoff Matrix',
      'Mixed Strategy Explorer',
      'Expected Payoff Calculator',
      'Best Response Lab',
      'Nash Equilibrium Explorer',
      'Exploitability Demonstration',
    ]) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument()
    }
  })

  it('shows the Payoff Matrix tab by default', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: 'Payoff Matrix' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/rows are Player A's action/i)).toBeInTheDocument()
  })

  it('navigates to the Mixed Strategy Explorer tab on click', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Mixed Strategy Explorer' }))
    expect(screen.getByRole('tab', { name: 'Mixed Strategy Explorer' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/player a's strategy/i)).toBeInTheDocument()
  })

  it('shares strategy edits between the Mixed Strategy Explorer and Expected Payoff Calculator tabs', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Mixed Strategy Explorer' }))
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    await user.clear(rockInput)
    await user.type(rockInput, '1')
    const paperInput = screen.getByLabelText('Player A exact probability of Paper')
    await user.clear(paperInput)
    await user.type(paperInput, '0')
    const scissorsInput = screen.getByLabelText('Player A exact probability of Scissors')
    await user.clear(scissorsInput)
    await user.type(scissorsInput, '0')

    await user.click(screen.getByRole('tab', { name: 'Expected Payoff Calculator' }))
    // Player A is now pure Rock, Player B still uniform -> expected payoff is exactly 0
    // (every row of the payoff matrix sums to 0), shown live without re-entering anything.
    expect(screen.getByText('Player A expected payoff').nextElementSibling).toHaveTextContent('0.0000')
  })

  it('shows an invalid-state warning in dependent tabs when a strategy does not sum to 1', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Mixed Strategy Explorer' }))
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    await user.clear(rockInput)
    await user.type(rockInput, '0.9')

    await user.click(screen.getByRole('tab', { name: 'Best Response Lab' }))
    expect(screen.getByText(/fix the invalid distribution/i)).toBeInTheDocument()
  })

  it('"Reset to uniform" restores a valid state visible across tabs', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Mixed Strategy Explorer' }))
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    await user.clear(rockInput)
    await user.type(rockInput, '0.9')
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)

    await user.click(screen.getAllByRole('button', { name: /reset to uniform/i })[0])
    expect(screen.queryAllByRole('alert')).toHaveLength(0)

    await user.click(screen.getByRole('tab', { name: 'Best Response Lab' }))
    expect(screen.queryByText(/fix the invalid distribution/i)).not.toBeInTheDocument()
  })

  it('still shows the mandatory sequential-variant educational label beneath the tabs', () => {
    renderPage()
    expect(screen.getByText(/Educational — Sequential Variant, Not Standard RPS/i)).toBeInTheDocument()
  })

  it('keeps the frontend-demo disclosure visible', () => {
    renderPage()
    expect(screen.getByText(/frontend demo — mirrors the real python game-theory engine/i)).toBeInTheDocument()
  })
})
