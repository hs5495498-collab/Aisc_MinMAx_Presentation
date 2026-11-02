# Responsive Design

## Breakpoints

| Name | Width | Primary layout |
|---|---|---|
| `mobile` | < 768px | Single column, bottom tab bar, bottom sheets |
| `tablet` | 768px – 1023px | Condensed sidebar (icon rail) or collapsible drawer, mostly single/two-column content |
| `desktop` | ≥ 1024px | Full sidebar, multi-column content, side panels |
| `wide` | ≥ 1440px | Same as desktop with a capped max content width (1280px) to avoid overly long lines/charts |

Layout decisions below are expressed relative to these four bands.

## Global Navigation Behavior

| Breakpoint | Behavior |
|---|---|
| Desktop/Wide | Fixed left sidebar (260px), collapsible to a 72px icon rail; topbar with breadcrumb + search + settings |
| Tablet | Sidebar defaults to the 72px icon rail; tapping expands it as a temporary overlay drawer |
| Mobile | Sidebar replaced entirely by the bottom tab bar (5 top-level sections) + topbar with hamburger for rare overflow actions (none currently planned beyond settings) |

## Algorithm Graph Visualizations — Special Handling

Graph pages (Minimax Explorer, Alpha-Beta Explorer, Search Tree Lab,
and the RPS Strategy Matrix's sequential panel) **do not simply shrink**
the desktop three-pane layout. Mobile uses a purpose-built interaction
model:

```
Mobile graph workspace:
┌───────────────────────────────┐
│ [⚙ Config]  [📊 Stats]  [↺]    │  ← icon buttons open bottom sheets
├───────────────────────────────┤
│                                 │
│     Full-viewport graph canvas │  ← dedicated viewport, touch zoom/pan
│     (pinch zoom, drag pan)      │
│                                 │
├───────────────────────────────┤
│ ▶ ⏸ ⏮ ⏭          Speed: 1x ▾   │  ← sticky transport bar
└───────────────────────────────┘

Tap a node → bottom sheet slides up:
┌───────────────────────────────┐
│ Node n_17 — MIN, evaluated     │
│ Value: -5   Alpha: 10  Beta:-5 │
│ [Close]                         │
└───────────────────────────────┘
```

- **Dedicated graph viewport:** the canvas takes the full width and
  most of the viewport height; it is never letterboxed inside a small
  fixed-size box.
- **Collapsible configuration panel:** becomes a bottom sheet opened by
  a toolbar icon, not a persistent column — reclaims width for the
  canvas.
- **Horizontally accessible statistics:** the stats panel becomes a
  horizontally scrollable strip of stat chips (Nodes, Pruned, Time)
  reachable via the same toolbar icon or a swipe-up peek, rather than a
  fixed sidebar.
- **Touch-friendly zoom/pan:** pinch-to-zoom and single-finger pan are
  native canvas gestures; a `+`/`−`/fit-to-screen control is also
  present for accessibility (not everyone can pinch reliably).
- **Bottom-sheet node details:** tapping a node opens a bottom sheet
  (not a tooltip, which is unreliable on touch) with the same content
  as the desktop Node Detail Panel.
- **Transport controls** remain a sticky bar at the bottom, always
  visible, since stepping through the search is the primary mobile
  interaction.

## Per-Page Responsive Summary

| Page | Desktop | Tablet | Mobile |
|---|---|---|---|
| 1. Dashboard | 3-up quick-access cards, 2-column summary/shortcuts, 2-column activity/progress | Quick-access cards wrap to 2-up; summary sections stack | Quick-access cards become a horizontal swipe row; all sections stack single-column |
| 2. Tic-Tac-Toe | Board + side panel (turn/score/history) side by side | Same, panel narrows | Board centered full-width; turn/score/history stack below; AI-thinking indicator becomes a sticky top banner |
| 3. Rock Paper Scissors | Choice buttons centered row + 2-column history/explainer | Same, narrower columns | Choice buttons fill width as a single row of large touch targets; history/explainer stack |
| 4. Minimax Explorer | 3-pane (config / canvas / node detail) | Node detail panel becomes a collapsible right drawer | Graph-workspace mobile pattern above |
| 5. Alpha-Beta Explorer | Same 3-pane pattern + ordering toggle | Same as tablet Minimax Explorer | Graph-workspace mobile pattern; ordering toggle pinned at top of config sheet |
| 6. Search Tree Lab | Side-by-side dual canvas + shared controls | Dual canvas narrows, still side by side down to ~900px | Dual canvas stacks vertically; shared sticky step-control bar between the two |
| 7. RPS Strategy Matrix | Matrix + equilibrium 2-column, separated educational panel below | Same, narrower | Matrix and equilibrium bars stack; educational panel stays visually boxed/labeled at full width |
| 8. Algorithm Comparison | 2x2 chart grid + methodology note | 2-column, 2 rows | Single scrollable column; methodology note pinned after first chart |
| 9. Performance Analytics | 2x2 chart grid + table | 2-column charts, full-width table | Single column charts; table becomes stacked cards |
| 10. Simulation History | Filter row + list | Same | Filters collapse into one "Filters" button opening a bottom sheet; list stays single-column |
| 11. Minimax Tutorial | Lesson-nav column + content column | Narrower columns | Lesson nav becomes a horizontal swipeable stepper above content |
| 12. Alpha-Beta Tutorial | Same as Minimax Tutorial | Same | Same |
| 13. RPS Game Theory Tutorial | Same, plus side-by-side RPS/TTT comparison in Lesson 1 | Comparison narrows | Comparison stacks vertically; rest same as other tutorials |
| 14. Interactive Viva Preparation | Filter row + single question card, capped max-width | Same | Filters collapse to stacked dropdowns; question/answer card keeps capped line length even at full width |

## Testing Checklist (for implementation phases, not this phase)

- All interactive targets ≥ 44×44px at `mobile`.
- No horizontal page-level scroll at any breakpoint (graph canvases
  scroll/pan internally by design; the page shell does not).
- Bottom sheets and the bottom tab bar never overlap (sheets must
  respect the tab bar's reserved height, or temporarily hide it while
  open).
