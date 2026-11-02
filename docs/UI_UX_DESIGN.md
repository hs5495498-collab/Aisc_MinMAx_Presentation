# UI/UX Design — Master Design System

> Phase 2. Builds on the theme split introduced in Phase 1A without
> contradicting it — this document replaces the Phase 1A sketch with a
> fully specified, implementable design system. See
> [`DESIGN_DECISIONS.md`](./DESIGN_DECISIONS.md) for how Phase 1A's
> theme rules were elaborated here.

## 0. Permanent Visual References

Two supplied reference screenshots are **mandatory, permanent**
inputs to every visual decision in this platform. They are not
suggestions to be reinterpreted later.

- **Reference A — Algorithm Graph Visualization:** deep black/navy
  canvas, subtle graph-paper grid, glowing cyan/purple nodes,
  glowing connected edges, clear distinction between unexplored,
  active, visited, evaluated, and pruned nodes, animated exploration
  of the *real* search tree (never decorative/fabricated nodes),
  left-side configuration panel, play/pause/prev/next/reset/speed
  controls, zoom/pan, node inspection.
- **Reference B — Premium Analytics Dashboard:** deep purple/violet
  gradient background, dark glassmorphism cards, violet/magenta
  accents, cyan/teal highlights, rounded cards with subtle glowing
  borders, premium typography, animated charts, smooth hover/transition
  states, responsive desktop/tablet/mobile.

No third, unrelated visual identity is introduced anywhere in this
platform.

## 1. Design Tokens

### 1.1 Color Palette

**Dashboard Theme (Reference B)**

| Token | Hex | Use |
|---|---|---|
| `bg.base` | `#130A21` | Page background base |
| `bg.gradientStart` | `#1A0B2E` | Gradient top |
| `bg.gradientEnd` | `#2D1B4E` | Gradient bottom |
| `surface.card` | `rgba(255,255,255,0.05)` | Glass card fill |
| `surface.cardBorder` | `rgba(255,255,255,0.08)` | Glass card border |
| `accent.violet` | `#8B5CF6` | Primary accent |
| `accent.magenta` | `#D946EF` | Secondary accent |
| `accent.cyan` | `#22D3EE` | Highlight / positive metric |
| `accent.teal` | `#2DD4BF` | Highlight / secondary positive |
| `state.success` | `#34D399` | Success |
| `state.warning` | `#FBBF24` | Warning |
| `state.error` | `#F87171` | Error |
| `text.primary` | `#F5F3FF` | Primary text on dark surfaces |
| `text.secondary` | `#C4B5FD` | Secondary/muted text |
| `text.tertiary` | `#8B7FB0` | Captions, placeholders |

**Graph Theme (Reference A)**

| Token | Hex | Use |
|---|---|---|
| `graph.bg` | `#05060C` | Canvas background |
| `graph.grid` | `#11142A` (12% opacity) | Graph-paper grid lines |
| `graph.node.max` | `#22D3EE` | MAX-player node base color |
| `graph.node.min` | `#A855F7` | MIN-player node base color |
| `graph.node.unexplored` | transparent fill, `#3F3F56` stroke | Not yet visited (frontier) |
| `graph.node.active` | role color + `#FACC15` pulse ring | Currently being evaluated |
| `graph.node.visited` | role color @ 70% opacity, solid | Entered and returned from |
| `graph.node.evaluated` | role color @ 100%, value badge | Terminal leaf, scored |
| `graph.node.pruned` | `#374151` @ 40%, dashed stroke, diagonal hatch | Subtree skipped |
| `graph.edge.default` | `#2A2D3A` | Unvisited edge |
| `graph.edge.activePath` | cyan→purple glow gradient | Edge on the path actually taken |

Node **state** (unexplored/active/visited/evaluated/pruned) and node
**role** (MAX/MIN) are independent dimensions: role sets hue, state
sets fill/opacity/border/pattern/badge, so pruned/active/etc. is never
conveyed by color alone (see §7 Accessibility).

### 1.2 Typography

- Display/headings: **Sora** (geometric, premium feel for titles, stat
  numbers, section headers).
- Body/UI text: **Inter** (high legibility at small sizes, used in
  cards, tables, forms, tooltips).
- Monospace accents (graph theme board/value readouts, node IDs,
  coordinates): **JetBrains Mono**.

