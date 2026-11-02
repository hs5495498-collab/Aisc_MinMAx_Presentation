import { useState } from 'react'
import { Grid3x3, Shuffle, Calculator, Target, Scale, ShieldAlert } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { EducationalVariantBanner } from '@/components/feedback/EducationalVariantBanner'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { InteractivePayoffMatrix } from '@/components/rps/strategy-lab/InteractivePayoffMatrix'
import { MixedStrategyExplorer } from '@/components/rps/strategy-lab/MixedStrategyExplorer'
import { ExpectedPayoffCalculator } from '@/components/rps/strategy-lab/ExpectedPayoffCalculator'
import { BestResponseLab } from '@/components/rps/strategy-lab/BestResponseLab'
import { NashEquilibriumExplorer } from '@/components/rps/strategy-lab/NashEquilibriumExplorer'
import { ExploitabilityDemonstration } from '@/components/rps/strategy-lab/ExploitabilityDemonstration'
import { useRpsStrategyLab } from '@/hooks/useRpsStrategyLab'
import { labRoutes } from '@/lib/routes'

const TABS = [
  { id: 'payoff-matrix', label: 'Payoff Matrix', icon: <Grid3x3 size={14} /> },
  { id: 'mixed-strategy', label: 'Mixed Strategy Explorer', icon: <Shuffle size={14} /> },
  { id: 'expected-payoff', label: 'Expected Payoff Calculator', icon: <Calculator size={14} /> },
  { id: 'best-response', label: 'Best Response Lab', icon: <Target size={14} /> },
  { id: 'nash-equilibrium', label: 'Nash Equilibrium Explorer', icon: <Scale size={14} /> },
  { id: 'exploitability', label: 'Exploitability Demonstration', icon: <ShieldAlert size={14} /> },
] as const

type TabId = (typeof TABS)[number]['id']

export function RPSMatrixPage() {
  const route = labRoutes[3]
  const [activeTab, setActiveTab] = useState<TabId>('payoff-matrix')
  const strategyLab = useRpsStrategyLab()

  return (
    <PageContainer
      route={route}
      actions={
        <Badge tone="warning">
          Frontend demo — mirrors the real Python game-theory engine, not yet connected via an API (Phase 12)
        </Badge>
      }
    >
      <SectionSubNav items={labRoutes} />

      <Tabs items={TABS} activeId={activeTab} onChange={(id) => setActiveTab(id as TabId)}>
        {activeTab === 'payoff-matrix' && <InteractivePayoffMatrix />}
        {activeTab === 'mixed-strategy' && <MixedStrategyExplorer {...strategyLab} />}
        {activeTab === 'expected-payoff' && <ExpectedPayoffCalculator {...strategyLab} />}
        {activeTab === 'best-response' && <BestResponseLab {...strategyLab} />}
        {activeTab === 'nash-equilibrium' && <NashEquilibriumExplorer />}
        {activeTab === 'exploitability' && <ExploitabilityDemonstration />}
      </Tabs>

      <EducationalVariantBanner>
        <p className="mb-3">
          Standard simultaneous Rock Paper Scissors is <strong>not</strong> solved by alternating-turn
          Alpha-Beta — there is no second mover with information to search over. This panel instead
          demonstrates Alpha-Beta mechanics on an artificial variant where Player 1&apos;s choice is
          revealed first, turning it into a small sequential game purely for teaching purposes. Building
          that variant out is Phase 11&apos;s scope, not this page&apos;s.
        </p>
        <GraphCanvas illustrative />
      </EducationalVariantBanner>
    </PageContainer>
  )
}
