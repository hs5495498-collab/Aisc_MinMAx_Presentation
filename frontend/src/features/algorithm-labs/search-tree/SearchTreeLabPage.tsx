import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { ComparisonWorkspace } from '@/components/graph/search-tree/ComparisonWorkspace'
import { labRoutes } from '@/lib/routes'

export function SearchTreeLabPage() {
  const route = labRoutes[2]
  return (
    <PageContainer route={route}>
      <SectionSubNav items={labRoutes} />
      <ComparisonWorkspace />
    </PageContainer>
  )
}
