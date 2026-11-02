# Page Wireframes — All 14 Pages

Conventions: wireframes are desktop-width ASCII layouts. Theme is
noted per page (see `UI_UX_DESIGN.md` §2). Full breakpoint behavior is
in [`RESPONSIVE_DESIGN.md`](./RESPONSIVE_DESIGN.md); each page below
also calls out its own notable responsive adaptation.

---

## 1. Dashboard — *Dashboard Theme*

```
┌────────────┬──────────────────────────────────────────────────────┐
│            │  Welcome back — pick up where you left off            │
│  Sidebar   ├──────────────────────────────────────────────────────┤
│            │ ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  Dashboard │ │ Play       │ │ Play       │ │ Continue    │          │
│  Games ▸   │ │ Tic-Tac-Toe│ │ RPS        │ │ Last Lesson │          │
│  Labs   ▸  │ └────────────┘ └────────────┘ └────────────┘          │
│  Insights▸ ├──────────────────────────────────────────────────────┤
│  Learning▸ │ Performance Summary        │  Algorithm Lab Shortcuts  │
│            │ ┌──────────────────────┐   │  [Minimax] [Alpha-Beta]  │
│            │ │ win/loss donut + W-L │   │  [Search Tree][RPS Matrix]│
│            │ │ streak, nodes/avg    │   │                           │
│            │ └──────────────────────┘   ├──────────────────────────┤
│            ├──────────────────────────────────────────────────────┤
│            │ Recent Matches & Simulations      │ Learning Progress  │
│            │ • TTT vs AI (Alpha-Beta) — Won     │ ▓▓▓▓▓▓░░ Minimax   │
│            │ • RPS best-of-5 — 3-2 Won          │ ▓▓▓░░░░░ Alpha-Beta│
│            │ • Minimax Explorer run #18         │ ░░░░░░░░ RPS Theory│
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** Welcome header → Quick-access game/lesson cards →
Performance summary + Lab shortcuts (two-column) → Recent
activity + Learning progress (two-column).

**Responsive note:** quick-access cards wrap to a horizontally
swipeable row on tablet/mobile; the two two-column sections stack
vertically below 768px.

---

## 2. Tic-Tac-Toe Game — *Dashboard Theme*

```
┌────────────┬──────────────────────────────────────────────────────┐
│  Sidebar   │ Tic-Tac-Toe              Mode: [Human vs AI ▾]        │
│            │ AI: [Alpha-Beta (ordered) ▾]  Difficulty: [Hard ▾]    │
│            ├───────────────────────────┬──────────────────────────┤
│            │                           │ Turn: ● X to move         │
│            │      ┌───┬───┬───┐        │ Scoreboard               │
│            │      │ X │   │ O │        │  You 2   AI 1   Draws 0  │
│            │      ├───┼───┼───┤        ├──────────────────────────┤
│            │      │   │ X │   │        │ AI thinking… ⏳ (when AI  │
│            │      ├───┼───┼───┤        │ turn is in progress)     │
│            │      │   │   │   │        ├──────────────────────────┤
│            │      └───┴───┴───┘        │ Move History             │
│            │  [Undo]  [Restart]        │ 1. X→4  2. O→2  3. X→5    │
│            ├───────────────────────────┴──────────────────────────┤
│            │ ▸ Open this position in Minimax Explorer              │
│            │ ▸ Compare Minimax vs Alpha-Beta on this position       │
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** Mode/AI/difficulty controls → Board + turn/scoreboard
(two-column) → AI-thinking state + move history → links into the
Algorithm Labs with the *current* board position carried over.

**Responsive note:** board stays centered and square at all widths;
turn/scoreboard/history move below the board on mobile instead of
beside it; AI-thinking indicator becomes a persistent top banner on
mobile so it's visible without scrolling to the sidebar.

---

## 3. Rock Paper Scissors Game — *Dashboard Theme*

