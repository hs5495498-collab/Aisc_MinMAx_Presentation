import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { router } from '@/app/router'

describe('App', () => {
  it('redirects the root route to the Dashboard', async () => {
    await router.navigate('/')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument()
  })

  it('renders the Tic-Tac-Toe page when navigating directly to its route', async () => {
    await router.navigate('/games/tic-tac-toe')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Tic-Tac-Toe', level: 1 })).toBeInTheDocument()
  })

  it('renders the RPS Strategy Matrix with the mandatory educational label', async () => {
    await router.navigate('/labs/rps-matrix')
    render(<App />)
    expect(await screen.findByText(/Educational — Sequential Variant, Not Standard RPS/i)).toBeInTheDocument()
  })

  it('shows the not-found page for an unknown route', async () => {
    await router.navigate('/this-route-does-not-exist')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
