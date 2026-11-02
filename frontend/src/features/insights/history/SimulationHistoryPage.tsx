import { useMemo, useState } from 'react'
import { Folder } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { EmptyState } from '@/components/feedback/EmptyState'
import { DemoDataNotice } from '@/components/feedback/DemoDataNotice'
import { insightRoutes } from '@/lib/routes'

const sampleHistory = [
  { id: 1, game: 'Tic-Tac-Toe', detail: 'Alpha-Beta (ordered) · Hard · Won', date: '2026-11-01' },
  { id: 2, game: 'Rock Paper Scissors', detail: 'Best of 5 · Nash · 3–2 Won', date: '2026-11-01' },
  { id: 3, game: 'Minimax Explorer', detail: 'Illustrative tree viewed', date: '2026-10-31' },
]

export function SimulationHistoryPage() {
  const route = insightRoutes[2]
  const [query, setQuery] = useState('')
  const [gameFilter, setGameFilter] = useState('all')

  const filtered = useMemo(
    () =>
      sampleHistory.filter(
        (item) =>
          (gameFilter === 'all' || item.game === gameFilter) &&
          (item.game + item.detail).toLowerCase().includes(query.toLowerCase()),
      ),
    [query, gameFilter],
  )

  return (
    <PageContainer route={route}>
      <SectionSubNav items={insightRoutes} />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search history…"
          aria-label="Search simulation history"
          className="min-w-[200px] flex-1 rounded-md border border-surface-card-border bg-black/20 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary"
        />
        <select
          value={gameFilter}
          onChange={(e) => setGameFilter(e.target.value)}
          aria-label="Filter by game"
          className="rounded-md border border-surface-card-border bg-black/20 px-3 py-2 text-sm text-text-primary"
        >
          <option value="all">All games</option>
          <option value="Tic-Tac-Toe">Tic-Tac-Toe</option>
          <option value="Rock Paper Scissors">Rock Paper Scissors</option>
          <option value="Minimax Explorer">Algorithm Labs</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No simulations match your filters"
          message="Try a different search term or filter, or play a game to build real history."
          actions={<Button onClick={() => { setQuery(''); setGameFilter('all') }}>Clear filters</Button>}
        />
      ) : (
        <Card>
          <ul className="divide-y divide-surface-card-border">
            {filtered.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{item.game}</p>
                  <p className="text-xs text-text-tertiary">
                    {item.detail} · {item.date}
                  </p>
                </div>
                <Tooltip label="Replay will reopen this run once match/simulation persistence ships (Phase 12–13).">
                  <Button variant="secondary" disabled>
                    Replay
                  </Button>
                </Tooltip>
              </li>
            ))}
          </ul>
          <DemoDataNotice className="mt-4" />
        </Card>
      )}
    </PageContainer>
  )
}
