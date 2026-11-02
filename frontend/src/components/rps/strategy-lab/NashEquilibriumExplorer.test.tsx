import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NashEquilibriumExplorer } from './NashEquilibriumExplorer'

describe('NashEquilibriumExplorer', () => {
  it('shows the uniform equilibrium with expected payoff 0 by default', () => {
    render(<NashEquilibriumExplorer />)
    expect(screen.getByText(/is this pair a nash equilibrium\?/i)).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('0.0000')).toBeInTheDocument()
  })

  it('explains that deviating while the opponent stays uniform does not improve expected payoff', async () => {
    const user = userEvent.setup()
    render(<NashEquilibriumExplorer />)

    await user.click(screen.getByRole('radio', { name: /player a deviates, player b stays uniform/i }))

    expect(screen.getByText(/deviating neither helps nor hurts here/i)).toBeInTheDocument()
    // The expected payoff stays exactly 0 regardless of the deviation slider.
    expect(screen.getByText('0.0000')).toBeInTheDocument()
  })

  it('flags the deviating pair as not a Nash equilibrium', async () => {
    const user = userEvent.setup()
    render(<NashEquilibriumExplorer />)
    await user.click(screen.getByRole('radio', { name: /player b deviates, player a stays uniform/i }))
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('computes a real (non-hardcoded) value for the both-biased scenario', async () => {
    const user = userEvent.setup()
    render(<NashEquilibriumExplorer />)
    await user.click(screen.getByRole('radio', { name: /both players use a biased strategy/i }))
    expect(screen.getByText(/real computed result, not guaranteed to be 0/i)).toBeInTheDocument()
  })

  it('explains that equilibrium means stability, not guaranteed wins', () => {
    render(<NashEquilibriumExplorer />)
    expect(screen.getByText(/not a guarantee of winning any individual round/i)).toBeInTheDocument()
  })

  it('exposes a deviation slider only for the deviation scenarios', async () => {
    const user = userEvent.setup()
    render(<NashEquilibriumExplorer />)
    expect(screen.queryByLabelText(/deviation amount toward rock/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /player a deviates, player b stays uniform/i }))
    expect(screen.getByLabelText(/deviation amount toward rock/i)).toBeInTheDocument()
  })
})
