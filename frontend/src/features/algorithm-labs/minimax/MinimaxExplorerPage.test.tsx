import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { MinimaxExplorerPage } from './MinimaxExplorerPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <MinimaxExplorerPage />
    </MemoryRouter>,
  )
}

describe('MinimaxExplorerPage', () => {
  it('renders without an automatic search — shows the empty state first', () => {
    renderPage()
    expect(screen.getByText(/no search run yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /run minimax/i })).toBeInTheDocument()
  })

  it('loads the real recorded search when Run is pressed, then supports stepping through it', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /run minimax/i }))

    // The empty state disappears once the real fixture has loaded.
    await waitFor(() => expect(screen.queryByText(/no search run yet/i)).not.toBeInTheDocument())

    const nextButton = await screen.findByRole('button', { name: /next event/i })
    expect(screen.getByRole('button', { name: /previous event/i })).toBeDisabled()

    await user.click(nextButton)
    // Pressing Next reveals the root node, so the event counter advances past 0.
    await waitFor(() => expect(screen.getByText(/^1 \//)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /previous event/i })).not.toBeDisabled()
  })

  it('selecting a node after stepping forward shows its detail in the inspector', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /run minimax/i }))
    const nextButton = await screen.findByRole('button', { name: /next event/i })
    await user.click(nextButton)

    // Before selecting anything, the inspector shows its placeholder prompt.
    expect(screen.getByText(/select a node to inspect/i)).toBeInTheDocument()

    const rootNode = await screen.findByRole('button', { name: /MAX node/i })
    await user.click(rootNode)

    await waitFor(() => expect(screen.queryByText(/select a node to inspect/i)).not.toBeInTheDocument())
    expect(screen.getByText(/this is a MAX node/i)).toBeInTheDocument()
  })

  it('reset returns playback to the initial state', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /run minimax/i }))
    const nextButton = await screen.findByRole('button', { name: /next event/i })
    await user.click(nextButton)
    await user.click(nextButton)

    const resetButton = screen.getByRole('button', { name: /^reset$/i })
    await user.click(resetButton)

    await waitFor(() => expect(screen.getByText(/^0 \//)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /previous event/i })).toBeDisabled()
  })
})
