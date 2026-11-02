import {
  LayoutDashboard,
  Gamepad2,
  Hash,
  Scissors,
  Brain,
  GitBranch,
  Workflow,
  Grid3x3,
  BarChart3,
  GitCompareArrows,
  TrendingUp,
  History,
  GraduationCap,
  BookOpen,
  Scale,
  MessageCircleQuestion,
} from 'lucide-react'
import type { NavSection, RouteMeta } from '@/types/nav'

export const dashboardRoute: RouteMeta = {
  path: '/dashboard',
  label: 'Dashboard',
  section: 'dashboard',
  theme: 'dashboard',
  description: 'Overview of recent activity, quick access to both games, and learning progress.',
  icon: LayoutDashboard,
}

export const gameRoutes: RouteMeta[] = [
  {
    path: '/games/tic-tac-toe',
    label: 'Tic-Tac-Toe',
    section: 'games',
    theme: 'dashboard',
    description: 'Play Tic-Tac-Toe against another human or a demo AI opponent.',
    icon: Hash,
  },
  {
    path: '/games/rock-paper-scissors',
    label: 'Rock Paper Scissors',
    section: 'games',
    theme: 'dashboard',
    description: 'Play Rock Paper Scissors and explore round-based match formats.',
    icon: Scissors,
  },
]

export const labRoutes: RouteMeta[] = [
  {
    path: '/labs/minimax',
    label: 'Minimax Explorer',
    section: 'labs',
    theme: 'graph',
    description: 'Step through a Minimax search tree, node by node.',
    icon: Brain,
  },
  {
    path: '/labs/alpha-beta',
    label: 'Alpha-Beta Explorer',
    section: 'labs',
    theme: 'graph',
    description: 'See how Alpha-Beta Pruning skips branches Minimax would still visit.',
    icon: GitBranch,
  },
  {
    path: '/labs/search-tree',
    label: 'Search Tree Lab',
    section: 'labs',
    theme: 'graph',
    description: 'Compare Minimax and Alpha-Beta side by side on the same position.',
    icon: Workflow,
  },
  {
    path: '/labs/rps-matrix',
    label: 'RPS Strategy Matrix',
    section: 'labs',
    theme: 'dashboard',
    description: 'Explore the Rock Paper Scissors payoff matrix and mixed-strategy equilibrium.',
    icon: Grid3x3,
  },
]

export const insightRoutes: RouteMeta[] = [
  {
    path: '/insights/comparison',
    label: 'Algorithm Comparison',
    section: 'insights',
    theme: 'dashboard',
    description: 'Compare Minimax and Alpha-Beta on nodes visited, time, and pruning.',
    icon: GitCompareArrows,
  },
  {
    path: '/insights/analytics',
    label: 'Performance Analytics',
    section: 'insights',
    theme: 'dashboard',
    description: 'Win/loss trends and algorithm execution metrics over time.',
    icon: TrendingUp,
  },
  {
    path: '/insights/history',
    label: 'Simulation History',
    section: 'insights',
    theme: 'dashboard',
    description: 'Browse and filter past matches and algorithm lab runs.',
    icon: History,
  },
]

export const learningRoutes: RouteMeta[] = [
  {
    path: '/learn/minimax',
    label: 'Minimax Tutorial',
    section: 'learning',
    theme: 'dashboard',
    description: 'Learn how Minimax evaluates MAX and MIN nodes, step by step.',
    icon: BookOpen,
  },
  {
    path: '/learn/alpha-beta',
    label: 'Alpha-Beta Tutorial',
    section: 'learning',
    theme: 'dashboard',
    description: 'Learn why and how Alpha-Beta Pruning skips unnecessary branches.',
    icon: BookOpen,
  },
  {
    path: '/learn/game-theory',
    label: 'RPS Game Theory',
    section: 'learning',
    theme: 'dashboard',
    description: 'Learn simultaneous-action games, payoff matrices, and Nash equilibrium.',
    icon: Scale,
  },
  {
    path: '/learn/viva',
    label: 'Interactive Viva Preparation',
    section: 'learning',
    theme: 'dashboard',
    description: 'Practice viva questions across both games and both algorithms.',
    icon: MessageCircleQuestion,
  },
]

export const allRoutes: RouteMeta[] = [
  dashboardRoute,
  ...gameRoutes,
  ...labRoutes,
  ...insightRoutes,
  ...learningRoutes,
]

export const navSections: NavSection[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    directPath: dashboardRoute.path,
    items: [],
  },
  { key: 'games', label: 'Games', icon: Gamepad2, items: gameRoutes },
  { key: 'labs', label: 'Algorithm Labs', icon: Brain, items: labRoutes },
  { key: 'insights', label: 'Insights', icon: BarChart3, items: insightRoutes },
  { key: 'learning', label: 'Learning', icon: GraduationCap, items: learningRoutes },
]

export function findRouteMeta(pathname: string): RouteMeta | undefined {
  return allRoutes.find((route) => route.path === pathname)
}
