# Design Decisions

Each entry: decision, rationale, alternatives considered, trade-offs.

## 1. Elaborate Phase 1A's theme sketch rather than replace it

**Decision:** `UI_UX_DESIGN.md` is revised in place to become the full
token-level design system, keeping Phase 1A's two-theme split and
route-to-theme assignment unchanged.

**Rationale:** Phase 1A already correctly assigned themes per page and
established the permanent-reference requirement; Phase 2's job is to
make that implementable (hex values, type scale, component states), not
to re-decide it.

**Alternatives considered:** Writing a separate "Phase 2 design system"
document and leaving the Phase 1A theme section as historical record.

**Trade-off:** Rejected the alternative — it would create two
documents that could drift out of sync. A single source of truth for
theming was judged more valuable than preserving a literal history of
each phase's wording.

## 2. One shared `SearchTreeCanvas` component for every tree view

**Decision:** Minimax Explorer, Alpha-Beta Explorer, Search Tree Lab,
the RPS sequential-educational panel, and tutorial mini-diagrams all
render the same conceptual component, driven by the same search-event
schema (`SEARCH_VISUALIZATION_DESIGN.md`).

**Rationale:** Reference A explicitly requires that the search tree
"represent genuine algorithm execution events, never decorative or
fabricated nodes." The only structural way to guarantee that for every
surface that shows a tree is to make them all consume the same
event-log data path — a hand-built "example diagram" component would
be a standing risk of silently drifting into decoration.

**Alternatives considered:** A lightweight static-diagram component
for tutorials (cheaper to build, no backend dependency for simple
examples).

**Trade-off:** Accepted the extra coupling (tutorials now need a real,
even if small, example event log) in exchange for never having a
code path that can render a fabricated tree.

## 3. Standard RPS and the sequential-educational variant are never visually equivalent

**Decision:** The sequential variant always renders inside
`EducationalModeBadgePanel` — a distinctly bordered, warning-colored,
icon-labeled container, placed below (never above or beside, unlabeled)
the standard payoff-matrix/equilibrium content, at every breakpoint.

**Rationale:** The platform's explicit mathematical requirement is that
standard simultaneous RPS must never be presented as solved by
alternating-turn search. Visual separation is the enforcement
mechanism for a rule that's easy to violate by accident once both
visualizations exist on the same page.

**Alternatives considered:** A toggle/tab that swaps between "Standard"
and "Educational" views in the same visual slot.

**Trade-off:** Rejected the tab approach — it would make the two views
occupy the same visual "weight" and could read as two equally valid
models of the same game, which is mathematically incorrect. The
always-visible, clearly subordinate panel was chosen instead, at the
cost of a slightly longer page.

## 4. Node role (color) and node state (shape) as independent visual dimensions

**Decision:** MAX/MIN is always color (cyan/purple); unexplored/active/
visited/evaluated/pruned is always conveyed by opacity, border style,
pulse, or hatch pattern — never by introducing additional colors.

**Rationale:** Required by `UI_UX_DESIGN.md` §7 (color is never the
only signal) and directly serves Reference A's five-state requirement
without needing 10 distinct colors, which would be both visually noisy
and inaccessible.

**Alternatives considered:** A distinct color per (role × state)
combination (10 colors total).

**Trade-off:** Rejected — more colors would look closer to "genuinely
distinct" at a glance but fails color-blind and grayscale legibility,
and contradicts the accessibility requirement.

## 5. Mixed-theme page: RPS Strategy Matrix

**Decision:** The page uses the Dashboard theme for its matrix/
probability panels and the Graph theme for its embedded educational
panel — the one page in the platform that is not single-themed.

