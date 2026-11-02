import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TicTacToePage } from '@/features/games/tic-tac-toe/TicTacToePage'
import { RockPaperScissorsPage } from '@/features/games/rock-paper-scissors/RockPaperScissorsPage'
import { MinimaxExplorerPage } from '@/features/algorithm-labs/minimax/MinimaxExplorerPage'
import { AlphaBetaExplorerPage } from '@/features/algorithm-labs/alpha-beta/AlphaBetaExplorerPage'
import { SearchTreeLabPage } from '@/features/algorithm-labs/search-tree/SearchTreeLabPage'
import { RPSMatrixPage } from '@/features/algorithm-labs/rps-matrix/RPSMatrixPage'
import { AlgorithmComparisonPage } from '@/features/insights/comparison/AlgorithmComparisonPage'
import { PerformanceAnalyticsPage } from '@/features/insights/analytics/PerformanceAnalyticsPage'
import { SimulationHistoryPage } from '@/features/insights/history/SimulationHistoryPage'
import { MinimaxTutorialPage } from '@/features/learning/minimax/MinimaxTutorialPage'
import { AlphaBetaTutorialPage } from '@/features/learning/alpha-beta/AlphaBetaTutorialPage'
import { GameTheoryTutorialPage } from '@/features/learning/game-theory/GameTheoryTutorialPage'
import { VivaPreparationPage } from '@/features/learning/viva/VivaPreparationPage'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'games/tic-tac-toe', element: <TicTacToePage /> },
      { path: 'games/rock-paper-scissors', element: <RockPaperScissorsPage /> },
      { path: 'labs/minimax', element: <MinimaxExplorerPage /> },
      { path: 'labs/alpha-beta', element: <AlphaBetaExplorerPage /> },
      { path: 'labs/search-tree', element: <SearchTreeLabPage /> },
      { path: 'labs/rps-matrix', element: <RPSMatrixPage /> },
      { path: 'insights/comparison', element: <AlgorithmComparisonPage /> },
      { path: 'insights/analytics', element: <PerformanceAnalyticsPage /> },
      { path: 'insights/history', element: <SimulationHistoryPage /> },
      { path: 'learn/minimax', element: <MinimaxTutorialPage /> },
      { path: 'learn/alpha-beta', element: <AlphaBetaTutorialPage /> },
      { path: 'learn/game-theory', element: <GameTheoryTutorialPage /> },
      { path: 'learn/viva', element: <VivaPreparationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