```
┌────────────┬──────────────────────────────────────────────────────┐
│  Sidebar   │ Rock Paper Scissors     Mode: [Human vs AI ▾]         │
│            │ AI Strategy: [Nash (uniform) ▾]  Best of: [5 ▾]       │
│            ├──────────────────────────────────────────────────────┤
│            │     Round 3 of 5          Score  You 2 — AI 1 — Tie 0 │
│            │  ┌───────┐ ┌───────┐ ┌───────┐                        │
│            │  │ 🪨 Rock│ │📄 Paper│ │✂️ Scis.│   ← 44px+ touch targets│
│            │  └───────┘ └───────┘ └───────┘                        │
│            │        Result: You played Rock, AI played Scissors    │
│            │              → You win this round! (animated)         │
│            ├──────────────────────────────────────────────────────┤
│            │ Match History                 │ AI Strategy Explainer │
│            │ R1 Rock vs Paper  — Loss       │ "Plays each option   │
│            │ R2 Paper vs Scis. — Loss       │  with probability    │
│            │ R3 Rock vs Scis.  — Win        │  1/3 — unexploitable"│
│            ├──────────────────────────────────────────────────────┤
│            │ ▸ Open RPS Strategy Matrix                            │
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** Mode/strategy/format controls → round counter + score →
three choice buttons → animated result → history + strategy explainer
(two-column) → link to RPS Strategy Matrix.

**Responsive note:** the three choice buttons become a single centered
row sized to fill the viewport width on mobile (large touch targets);
history and explainer stack full-width below the result.

---

## 4. Minimax Explorer — *Graph Theme*

```
┌───────────┬──────────────────────────────────────┬───────────────┐
│ Config    │        Search Tree Canvas             │ Node Detail   │
│ Panel     │   (pan/zoom, graph-paper grid)         │ Panel         │
│           │                                        │               │
│ Position: │        ●MAX                            │ Node n_17     │
│ [current  │       / | \                            │ Player: MIN   │
│  TTT state│     ○   ●   ○   ← unexplored/visited   │ Depth: 3      │
│  or custom]      |                                 │ Value: —      │
│           │      ●MIN (active, pulsing)            │ Alpha: 10      │
│ Depth cap:│     /|\                                │ Beta: -5       │
│ [Full ▾]  │    ◻ ◻ ◻  ← evaluated (value badges)    │               │
│           │                                        ├───────────────┤
├───────────┤                                        │ Stats          │
│ ▶ ⏸ ⏮ ⏭ ↺ │ Speed: [0.5x 1x 2x 4x]                  │ Nodes: 412     │
│ Controls  │                                        │ Pruned: 0      │
└───────────┴──────────────────────────────────────┴───────────────┘
```

**Hierarchy:** left configuration panel (position, depth cap) → center
canvas (the actual recorded search-event tree, replayed via transport
controls) → right node-detail + stats panel. No pruning in Minimax
Explorer by design (it demonstrates the *unpruned* baseline); the
"Pruned: 0" stat is intentional, not a bug, and is called out in the
explanation panel below the canvas.

**Responsive note:** on mobile, config panel and node-detail panel
collapse into bottom sheets triggered by toolbar icons; the canvas
takes the full viewport with pinch-zoom/pan.

---

## 5. Alpha-Beta Explorer — *Graph Theme*

```
┌───────────┬──────────────────────────────────────┬───────────────┐
│ Config    │        Search Tree Canvas             │ Node Detail   │
│ Panel     │                                        │               │
│ Position  │        ●MAX                            │ Node n_9       │
│ Ordering: │       / | \                            │ Player: MIN    │
│ (•)Ordered│     ●   ▦   ▦  ← ▦ = pruned (hatched)  │ Alpha: 10      │
│ ( )Unord. │     |                                  │ Beta: -5       │
│           │     ●MIN (evaluated, value -5)         │ Prune reason:  │
│ Depth cap:│                                        │ "alpha(10) ≥   │
│ [Full ▾]  │  (greyed, dashed subtree collapsed)    │  beta(-5)"     │
├───────────┤                                        ├───────────────┤
│ ▶ ⏸ ⏮ ⏭ ↺ │ Speed: [0.5x 1x 2x 4x]                  │ Stats          │
│ Controls  │                                        │ Nodes: 189     │
│           │                                        │ Pruned: 223    │
└───────────┴──────────────────────────────────────┴───────────────┘
```

**Hierarchy:** same layout family as Minimax Explorer (shared
component) with an added **Ordered/Unordered** toggle in the config
panel and a pruned-node count that updates live as the toggle changes,
making the ordering effect directly comparable.

**Responsive note:** identical pattern to Minimax Explorer; the
ordering toggle moves to the top of the mobile config sheet so it's
reachable without scrolling.

---

## 6. Search Tree Lab — *Graph Theme*

```
┌───────────┬────────────────────────┬────────────────────────┐
│ Config    │  Minimax Tree           │  Alpha-Beta Tree        │
│ Panel     │  (same position)        │  (same position)        │
│ Position: │        ●MAX             │        ●MAX              │
│ [shared]  │       /|\               │       /|▦               │
│           │      ● ● ●              │      ● ● (pruned)        │
│ Step: 14/40─────────────────────────────────────────────────── │
│ ▶ ⏸ ⏮ ⏭ ↺ │        Synchronized step-through, both panes        │
├───────────┴────────────────────────┴────────────────────────┤
│ Node Inspection (selected node mirrored across both trees)     │
│ MAX/MIN value propagation log · Alpha/Beta update log · Pruning│
│ explanation: "At n_9, Alpha-Beta skips what Minimax still       │
│ visits — 223 fewer nodes for the same final move."              │
└──────────────────────────────────────────────────────────────┘
```

**Hierarchy:** one shared config/step-control bar drives two
synchronized canvases (Minimax vs. Alpha-Beta on the *same* position)
→ a combined inspection/log panel beneath explains value
propagation, alpha/beta updates, and pruning in plain language,
node-for-node.

**Responsive note:** side-by-side canvases stack vertically on
tablet/mobile with a shared, sticky step-control bar between them so
both remain reachable with one scroll gesture.

---

## 7. RPS Strategy Matrix — *Dashboard Theme (+ Graph Theme panel)*

```
┌────────────┬──────────────────────────────────────────────────────┐
│  Sidebar   │ RPS Strategy Matrix                                   │
│            ├───────────────────────────┬──────────────────────────┤
│            │ Payoff Matrix              │ Mixed-Strategy Equilibrium│
│            │        R     P     S       │ P(Rock)     ▓▓▓▓▓▓ 33.3% │
│            │  R  [ 0]  [-1]  [+1]       │ P(Paper)    ▓▓▓▓▓▓ 33.3% │
│            │  P  [+1]  [ 0]  [-1]       │ P(Scissors) ▓▓▓▓▓▓ 33.3% │
│            │  S  [-1]  [+1]  [ 0]       │ Expected value: 0 (fair) │
│            ├───────────────────────────┴──────────────────────────┤
│            │ Strategy selector: [Nash ▾][Biased ▾][Pattern-adaptive▾]│
│            │ Explanation: pure vs. mixed strategy, why 1/3 each is  │
│            │ the only unexploitable distribution (symmetry proof)   │
│            ├──────────────────────────────────────────────────────┤
│            │ ⚠ Educational — Sequential Variant, Not Standard RPS   │
│            │ ┌──────────────────────────────────────────────────┐ │
│            │ │ (Graph-theme mini search tree: P1 reveals first)  │ │
│            │ └──────────────────────────────────────────────────┘ │
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** payoff matrix + equilibrium bars (two-column, dashboard
theme) → strategy selector + plain-language explanation → a visually
separated, warning-labeled panel containing the graph-theme sequential
search-tree demo, which is never placed above or styled identically to
the standard-game content.