| Scale | Size / Line-height | Weight | Use |
|---|---|---|---|
| `display` | 40px / 48px | 700 | Dashboard hero stat, page hero title |
| `h1` | 32px / 40px | 700 | Page title |
| `h2` | 24px / 32px | 600 | Section title |
| `h3` | 20px / 28px | 600 | Card title |
| `body` | 16px / 24px | 400 | Default body text |
| `bodySm` | 14px / 20px | 400 | Secondary text, table cells |
| `caption` | 12px / 16px | 500 | Labels, badges, timestamps |
| `mono` | 14px / 20px | 500 | Board state, node values, coordinates |

### 1.3 Spacing Scale

Base unit 4px: `4, 8, 12, 16, 24, 32, 48, 64, 96` px. Card internal
padding defaults to 24px desktop / 16px mobile; section gaps default
to 32px desktop / 24px mobile.

### 1.4 Radii

| Token | Value | Use |
|---|---|---|
| `radius.sm` | 8px | Graph-theme panels, inputs, badges |
| `radius.md` | 12px | Buttons, small cards |
| `radius.lg` | 16px | Dashboard cards |
| `radius.xl` | 24px | Hero/feature cards, modals |
| `radius.pill` | 999px | Tags, choice buttons (RPS), nav pills |

### 1.5 Shadows & Glow

| Token | Value | Use |
|---|---|---|
| `shadow.card` | `0 8px 32px rgba(139,92,246,0.15)` | Dashboard-theme card elevation |
| `glow.cardBorder` | `0 0 0 1px rgba(217,70,239,0.25), 0 0 24px rgba(217,70,239,0.08)` | Card border glow on hover |
| `glow.nodeActive` | `0 0 12px <role-color>, 0 0 24px <role-color> @ 40%` | Active/evaluated graph node |
| `glow.edgeActivePath` | `0 0 8px rgba(34,211,238,0.5)` | Active search path edge |

## 2. Theme Application Rule

- **Dashboard Theme** — Dashboard, both Game pages, RPS Strategy
  Matrix's matrix/probability panels, all three Insights pages, all
  four Learning pages.
- **Graph Theme** — Minimax Explorer, Alpha-Beta Explorer, Search Tree
  Lab, and the RPS Strategy Matrix's sequential-educational panel.

Both themes share the same type scale, spacing scale, icon set, motion
curves, and component shapes — only background treatment, color
tokens, and panel chrome differ, so the product reads as one system.
Full page-by-page assignment is in
[`PAGE_WIREFRAMES.md`](./PAGE_WIREFRAMES.md).

## 3. Global Navigation

```
Desktop (≥1024px):
┌─────────────┬──────────────────────────────────────────┐
│  Sidebar    │  Topbar: breadcrumb · search (Ctrl/Cmd+K) · settings │
│  (260px,    ├──────────────────────────────────────────┤
│  collapsible│                                            │
│  to 72px    │               Page content                │
│  icon rail) │                                            │
└─────────────┴──────────────────────────────────────────┘
```

- **Sidebar sections:** Dashboard · Games (Tic-Tac-Toe, Rock Paper
  Scissors) · Algorithm Labs (Minimax Explorer, Alpha-Beta Explorer,
  Search Tree Lab, RPS Strategy Matrix) · Insights (Algorithm
  Comparison, Performance Analytics, Simulation History) · Learning
  (Minimax Tutorial, Alpha-Beta Tutorial, RPS Game Theory, Interactive
  Viva Preparation).
- **Collapse toggle** persists per device (stored client-side).
- **Breadcrumbs** render for any page nested under a section, e.g.
  `Algorithm Labs / Minimax Explorer`.
- **Quick navigation:** `Ctrl/Cmd+K` opens a command palette that
  fuzzy-searches pages, lessons, and recent matches/simulations.
- **User settings** (gear icon, topbar): reduced-motion toggle, sound
  toggle, default AI difficulty/strategy preference, theme density
  (comfortable/compact).
- **Page transitions:** fade + 8px slide on route change, 150–200ms,
  respecting reduced-motion (see §7).

### Mobile Navigation (<768px)

```
┌───────────────────────────────┐
│  Topbar: ☰  Title       ⚙      │
├───────────────────────────────┤
│                                │
│          Page content         │
│                                │
├───────────────────────────────┤
│ 🏠 Dash │ 🎮 Games │ 🧠 Labs │ 📊 Insights │ 🎓 Learn │
└───────────────────────────────┘
```

Bottom tab bar covers the five top-level sections; each section's
sub-pages are reached via an in-page segmented control or a slide-up
sheet, not nested hamburger menus.

## 4. Global Components (summary)

Full responsibilities and conceptual props in
[`COMPONENT_INVENTORY.md`](./COMPONENT_INVENTORY.md). Visual contract
for the most common ones:

