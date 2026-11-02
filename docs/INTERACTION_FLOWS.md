# Interaction Flows

Two parts: (1) the ten required end-to-end user journeys, and (2)
element-level interaction specifications (initial/action/response/
loading/success/error/disabled) for the interactive elements those
journeys depend on.

## Part 1 — End-to-End User Journeys

### 1. Open the website and navigate to either game
1. User lands on **Dashboard** (default route `/`).
2. User clicks a **Quick Access** game card or a **Games** sidebar
   item.
3. Route transitions (fade+slide, §6 of `UI_UX_DESIGN.md`) to
   `/games/tic-tac-toe` or `/games/rps`.
4. Page loads with a fresh session (new game/match auto-created);
   loading state is a brief skeleton of the board/choice area if
   session creation hasn't returned yet.

### 2. Play a Tic-Tac-Toe match against AI
1. Human selects **Mode: Human vs AI**, **Algorithm**, **Difficulty**.
2. Human clicks an empty cell → optimistic fill with `X` → request to
   submit move.
3. On confirmation, turn indicator flips to AI; **AI thinking…**
   indicator appears.
4. AI move request fires automatically (no user action needed); on
   response, the chosen cell fills with `O` and the move appends to
   **Move History**.
5. Repeat until `check_terminal` returns a result → **Scoreboard**
   updates, winning line highlights, **Restart** becomes primary CTA.

### 3. Open the completed match in Minimax Explorer
1. From the finished Tic-Tac-Toe page, human clicks **"Open this
   position in Minimax Explorer."**
2. Route transitions to `/labs/minimax` with the final (or a selected
   historical) board position pre-loaded into the config panel.
3. Canvas shows a loading placeholder ("Running search…") while the
   backend computes/returns the recorded search-event log, then
   replays it via the transport controls.

### 4. Compare Minimax and Alpha-Beta on the same Tic-Tac-Toe position
1. From Minimax Explorer or the game page, human clicks **"Compare
   Minimax vs Alpha-Beta on this position."**
2. Route transitions to `/labs/search-tree` with the same position
   loaded into both panes.
3. Human uses the single shared step control; both canvases advance in
   sync; the inspection panel reports the node/pruning delta live.

### 5. Play an RPS match against AI
1. Human selects **Mode: Human vs AI**, **AI Strategy**, **Best of**.
2. Human clicks one of **Rock/Paper/Scissors**.
3. Button shows a brief "locked in" state while the AI's independently
   sampled choice resolves; both choices reveal simultaneously with a
   result animation (win/loss/tie, icon + text + color).
4. Scoreboard and match history update; if the best-of threshold is
   reached, a match-complete summary replaces the choice buttons with
   **Play Again** / **Change Settings**.

### 6. Inspect the RPS mixed-strategy distribution
1. From the RPS game page, human clicks **"Open RPS Strategy Matrix."**
2. Route transitions to `/labs/rps-strategy-matrix`.
3. Equilibrium bars render at `1/3` each by default (Nash strategy);
   switching the **Strategy selector** to `biased_fixed` or
   `pattern_adaptive` updates the bars and the expected-value readout
   to reflect that strategy's actual distribution, with a visible
   label clarifying it is no longer the equilibrium strategy.

### 7. Explore the RPS payoff matrix
1. On the same page, human hovers/focuses a matrix cell.
2. Tooltip explains the cell in plain language, e.g. `"You play Rock,
   opponent plays Scissors → you win (+1)."`
3. Human can toggle **"show as probabilities"** to overlay each cell's
   contribution to expected value under the current strategy.

### 8. Open the educational sequential RPS Alpha-Beta demonstration
1. Human clicks the clearly separated, warning-labeled panel: **⚠
   Educational — Sequential Variant, Not Standard RPS**.
2. Panel expands in place (or navigates to a dedicated sub-view) showing
   the graph-theme mini search tree for "Player 1 reveals first."
3. The label persists on-screen for the entire time this panel/view is
   open, including after any navigation within it.

### 9. Review match history
1. Human opens **Insights → Simulation History**.
2. List loads (or shows the empty state with CTAs if no history
   exists yet).
3. Human applies filters (game/algorithm/date); list updates in place
   with a brief loading skeleton.
4. Human clicks **Replay** on an entry → routes to the originating
   game page or Algorithm Lab, pre-loaded with that run's recorded
   data (never a re-simulation that could produce a different result).

