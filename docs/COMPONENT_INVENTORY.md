# Component Inventory

Conceptual inventory only — no code, no prop typing, no implementation.
"Props/state (conceptual)" describes the data a component needs
conceptually, not a finalized interface.

## Shared / Cross-Cutting Components

| Component | Responsibility | Used by | Props/state (conceptual) |
|---|---|---|---|
| `AppShell` | Renders sidebar/topbar/bottom-tab-bar per breakpoint, hosts route content | All pages | current route, collapse state |
| `Sidebar` / `BottomTabBar` | Primary navigation per `UI_UX_DESIGN.md` §3 | All pages | active section, collapsed flag |
| `Breadcrumb` | Shows section/page path | Nested pages | path segments |
| `CommandPalette` | Ctrl/Cmd+K quick navigation/search | Global | query, result list |
| `Button` | Primary/secondary/ghost actions | All pages | variant, disabled, loading |
| `IconButton` | Icon-only action (nav toggle, settings, transport controls) | Nav, graph pages | icon, label (for a11y), active |
| `Card` | Dashboard-theme glass container | Dashboard, Insights, Learning | title, children |
| `GraphPanel` | Graph-theme flat container (no glass blur) | Algorithm Labs | title, children |
| `Modal` | Centered dialog with focus trap | Settings, confirmations | open, onClose, children |
| `Tooltip` | Hover/focus contextual info | Payoff matrix cells, graph nodes, icon buttons | content, trigger ref |
| `Toast` / `ToastProvider` | Transient success/error/warning messages | All pages | message, type, duration |
| `Badge` | Small labeled tag (algorithm name, difficulty, **"Educational" warning label**) | Game pages, Labs | text, tone |
| `EmptyState` | Icon + message + CTA(s) for no-data cases | Simulation History, Dashboard activity | icon, message, actions |
| `ErrorState` | Inline error banner with retry | Any data-fetching view | message, onRetry |
| `LoadingSkeleton` | Shimmer placeholder | Any data-fetching view | shape (card/list/canvas) |
| `ProgressBar` | Linear progress (lesson completion, viva score) | Learning pages, Dashboard | value, max |
| `StatTile` | Single metric with label + value + trend | Dashboard, Insights | label, value, trend |
| `SettingsPanel` | Reduced-motion/sound/density/default-difficulty prefs | Global (topbar) | current prefs, onChange |

## Game — Tic-Tac-Toe

| Component | Responsibility | Props/state (conceptual) |
|---|---|---|
| `TicTacToeBoard` | Renders 3×3 grid, handles cell click, exposes a11y labels | board state, onCellSelect, interactive flag |
| `TurnIndicator` | Shows whose turn it is + AI-thinking state | current player, ai_thinking flag |
| `Scoreboard` (shared shape with RPS, different content) | Win/loss/draw tally | wins, losses, draws |
| `MoveHistoryList` | Lists moves with algorithm/difficulty used | history records |
| `GameControls` | Undo/Restart buttons | canUndo, onUndo, onRestart |
| `AlgorithmSelector` | Dropdown: Minimax / Alpha-Beta (ordered/unordered) | value, onChange, options |
| `DifficultySelector` | Dropdown: Easy/Medium/Hard | value, onChange |
| `CrossLinkToLab` | "Open in Minimax Explorer" / "Compare…" links carrying current position | target lab, position payload |

## Game — Rock Paper Scissors

| Component | Responsibility | Props/state (conceptual) |
|---|---|---|
| `RPSChoicePanel` | Three choice buttons + locked-in/result state | onChoose, locked, result |
| `RoundResultAnimation` | Reveal + win/loss/tie animation | humanChoice, opponentChoice, result |
| `RPSScoreboard` | Human/AI/tie tally + round counter | scoreboard, roundNumber, bestOf |
| `MatchHistoryList` | Per-round record list | rounds |
| `BestOfSelector` | 3 / 5 / 10 selector | value, onChange |
| `StrategySelector` | Nash / Biased / Pattern-adaptive / (lab-only) Sequential-educational | value, onChange, options |
| `StrategyExplainer` | Plain-language note on the active AI strategy | strategy id |

