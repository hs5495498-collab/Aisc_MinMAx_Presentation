# Frontend Architecture (as implemented, Phase 3)

This describes the actual frontend implementation under `frontend/`,
as built in Phase 3. It supersedes the proposed structure sketch in
Phase 0's `PROJECT_PLAN.md` with what was actually built, and should
stay in sync with the code — update it whenever the structure changes.

## Location and the `frontend/` decision

The Vite app lives at `frontend/`, not at the repository root. Phase 0
proposed `frontend/` and `backend/` as sibling directories; Phase 3
kept that split so the eventual FastAPI backend (Phase 12) has a clear
home that never mixes with frontend tooling/config. This was an
implementation decision made under "smallest reasonable decision"
guidance, since the Phase 3 brief's suggested `src/` tree didn't state
a parent directory explicitly.

## Dependencies (installed versions)

| Package | Version |
|---|---|
| react / react-dom | 19.3.1 |
| vite | 8.3.5 |
| typescript | 7.0.2 |
| tailwindcss / @tailwindcss/vite | 4.3.3 |
| react-router-dom | 7.18.5 |
| framer-motion | 14.9.0 |
| lucide-react | 1.66.0 |
| recharts | 3.10.1 |
| vitest / @testing-library/react / jsdom | 5.0.5 / 16.3.3 / 30.1.3 |

No backend, database, or auth packages were added — out of scope for
this phase.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b` (strict type check) then `vite build`
- `npm run test` — Vitest once (used in CI-style checks)
- `npm run preview` — serve the production build locally

## Folder structure

```
frontend/src/
  app/
    router.tsx          # createBrowserRouter — all 14 routes + 404
  components/
    layout/              AppShell, PageContainer (theme-aware), PageTransition
    navigation/          Sidebar, MobileTabBar, Topbar, Breadcrumb,
                          SectionSubNav, CommandPalette, SettingsPanel
    ui/                   Button, Card, GraphPanel, Badge, Tooltip, Modal, StatTile
    feedback/             EmptyState, ErrorState, LoadingSkeleton,
                          DemoDataNotice, EducationalVariantBanner
    charts/               DemoBarChart, DemoDonutChart, DemoLineChart (Recharts wrappers)
    graph/                GraphWorkspace, GraphCanvas, ExecutionToolbar, NodeLegend
    rps/                  PayoffMatrixGrid, ProbabilityBar
    learning/             TutorialLayout, KnowledgeCheck
  features/
    dashboard/            DashboardPage
    games/
      tic-tac-toe/        TicTacToePage, ticTacToeDemo.ts (demo win-check + random opponent)
      rock-paper-scissors/ RockPaperScissorsPage
    algorithm-labs/
      minimax/            MinimaxExplorerPage
      alpha-beta/         AlphaBetaExplorerPage
      search-tree/        SearchTreeLabPage
      rps-matrix/         RPSMatrixPage
    insights/
      comparison/         AlgorithmComparisonPage
      analytics/          PerformanceAnalyticsPage
      history/            SimulationHistoryPage
    learning/
      minimax/            MinimaxTutorialPage
      alpha-beta/         AlphaBetaTutorialPage
      game-theory/        GameTheoryTutorialPage
      viva/               VivaPreparationPage, vivaQuestions.ts
    not-found/            NotFoundPage (catch-all route)
  hooks/                  useLocalStorageState
  lib/                    routes.ts (single source of truth: path, label, section, theme, icon, description)
  styles/                 tokens.css (design tokens as a Tailwind v4 @theme block)
  types/                  nav.ts
  test/                   setup.ts (jest-dom matchers for Vitest)
