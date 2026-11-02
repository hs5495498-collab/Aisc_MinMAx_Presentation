import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { BestResponseLab } from './BestResponseLab'
import { MixedStrategyExplorer } from './MixedStrategyExplorer'
import { useRpsStrategyLab } from '@/hooks/useRpsStrategyLab'

function Harness() {
  const strategyLab = useRpsStrategyLab()
  return (
    <div>
      <MixedStrategyExplorer {...strategyLab} />
      <BestResponseLab {...strategyLab} />
    </div>
  )
}

function OnlyBestResponseLab() {
  const strategyLab = useRpsStrategyLab()
  return <BestResponseLab {...strategyLab} />
}

describe('BestResponseLab', () => {
  it('shows a tied best response across all three actions when both strategies are uniform', () => {
    render(<OnlyBestResponseLab />)
    const tiedMentions = screen.getAllByText(/tie/i)
    expect(tiedMentions.length).toBeGreaterThan(0)
  })

  it('updates the best response when the shared strategy changes in the Mixed Strategy Explorer', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    // Default (uniform vs uniform): both best responses tie.
    expect(screen.getAllByText('tie').length).toBeGreaterThan(0)

    // Make Player B always play Rock -> Player A's unique best response is Paper.
    const bRockInput = screen.getByLabelText('Player B exact probability of Rock')
    const bPaperInput = screen.getByLabelText('Player B exact probability of Paper')
    const bScissorsInput = screen.getByLabelText('Player B exact probability of Scissors')
    await user.clear(bRockInput)
    await user.type(bRockInput, '1')
    await user.clear(bPaperInput)
    await user.type(bPaperInput, '0')
    await user.clear(bScissorsInput)
    await user.type(bScissorsInput, '0')

    expect(screen.getByText(/Player A's best response to Player B/i)).toBeInTheDocument()
    expect(screen.getAllByText('Paper').length).toBeGreaterThan(0)
  })

  it('shows a warning instead of a computed result when a strategy is invalid', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const aRockInput = screen.getByLabelText('Player A exact probability of Rock')
    await user.clear(aRockInput)
    await user.type(aRockInput, '0.9')

    expect(screen.getByText(/fix the invalid distribution/i)).toBeInTheDocument()
  })
})