### 10. Complete a learning lesson and attempt viva questions
1. Human opens a **Learning** tutorial, reads/interacts through its
   lessons, answering inline knowledge checks (immediate correct/
   incorrect feedback, retry allowed).
2. Completing all lessons marks the tutorial `✓` in the sidebar and
   updates **Learning Progress** on the Dashboard.
3. Human opens **Interactive Viva Preparation**, selects difficulty/
   topic, answers a free-text question, submits.
4. Model answer reveals with a cross-link to the relevant lab; session
   score increments; **Next Question** advances.

## Part 2 — Element-Level Interaction Specifications

### Tic-Tac-Toe board cell
| State | Behavior |
|---|---|
| Initial | Empty, `aria-label="Cell N of 9, empty"`, enabled if it's the human's turn and game is in progress |
| User action | Click/tap, or `Enter`/`Space` when focused |
| Response | Optimistic fill with current human symbol; request sent to backend |
| Loading | Cell shows a subtle pending shimmer until confirmed (typically <100ms) |
| Success | Fill persists; turn indicator and move history update |
| Error | Fill reverts, inline toast `"Move rejected — cell already taken"` (should be rare given client-side validation, but the server is the source of truth) |
| Disabled | Occupied cells, or any cell when it's the AI's turn or the game has ended (`aria-disabled="true"`, no pointer events) |

### AI move trigger (Tic-Tac-Toe)
| State | Behavior |
|---|---|
| Initial | Fires automatically when `current_player` becomes the AI — no user action required |
| Loading | **"AI thinking…"** indicator with animated dots; board remains read-only |
| Success | AI's cell fills; search metrics quietly cached for the "Open in Minimax Explorer" link |
| Error | Toast `"AI move failed — retrying"` with automatic single retry, then a manual **Retry** button if it fails again |

### RPS choice button (Rock/Paper/Scissors)
| State | Behavior |
|---|---|
| Initial | Three enabled buttons, equal size, `aria-label` includes what it beats/loses to |
| User action | Click/tap |
| Response | Selected button shows a "locked in" highlight; other two dim slightly |
| Loading | Brief (simulated network) delay while the AI's independent choice resolves |
| Success | Both choices reveal with result animation; scoreboard/history update |
| Error | Toast `"Round failed to resolve — try again"`; round is not scored, buttons re-enable |
| Disabled | All three while a round is resolving, or after match completion until **Play Again** |

### Algorithm / Difficulty / Strategy selectors
| State | Behavior |
|---|---|
| Initial | Defaults shown (e.g. Alpha-Beta Ordered / Hard / Nash Uniform) |
| User action | Open dropdown, select option |
| Response | Takes effect on the *next* AI move/round, not retroactively; a small note clarifies this if changed mid-game |
| Disabled | While an AI move/round is actively resolving |

### Search-tree transport controls (Play/Pause/Prev/Next/Reset, Speed)
| State | Behavior |
|---|---|
| Initial | Paused at step 0, full event log already fetched |
| Play | Auto-advances through events at selected speed; Play button becomes Pause |
| Pause | Freezes at current step |
| Prev/Next | Steps exactly one event; disabled at the first/last event respectively |
| Reset | Returns to step 0, canvas re-renders from empty |
| Speed | Changes playback rate only; has no effect on already-rendered steps |
| Loading | If the event log itself is still being fetched, all transport controls are disabled and show a loading placeholder instead of the canvas |

### Undo / Restart (Tic-Tac-Toe)
| State | Behavior |
|---|---|
| Undo | Enabled only when at least one move exists and it's not the AI's turn mid-think; reverts exactly one move (human's last, plus AI's reply if applicable, per product decision in `DESIGN_DECISIONS.md`) |
| Restart | Always enabled; confirms via a lightweight inline confirmation (not a blocking modal) before clearing the board |

### Lesson knowledge check
| State | Behavior |
|---|---|
| Initial | Options enabled, no selection |
| User action | Select an option, click **Check Answer** |
| Success | Correct: green check + brief explanation, **Next** enabled |
| Error | Incorrect: red state + hint text + **Try Again**, does not block re-attempting |

### Viva question submit
| State | Behavior |
|---|---|
| Initial | Empty free-text field, **Submit** disabled until non-empty |
| Loading | Submit shows a spinner while the model answer/comparison loads |
| Success | Model answer reveals below, session score updates, **Next Question** enabled |
| Error | Toast `"Couldn't load the model answer — try again"`, answer field retains the user's text |
