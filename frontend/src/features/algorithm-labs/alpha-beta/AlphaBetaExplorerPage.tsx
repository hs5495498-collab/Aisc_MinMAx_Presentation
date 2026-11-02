import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { SearchTreeExplorerView } from '@/components/graph/search-tree/SearchTreeExplorerView'
import { useSearchTreeExplorer } from '@/hooks/useSearchTreeExplorer'
import { labRoutes } from '@/lib/routes'

export function AlphaBetaExplorerPage() {
  const route = labRoutes[1]
  const explorer = useSearchTreeExplorer('alpha_beta')

  return (
    <PageContainer route={route}>
      <SectionSubNav items={labRoutes} />
      <SearchTreeExplorerView explorer={explorer} runLabel="Run Alpha-Beta" />
      <section className="mt-6 rounded-lg border border-surface-card-border bg-surface-card p-5 text-sm text-text-secondary">
        <h2 className="mb-2 font-display text-base font-semibold text-text-primary">Pruned-node legend</h2>
        <p>
          Pruned branches render greyed out with a dashed outline and an "×", never by color alone —
          and they genuinely have no children, because the algorithm never evaluated them. Select a
          pruned node to see exactly why it was skipped (the alpha/beta values that triggered the
          cutoff). This baseline uses the same row-major move ordering as the Minimax Explorer, by
          design, so the two are fairly comparable — see the Search Tree Lab for a direct side-by-side
          comparison.
        </p>
        <p className="mt-2 text-xs text-text-tertiary">
          The position dropdown offers a small, fixed set of positions generated offline (no backend
          API exists yet to analyze an arbitrary board you set up yourself — see
          docs/SEARCH_TREE_VISUALIZATION.md for the planned Phase 12 integration).
        </p>
      </section>
    </PageContainer>
  )
}
