import type { Algorithm, SearchTreeFixture } from '@/types/searchTree'

export interface PositionDescriptor {
  id: string
  label: string
  sizeTier: 'small' | 'large'
  /** Shown to the user before they opt into a "large" dataset. */
  warning?: string
}

/**
 * Must stay in sync with backend/scripts/generate_visualization_fixtures.py's
 * `POSITIONS` list — these ids are exactly the `{fixture}-{algorithm}.json`
 * filenames in src/data/search-trees/, generated from real solver runs.
 */
export const AVAILABLE_POSITIONS: PositionDescriptor[] = [
  { id: 'immediate-win', label: 'Immediate win available', sizeTier: 'small' },
  {
    id: 'must-block',
    label: 'Must block opponent win',
    sizeTier: 'large',
    warning: 'This position’s Minimax tree has over 1,000 nodes and 3,500 events — rendering is depth-filtered and windowed automatically.',
  },
]

// Explicit, per-file dynamic imports (rather than a templated path) so
// Vite can statically analyze and code-split each fixture into its own
// lazily-loaded chunk — nothing here loads until a caller actually
// awaits it, satisfying "do not run a search automatically on page load".
// JSON imports are structurally inferred (not typed against our
// SearchTreeFixture interface), so each loader returns `unknown`,
// cast once in `loadSearchTreeFixture` below.
const LOADERS: Record<string, () => Promise<unknown>> = {
  'immediate-win-minimax': () => import('@/data/search-trees/immediate-win-minimax.json'),
  'immediate-win-alpha_beta': () => import('@/data/search-trees/immediate-win-alpha_beta.json'),
  'must-block-minimax': () => import('@/data/search-trees/must-block-minimax.json'),
  'must-block-alpha_beta': () => import('@/data/search-trees/must-block-alpha_beta.json'),
}

export async function loadSearchTreeFixture(positionId: string, algorithm: Algorithm): Promise<SearchTreeFixture> {
  const key = `${positionId}-${algorithm}`
  const loader = LOADERS[key]
  if (!loader) {
    throw new Error(`No generated fixture for position "${positionId}" / algorithm "${algorithm}".`)
  }
  const mod = (await loader()) as { default: SearchTreeFixture }
  return mod.default
}