**Rationale:** The matrix/equilibrium content is numerical/statistical
(Dashboard theme's domain); the sequential demonstration is a search
tree (Graph theme's domain). Forcing one theme onto both would either
make the payoff matrix feel like a technical diagnostic tool, or make
the search tree feel like a marketing chart — neither matches the
content.

**Alternatives considered:** Splitting into two separate pages/routes.

**Trade-off:** Kept as one page for discoverability (the educational
demo is more useful seen right next to the real equilibrium it
contrasts with), accepting that this is the one page needing an
explicit theme-boundary treatment (visually boxed panel) rather than a
clean full-page theme switch.

## 6. Comparison metric priority: nodes visited over wall-clock time

**Decision:** `ComparisonBarChart` and `ALGORITHM_DESIGN.md` treat
nodes-visited/pruned as the primary comparison metric; elapsed time is
shown but secondary.

**Rationale:** Tic-Tac-Toe's search space is small enough that
wall-clock timing is dominated by measurement noise (JIT warmup,
scheduling), while node counts are deterministic and directly tied to
the algorithm's behavior.

**Alternatives considered:** Leading with elapsed time, since it is
more intuitively meaningful to non-technical users.

**Trade-off:** Accepted a slightly less immediately-relatable primary
metric in exchange for a comparison that is actually reproducible and
not misleading — directly serving the "do not create misleading
performance metrics" requirement.

## 7. Full event-log fetch + client-side replay, not live streaming

**Decision:** Search-tree pages fetch the complete, already-computed
search-event log once, then drive the animated replay entirely on the
client via `TransportControls`.

**Rationale:** Tic-Tac-Toe searches complete in milliseconds, so there
is no real "live" computation to stream; a fetched log also makes
scrubbing backward/forward, speed changes, and exact replay from
Simulation History trivial and deterministic.

**Alternatives considered:** Server-sent events / WebSocket streaming
of nodes as they're "discovered," for a more literal "watch it think"
feel.

**Trade-off:** Rejected streaming for this phase — it adds real-time
infrastructure for a search that is already near-instant server-side;
the client-side replay achieves the same perceived experience (Play/
Pause/Step/Speed) without it. This can be revisited if deeper searches
(e.g. a future larger game) make live streaming meaningful.

## 8. Typography: Sora + Inter + JetBrains Mono

**Decision:** Sora for display/headings, Inter for body/UI text,
JetBrains Mono for board/value/node-id readouts.

**Rationale:** Matches Reference B's "premium typography, clear visual
hierarchy" (Sora's geometric display weight) while keeping dense UI
text (tables, lists, tooltips) highly legible (Inter). JetBrains Mono
gives board states and numeric readouts a technical, tabular feel
appropriate to the Graph theme.

**Alternatives considered:** A single typeface family for everything
(simpler to manage).

**Trade-off:** Accepted managing three font files for a stronger match
to both references and clearer visual role-separation between
"headline," "content," and "technical readout" text.

## 9. Command palette (Ctrl/Cmd+K) as the quick-navigation mechanism

**Decision:** One global fuzzy-search command palette covers page
navigation, lessons, and recent matches/simulations, rather than a
separate search box per section.

**Rationale:** With 14 pages across 4 sections plus history records,
a single fast keyboard-driven entry point scales better than scattering
section-local search boxes, and keeps the sidebar focused on browsing
rather than searching.

**Alternatives considered:** Per-section search inputs (e.g. a filter
box on Simulation History only, nothing global).

**Trade-off:** The global palette requires indexing across unrelated
data types (pages, lessons, history); accepted as a reasonable scope
increase for a meaningfully better navigation experience on a platform
this size.

## 10. Permanent methodology disclosure on Algorithm Comparison

**Decision:** `MethodologyNote` is a fixed, non-dismissible section on
the Algorithm Comparison page stating exactly what is being compared
(same fixed Tic-Tac-Toe position set, full depth) and explicitly that
RPS metrics are not comparable on the same chart.

**Rationale:** Directly required by the brief ("do not create
misleading performance metrics or imply... comparable across different
game models without explaining the methodology").

**Alternatives considered:** A one-time dismissible info tooltip.

**Trade-off:** A dismissible tooltip could be missed or dismissed and
never seen again by a returning user; the always-visible note costs
a small amount of permanent vertical space in exchange for the
disclosure always being present when the charts are being read.