**Responsive note:** matrix and equilibrium bars stack vertically on
mobile; the educational panel remains visually separated (border +
warning header) at every width so it is never mistaken for the
standard-game explanation above it.

---

## 8. Algorithm Comparison — *Dashboard Theme*

```
┌────────────┬──────────────────────────────────────────────────────┐
│  Sidebar   │ Algorithm Comparison      Position: [fixed test set ▾]│
│            ├──────────────────────────────────────────────────────┤
│            │  Nodes Visited (bar)         │ Execution Time (bar)   │
│            │  Minimax        ▓▓▓▓▓▓▓▓ 5478 │ ▓▓▓▓▓▓ 11.2ms          │
│            │  Alpha-Beta(U)  ▓▓▓ 2114      │ ▓▓ 4.6ms               │
│            │  Alpha-Beta(O)  ▓ 892         │ ▓ 2.1ms                │
│            ├──────────────────────────────────────────────────────┤
│            │ Nodes Pruned          │ Search Efficiency (%)         │
│            │ (stacked bar)         │ pruned / total visited-if-naive│
│            ├──────────────────────────────────────────────────────┤
│            │ ℹ Methodology: all runs use the same fixed set of     │
│            │ Tic-Tac-Toe positions at full search depth, so bars   │
│            │ are directly comparable to each other only — not to   │
│            │ RPS metrics, which use a different model (see below).│
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** position/test-set selector → paired bar charts (nodes,
time, pruned, efficiency) → a permanent methodology disclosure
explaining exactly what is and is not comparable, preventing
misleading cross-game performance claims.

**Responsive note:** the four chart panels become a single scrollable
column on mobile, each full-width, with the methodology note pinned
directly beneath the first chart rather than only at the bottom.

---

## 9. Performance Analytics — *Dashboard Theme*

```
┌────────────┬──────────────────────────────────────────────────────┐
│  Sidebar   │ Performance Analytics   Filter: [Game ▾][Date range ▾]│
│            ├───────────────────────────┬──────────────────────────┤
│            │ Games Played (line/area)  │ Win / Loss / Draw (donut) │
│            ├───────────────────────────┼──────────────────────────┤
│            │ AI Performance by          │ Match Trend (last 20)    │
│            │ Algorithm/Strategy (bars)  │ sparkline + streak        │
│            ├──────────────────────────────────────────────────────┤
│            │ Algorithm Execution Metrics table (sortable, filterable)│
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** filters → four chart panels (two-column grid) →
detailed sortable/filterable metrics table beneath.