- **Button** — primary (gradient violet→magenta fill), secondary
  (outline, transparent fill), ghost (icon-only/nav). States: default,
  hover (brighten 8%, scale 1.02), focus-visible (2px cyan outline,
  2px offset), active/pressed (scale 0.98), disabled (40% opacity, no
  pointer events, `aria-disabled`).
- **Card** — dashboard theme: glass fill + border + `shadow.card`,
  hover lifts 2px and applies `glow.cardBorder`. Graph theme panels use
  flat `graph.bg`-tinted surfaces with a 1px `graph.grid`-colored
  border, no glass blur (keeps the canvas legible).
- **Modal** — centered, `radius.xl`, dims background with blurred
  scrim; focus is trapped inside; closes on `Esc` and scrim click.
- **Tooltip** — small dark surface, `radius.sm`, appears on hover/focus
  after 300ms, follows the trigger, dismissible via `Esc`.
- **Toast** — bottom-right (desktop) / bottom-center above tab bar
  (mobile), auto-dismiss 4s, pausable on hover/focus, always paired
  with an icon (✓ success, ⚠ warning, ⨯ error) not color alone.
- **Badge/Pill** — used for algorithm name tags, difficulty labels,
  and the mandatory **"Educational — Sequential Variant, Not Standard
  RPS"** label, which always renders in `state.warning` color *and*
  with a ⚠ icon and bold caption text, never relying on color alone.

## 5. State Patterns (Loading / Empty / Error / Success)

| State | Pattern |
|---|---|
| Loading | Skeleton shimmer for cards/lists; graph canvas shows a pulsing placeholder grid with the label "Running search…" until the first event arrives |
| Empty | Centered icon + one-line message + primary CTA, e.g. "No matches yet" + **Play Tic-Tac-Toe** button |
| Error | Inline banner, `state.error` color + ⨯ icon + human-readable message + **Retry** action; never a silent failure |
| Success | Inline confirmation or toast, `state.success` color + ✓ icon, e.g. "Lesson complete" |

These four patterns are reused verbatim across all 14 pages rather than
each page inventing its own — see `COMPONENT_INVENTORY.md` for the
shared `EmptyState` / `ErrorState` / `LoadingSkeleton` components.

## 6. Motion

- Standard transition: 150–200ms, ease-out, for hovers/route changes.
- Graph theme replay animation: event-by-event reveal, speed
  controlled by the Reference-A speed control (0.5×/1×/2×/4×).
- `prefers-reduced-motion: reduce` disables route-transition slide,
  card hover-lift, and the animated glow pulse on active nodes;
  state changes still occur, just instantly rather than animated (see
  §7).

## 7. Accessibility Requirements

- **Keyboard navigation:** full tab order sidebar → breadcrumb/search →
  page content → primary controls; no keyboard trap except intentional
  modal focus-trapping (which supports `Esc`).
- **Visible focus states:** 2px solid `accent.cyan` outline, 2px offset,
  on every interactive element in both themes (contrast-checked against
  both the violet dashboard background and the near-black graph
  background).
- **Contrast:** body text maintains ≥ 4.5:1 contrast against its
  background in both themes; decorative glow never substitutes for
  required text contrast.
- **Screen-reader labels:** Tic-Tac-Toe cells announce
  `"Cell 5 of 9, empty"` / `"Cell 5 of 9, occupied by X"`; RPS choice
  buttons announce `"Rock. Beats Scissors, loses to Paper."`; graph
  nodes announce role, state, and value, e.g. `"MAX node, evaluated,
  value 10"` / `"MIN node, pruned — alpha 10 ≥ beta -5"`.
- **Color-independent status:** every graph node state pairs its color
  with a distinct shape treatment (outline-only, pulse ring, solid,
  value badge, diagonal hatch) so the state is legible in grayscale.
- **Reduced motion:** honored platform-wide per §6.
- **Touch targets:** minimum 44×44px for all buttons, board cells, and
  RPS choice controls, including on dense desktop layouts.
- **Instructions and feedback:** every interactive page states what to
  do in visible text (not icon-only), and every action has a
  perceivable response within 100ms (even if the real result is still
  loading, e.g. optimistic UI + loading state).

## 8. Conflict Resolution Note

Phase 1A's `UI_UX_DESIGN.md` already established the two-theme split
and route table; this revision does not reverse any of those
decisions. It adds the node-state vocabulary (unexplored/active/
visited/evaluated/pruned) and graph-paper grid from Reference A, and
the concrete token values, typography, and component states needed to
actually build the system. See `DESIGN_DECISIONS.md` §1 for the full
rationale.
