import { describe, expect, it } from 'vitest'
import { allRoutes } from './routes'

describe('routes', () => {
  it('defines exactly the 14 approved pages', () => {
    expect(allRoutes).toHaveLength(14)
  })

  it('has unique paths', () => {
    const paths = allRoutes.map((r) => r.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('assigns a theme to every route', () => {
    for (const route of allRoutes) {
      expect(['dashboard', 'graph']).toContain(route.theme)
    }
  })
})