**Responsive note:** chart grid collapses to one column; the metrics
table switches from a multi-column table to a stacked card-per-row
layout on mobile.

---

## 10. Simulation History — *Dashboard Theme*

```
┌────────────┬──────────────────────────────────────────────────────┐
│  Sidebar   │ Simulation History   Filter: [Game▾][Algorithm▾][Date▾]│
│            ├──────────────────────────────────────────────────────┤
│            │ • TTT · Alpha-Beta(O) · Hard · Won · 2026-11-01 ▸Replay│
│            │ • RPS · Best-of-5 · Nash · 3-2 Won · 2026-11-01 ▸Replay│
│            │ • Search Tree Lab run #18 · comparison saved  ▸Replay │
│            ├──────────────────────────────────────────────────────┤
│            │          (Empty state if no history exists:)          │
│            │     🗂  No simulations yet — play a game or run        │
│            │          an Algorithm Lab to build history.            │
│            │          [Play Tic-Tac-Toe]  [Open Minimax Explorer]   │
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** filters → reverse-chronological list of detailed match/
search records, each with a **Replay** action that reopens the
relevant game page or Algorithm Lab pre-loaded with that run's data →
explicit empty state with two concrete CTAs.

**Responsive note:** list rows keep their single-column layout at all
widths (already list-like); filters collapse into a single "Filters"
button opening a bottom sheet on mobile.

---

## 11. Minimax Tutorial — *Dashboard Theme*

```
┌────────────┬──────────────────────────────────────────────────────┐
│  Sidebar   │ Minimax Tutorial        Progress ▓▓▓▓▓▓░░ 3/5 lessons │
│            ├───────────────────────────┬──────────────────────────┤
│            │ Lesson Nav                │ Lesson 3: MAX & MIN nodes │
│            │ 1. What is adversarial     │ (text + inline mini graph │
│            │    search? ✓               │  diagram, Graph-theme     │
│            │ 2. Game trees ✓            │  embed for the example)   │
│            │ 3. MAX & MIN nodes  ◀      │                            │
│            │ 4. Scoring & depth         │ Knowledge check:           │
│            │ 5. Worked example          │ "At a MIN node, which      │
│            │                            │  child does it choose?"    │
│            │                            │ ( ) Highest value           │
│            │                            │ (•) Lowest value            │
│            │                            │ [Check Answer]               │
├────────────┴───────────────────────────┴──────────────────────────┤
│            │ [← Previous]                              [Next →]     │
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** lesson nav (left) + content (right) two-column →
embedded mini graph-theme diagram per concept → inline knowledge-check
→ previous/next controls; progress bar always visible at top.

