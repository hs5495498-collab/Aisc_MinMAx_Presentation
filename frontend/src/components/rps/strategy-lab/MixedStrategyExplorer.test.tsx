import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MixedStrategyExplorer } from './MixedStrategyExplorer'
import { useRpsStrategyLab } from '@/hooks/useRpsStrategyLab'

function Harness() {
  const strategyLab = useRpsStrategyLab()
  return <MixedStrategyExplorer {...strategyLab} />
}

function renderExplorer() {
  return render(<Harness />)
}

describe('MixedStrategyExplorer', () => {
  it('starts with both players at the uniform distribution', () => {
    renderExplorer()
    const inputs = screen.getAllByLabelText(/exact probability of/i) as HTMLInputElement[]
    for (const input of inputs) {
      expect(Number(input.value)).toBeCloseTo(1 / 3, 5)
    }
  })

  it('accepts a valid pure strategy with no validation error', async () => {
    const user = userEvent.setup()
    renderExplorer()
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    const paperInput = screen.getByLabelText('Player A exact probability of Paper')
    const scissorsInput = screen.getByLabelText('Player A exact probability of Scissors')

    await user.clear(rockInput)
    await user.type(rockInput, '1')
    await user.clear(paperInput)
    await user.type(paperInput, '0')
    await user.clear(scissorsInput)
    await user.type(scissorsInput, '0')

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
    expect(screen.getAllByText(/pure strategy/i).length).toBeGreaterThan(0)
  })

  it('rejects a biased strategy that does not sum to 1, with visible feedback', async () => {
    const user = userEvent.setup()
    renderExplorer()
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    await user.clear(rockInput)
    await user.type(rockInput, '0.9')

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })

  it('rejects a negative probability', async () => {
    const user = userEvent.setup()
    renderExplorer()
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    await user.clear(rockInput)
    await user.type(rockInput, '-0.5')

    const alerts = await screen.findAllByRole('alert')
    expect(alerts.some((el) => /negative/i.test(el.textContent ?? ''))).toBe(true)
  })

  it('rejects a non-finite probability (empty input parses to NaN)', async () => {
    const user = userEvent.setup()
    renderExplorer()
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    await user.clear(rockInput)

    const alerts = await screen.findAllByRole('alert')
    expect(alerts.some((el) => /finite/i.test(el.textContent ?? ''))).toBe(true)
  })

  it('"Reset to uniform" clears an invalid distribution back to 1/3 each', async () => {
    const user = userEvent.setup()
    renderExplorer()
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    await user.clear(rockInput)
    await user.type(rockInput, '0.9')
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)

    const resetButtons = screen.getAllByRole('button', { name: /reset to uniform/i })
    await user.click(resetButtons[0])

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
    expect(Number((screen.getByLabelText('Player A exact probability of Rock') as HTMLInputElement).value)).toBeCloseTo(1 / 3, 5)
  })

  it('"Normalize to sum 1" rescales an invalid-but-positive distribution explicitly, without auto-normalizing on every change', async () => {
    const user = userEvent.setup()
    renderExplorer()
    const rockInput = screen.getByLabelText('Player A exact probability of Rock')
    const paperInput = screen.getByLabelText('Player A exact probability of Paper')
    await user.clear(rockInput)
    await user.type(rockInput, '2')
    await user.clear(paperInput)
    await user.type(paperInput, '2')

    // Still invalid immediately after typing -- no silent normalization.
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)

    const normalizeButtons = screen.getAllByRole('button', { name: /normalize to sum 1/i })
    await user.click(normalizeButtons[0])

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
  })

  it('shows both players independently, each with their own sum readout', () => {
    renderExplorer()
    expect(screen.getByText(/player a's strategy/i)).toBeInTheDocument()
    expect(screen.getByText(/player b's strategy/i)).toBeInTheDocument()
    expect(screen.getAllByText(/sum =/i)).toHaveLength(2)
  })
})
