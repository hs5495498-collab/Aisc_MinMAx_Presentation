import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RockPaperScissorsPage } from './RockPaperScissorsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <RockPaperScissorsPage />
    </MemoryRouter>,
  )
}

async function playRound(user: ReturnType<typeof userEvent.setup>, choiceLabel: RegExp) {
  await user.click(screen.getByRole('button', { name: choiceLabel }))
  await act(async () => {
    vi.advanceTimersByTime(700)
  })
  // Advance past the reveal unless the match just ended (no "Next Round"
  // control exists once the final result screen takes over).
  const nextRoundButton = screen.queryByRole('button', { name: /next round/i })
  if (nextRoundButton) {
    await user.click(nextRoundButton)
  }
}

describe('RockPaperScissorsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the three choice buttons and an empty scoreboard', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /^rock\./i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^paper\./i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^scissors\./i })).toBeInTheDocument()
    expect(screen.getAllByText('0').length).toBeGreaterThan(0) // zeroed scoreboard stats are present
  })

  it('locks the player action and hides the AI action until the reveal delay elapses', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: /^rock\./i }))

    // Immediately after clicking: the choice buttons are disabled
    // (round resolving), and the AI's action has not been revealed.
    expect(screen.getByRole('button', { name: /^rock\./i })).toBeDisabled()
    expect(screen.getByText(/revealing…/i)).toBeInTheDocument()
    // The round-result sentence (e.g. "Rock beats Scissors" or "— a tie.")
    // only exists once resolvePendingRound() has run — not before.
    expect(screen.queryByText(/beats|— a tie\./i)).not.toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(700)
    })

    // After the reveal delay, a result is shown.
    expect(screen.getByText(/beats|— a tie\./i)).toBeInTheDocument()
  })

  it('updates the scoreboard and match history after a round', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await playRound(user, /^rock\./i)

    expect(screen.queryByText(/no rounds played yet/i)).not.toBeInTheDocument()
    const historyCard = screen.getByText('Match History').closest('div') as HTMLElement
    expect(within(historyCard).getByText('R1')).toBeInTheDocument()
  })

  it('reaches the final result screen and supports starting a new match', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    // Best of 5 by default -> configure best of 1 for a fast finish, before any round is played.
    await user.click(screen.getByRole('button', { name: /best of 3/i }))

    await playRound(user, /^rock\./i)
    await playRound(user, /^rock\./i)

    // Depending on random draws the match might not be over yet; play
    // until it is, capped generously to avoid an infinite loop.
    for (let i = 0; i < 20 && !screen.queryByText(/won the match/i); i++) {
      await playRound(user, /^rock\./i)
    }

    expect(screen.getByText(/won the match/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new match/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /new match/i }))
    expect(screen.queryByText(/won the match/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^rock\./i })).toBeInTheDocument()
  })

  it('match configuration controls work before any round is played', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: /best of 7/i }))
    expect(screen.getByRole('button', { name: /best of 7/i })).toHaveClass('border-accent-violet')
  })

  it('locks match configuration once a round has been played', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await playRound(user, /^rock\./i)

    expect(screen.getByText(/configuration is locked once a match is in progress/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /best of 3/i })).toBeDisabled()
  })

  it('AI strategy selection updates the explanation and probability bars', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    const select = screen.getByLabelText(/ai strategy/i)
    await user.selectOptions(select, 'Biased demonstration')

    expect(screen.getByText(/not an optimal strategy/i)).toBeInTheDocument()
    expect(screen.getByText('70.0%')).toBeInTheDocument()
  })

  it('custom strategy validation rejects an invalid distribution and shows feedback', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.selectOptions(screen.getByLabelText(/ai strategy/i), 'Custom distribution')

    const rockInput = screen.getByLabelText('Probability for ROCK')
    await user.clear(rockInput)
    await user.type(rockInput, '0.9')

    expect(await screen.findByRole('alert')).toHaveTextContent(/sum to 1/i)
  })
})