**Responsive note:** lesson nav collapses into a horizontal, swipeable
stepper above the content on mobile instead of a left column.

---

## 12. Alpha-Beta Tutorial — *Dashboard Theme*

Same structural pattern as the Minimax Tutorial (shared `TutorialLayout`
component — see `COMPONENT_INVENTORY.md`), with lesson list:

```
1. Why prune a Minimax tree? ✓
2. Alpha and Beta, defined ✓
3. The pruning condition (α ≥ β)  ◀
4. Move ordering and why it matters
5. Worked example: ordered vs. unordered
```

Lesson 3 and 4 embed live mini graph-theme diagrams showing a pruning
event and an ordering comparison respectively, reusing the Search Tree
Lab's canvas component at a reduced scale.

**Responsive note:** identical to Minimax Tutorial.

---

## 13. RPS Game Theory Tutorial — *Dashboard Theme*

```
1. Sequential vs. simultaneous games ✓
2. Zero-sum payoff matrices ✓
3. Pure vs. mixed strategies  ◀
4. Deriving the 1/3-1/3-1/3 equilibrium (symmetry + indifference)
5. Exploitability — what happens if you deviate
```

Lesson 3–5 embed the same `PayoffMatrixGrid` and `ProbabilityBar`
components used in the RPS Strategy Matrix (consistent visuals between
"learning it" and "exploring it"). Lesson 1 explicitly contrasts RPS
(simultaneous) with Tic-Tac-Toe (sequential) side by side, reinforcing
why Alpha-Beta applies to one and not the other.

**Responsive note:** identical pattern to the other tutorials; the
side-by-side RPS/Tic-Tac-Toe comparison in Lesson 1 stacks vertically
on mobile.

---

## 14. Interactive Viva Preparation — *Dashboard Theme*

```
┌────────────┬──────────────────────────────────────────────────────┐
│  Sidebar   │ Viva Preparation     Difficulty: [Beginner/Inter/Adv ▾]│
│            ├──────────────────────────────────────────────────────┤
│            │ Topic: [All] [Minimax] [Alpha-Beta] [RPS Theory]      │
│            ├──────────────────────────────────────────────────────┤
│            │ Q7. "Why does ordering moves improve Alpha-Beta's      │
│            │      pruning, but not Minimax's correctness?"          │
│            │                                                        │
│            │      [Type or speak your answer...]        [Submit]   │
│            │                                                        │
│            │  ✓ Model answer revealed after submission, with a      │
│            │    link back to Alpha-Beta Explorer for a live demo.   │
│            ├──────────────────────────────────────────────────────┤
│            │ Session score: 6/8 correct    [Next Question →]        │
└────────────┴──────────────────────────────────────────────────────┘
```

**Hierarchy:** difficulty + topic filters → one question at a time
with a free-text answer box → model answer + cross-link to the
relevant lab/tutorial on submission → running session score.

**Responsive note:** filters collapse into a single row of dropdowns
at full width on mobile; question/answer area keeps generous line
length (max ~65 characters per line) by capping its max-width even on
wide desktop screens.