## Algorithm Labs

| Component | Responsibility | Props/state (conceptual) |
|---|---|---|
| `SearchTreeCanvas` | Renders/animates the actual recorded search-event graph; shared by Minimax Explorer, Alpha-Beta Explorer, Search Tree Lab, RPS sequential panel, and the tutorial mini-diagrams | search_tree events, step index, zoom/pan state |
| `TransportControls` | Play/Pause/Prev/Next/Reset/Speed | step index, total steps, playing, speed |
| `NodeDetailPanel` / `NodeDetailSheet` | Selected node's board/value/alpha/beta/prune-reason (panel on desktop, bottom sheet on mobile) | selected node data |
| `SearchStatsPanel` | Nodes visited/pruned, elapsed time | metrics object |
| `OrderingToggle` | Ordered vs. unordered Alpha-Beta | value, onChange |
| `ConfigPanel` | Position input, depth cap, algorithm-specific options | config state |
| `DualCanvasSync` | Wraps two `SearchTreeCanvas` instances with one shared step control (Search Tree Lab) | shared step index |
| `PayoffMatrixGrid` | 3×3 payoff matrix with hover explanations | matrix data |
| `ProbabilityBar` | Equilibrium/strategy probability bars | distribution, highlight |
| `EducationalModeBadgePanel` | The permanently separated, warning-labeled sequential-variant container | contains `SearchTreeCanvas` instance |

## Insights

| Component | Responsibility | Props/state (conceptual) |
|---|---|---|
| `ComparisonBarChart` | Nodes/time/pruned bars across algorithms | dataset, metric |
| `MethodologyNote` | Permanent disclosure on what is/isn't comparable | text |
| `TrendChart` | Line/area chart for games-played, trends | series data |
| `MetricsTable` | Sortable/filterable execution metrics | rows, sort/filter state |
| `FilterBar` | Game/algorithm/date filters shared across Insights pages | filter state, onChange |
| `HistoryListItem` | One simulation/match record + Replay action | record, onReplay |

## Learning

| Component | Responsibility | Props/state (conceptual) |
|---|---|---|
| `TutorialLayout` | Shared lesson-nav + content shell for all three tutorials | lessons, currentLesson |
| `LessonContent` | Text/diagram content block for one lesson | content blocks |
| `KnowledgeCheck` | Inline multiple-choice check with feedback | question, options, correctIndex |
| `MiniSearchTreeEmbed` | Small, non-interactive-by-default `SearchTreeCanvas` instance for teaching examples | fixed example event log |
| `VivaQuestionCard` | Free-text question + submit + model-answer reveal | question, answer input, modelAnswer |
| `VivaSessionScore` | Running correct/total score | score, total |
| `DifficultyTopicFilter` | Viva filters | difficulty, topic |

## Shared vs. Page-Specific

- **Shared across both games:** `Scoreboard` shape, `GameControls`
  pattern (even though RPS doesn't expose Undo), `CrossLinkToLab`,
  `EmptyState`/`ErrorState`/`LoadingSkeleton`.
- **Shared across all four Algorithm Labs:** `SearchTreeCanvas`,
  `TransportControls`, `NodeDetailPanel`/`Sheet`, `SearchStatsPanel` —
  this is the component family that makes "genuine algorithm execution
  events, never decorative nodes" (Reference A's requirement)
  structurally guaranteed: every page that shows a tree renders the
  same event-log-driven component, never a hand-authored diagram.
- **Shared across all three tutorials:** `TutorialLayout`,
  `KnowledgeCheck`, `MiniSearchTreeEmbed`.
- **Page-specific:** `TicTacToeBoard`, `RPSChoicePanel`,
  `RoundResultAnimation`, `PayoffMatrixGrid` (RPS-only), `ComparisonBarChart`
  (Insights-only), `VivaQuestionCard` (Viva-only).