```

`lib/routes.ts` is the single source of truth for navigation: the
Sidebar, MobileTabBar, Breadcrumb, CommandPalette, and every page's
`<PageContainer>` header all read from the same 14-entry array, so a
new page can't silently go missing from navigation.

## Theme implementation

Every token in `docs/UI_UX_DESIGN.md` §1 is declared once, in
`src/styles/tokens.css`, as a Tailwind v4 `@theme` block (CSS custom
properties under `--color-*`, `--font-*`, `--radius-*`, `--shadow-*`).
Tailwind v4 auto-generates utility classes from these tokens (e.g.
`--color-accent-violet` → `bg-accent-violet`, `text-accent-violet`,
`border-accent-violet`), so components reference tokens by utility
class name, never by raw hex value.

- **Dashboard theme**: the default. `body` carries the violet gradient
  background globally; `Card` renders the glassmorphism surface.
- **Graph theme**: applied per-page by `PageContainer`, which checks
  `route.theme === 'graph'` (from `lib/routes.ts`) and wraps the page
  in the `.graph-grid-bg` class (the graph-paper grid background);
  `GraphPanel` renders the flat, non-blurred panel surface used inside
  graph-theme pages.
- The RPS Strategy Matrix mixes both: its payoff/probability cards use
  `Card` (dashboard theme) and its educational panel embeds a
  `GraphCanvas` (graph theme) inside `EducationalVariantBanner` — the
  one intentionally mixed-theme page, per `docs/DESIGN_DECISIONS.md` §5.

## Shared component architecture

- `GraphWorkspace` composes `GraphPanel` (config) + `GraphCanvas` +
  `ExecutionToolbar` + `GraphPanel` (node detail/stats/legend) into the
  3-pane layout used identically by Minimax Explorer and Alpha-Beta
  Explorer; Search Tree Lab uses the same pieces directly, duplicated
  side by side, since it needs two synchronized canvases rather than
  one.
- `TutorialLayout` + `KnowledgeCheck` are shared by all three
  non-viva Learning pages (Minimax, Alpha-Beta, RPS Game Theory
  tutorials); Viva Preparation has its own layout since it is
  question-by-question rather than lesson-by-lesson.
- `PageContainer` is the only place that knows how to apply the
  graph-vs-dashboard background, so no feature page hand-rolls theming.

## Graph visualization: Phase 7 decision deferred

`GraphCanvas` currently renders a single static illustrative SVG tree
with real (not simulated) pan via pointer events and zoom via CSS
`transform: scale()` — no graph-rendering library was introduced,
per the Phase 3 brief's "do not introduce a heavy graph library
without justification." Once the real search engine exists (Phase
5–7) and trees have dozens of dynamically-laid-out nodes, this should
be revisited: candidates to evaluate then are **react-flow** (built-in
pan/zoom/node interaction, heavier dependency) and a **custom D3-force
or dagre layout over plain SVG** (lighter, more control, more code to
maintain). That evaluation is explicitly deferred to Phase 7, not
decided here.

## Mobile graph workspace simplification

`docs/RESPONSIVE_DESIGN.md` specifies bottom-sheet config/stats/node-
detail panels on mobile for graph pages. Phase 3 ships a simpler
version: the three `GraphWorkspace` panes stack vertically in document
order on narrow viewports (via `grid-cols-[240px_1fr_260px]` collapsing
to one column below `lg`), rather than true bottom sheets. This is
flagged in `docs/DESIGN_DECISIONS.md` as a scope simplification to
revisit once the workspace has live data worth the extra interaction
cost.

## Known placeholder functionality

See `frontend/README.md`'s "Known placeholder functionality" section
— duplicated there for anyone working directly in `frontend/` without
this file open.

## Testing

`npm run test` runs Vitest + React Testing Library against the real
`App`/`router`, not mocks: it asserts the Dashboard renders at `/`,
that `/games/tic-tac-toe` and the 404 page render their expected
headings, and that the RPS Strategy Matrix always renders the mandatory
"Educational — Sequential Variant, Not Standard RPS" label. `lib/routes.ts`
has a unit test asserting exactly 14 unique, themed routes exist — a
regression guard if a route is ever accidentally removed or duplicated.
