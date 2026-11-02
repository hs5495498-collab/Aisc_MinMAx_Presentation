# RPS Strategy Visualization and Interactive Game Theory Lab (Phase 10)

An interactive workspace for the Phase 8 game-theory engine
(`docs/RPS_STRATEGY_ENGINE.md`): the payoff matrix, mixed strategies,
expected payoff, best response, Nash equilibrium, and exploitability —
all computed live from whatever probabilities the player enters, never
decorative or hardcoded to simulate interaction. Route:
`/labs/rps-matrix` (`frontend/src/features/algorithm-labs/rps-matrix/RPSMatrixPage.tsx`).
Frontend math layer: `frontend/src/lib/rpsGameTheory.ts`. Components:
`frontend/src/components/rps/strategy-lab/`.

## 0. Scope Boundary

This phase is the **visualization and exploration layer only**. It
does not add any new game-theory mathematics to the backend — Phase 8
(`backend/app/games/rock_paper_scissors/{payoff.py,models.py,analysis.py,
equilibrium.py}`) remains the sole mathematical source of truth, and
this phase found no defect in it to report. Also explicitly not built
here: the sequential RPS Minimax/Alpha-Beta educational variant (Phase
11 — the pre-existing `EducationalVariantBanner` placeholder at the
bottom of this page is unchanged from Phase 3, not new work), any
FastAPI endpoint, database persistence, authentication, new gameplay
or match logic (Phase 9's `RPSMatchEngine` is untouched), and any
change to the algorithm-comparison dashboard.

## 1. Why a Frontend Calculation Layer, Again

No backend API exists yet (Phase 12), so — exactly as Phase 9 did for
match logic — this phase ports the relevant Phase 8 math into
TypeScript rather than pretending the browser calls Python directly.
`frontend/src/lib/rpsGameTheory.ts` is that port: the same bilinear
expected-payoff formula, the same best-response and exploitability
definitions (including sign convention), the same tolerance, built on
top of the *existing* `frontend/src/lib/rpsEngine.ts` (Phase 9) rather
than introducing a second, disconnected payoff table — `rpsEngine.ts`'s
`PAYOFF_MATRIX` was exported and is imported here unchanged, and
`validateProbabilities`/`DEFAULT_TOLERANCE`/`InvalidMixedStrategyError`
are reused as-is. **There is still only one game-theory engine in this
project** (Phase 8's Python code); this module and `rpsEngine.ts` are
both verified mirrors of it, not a second, independent implementation.

Every page built on this module is labeled a frontend demonstration
(the banner at the top of `RPSMatrixPage.tsx`) for the same reason
Phase 9's gameplay page is: until Phase 12 connects a real API, this
is the only way for the browser to compute anything interactively.

### 1.1 Python/TypeScript Parity Verification

`frontend/src/lib/rpsGameTheory.test.ts` includes a dedicated
"Python/TypeScript parity" suite whose expected values were generated
by running the actual backend engine, not derived independently:

```bash
cd backend
python -c "
from app.games.rock_paper_scissors import Action, Player, MixedStrategy
from app.games.rock_paper_scissors.analysis import expected_payoff_a, expected_payoff_b, best_response, exploitability
from app.games.rock_paper_scissors.equilibrium import verify_equilibrium

a = MixedStrategy.from_mapping({Action.ROCK: 0.2, Action.PAPER: 0.3, Action.SCISSORS: 0.5})
b = MixedStrategy.from_mapping({Action.ROCK: 0.5, Action.PAPER: 0.1, Action.SCISSORS: 0.4})
print(expected_payoff_a(a, b), expected_payoff_b(a, b))

biased = MixedStrategy.from_mapping({Action.ROCK: 0.6, Action.PAPER: 0.2, Action.SCISSORS: 0.2})
print(exploitability(biased, Player.A).exploitability)
print([x.value for x in best_response(Player.A, biased).best_actions])

v = verify_equilibrium(MixedStrategy.pure(Action.ROCK), MixedStrategy.uniform())
print(v.is_equilibrium, v.a_plays_only_best_responses, v.b_plays_only_best_responses)
"
```

The TypeScript test asserts the exact same numbers
(`expectedPayoffA(0.2/0.3/0.5, 0.5/0.1/0.4) === -0.10999999999999999`,
`exploitability(0.6/0.2/0.2, 'A') === 0.39999999999999997`, best
response `['PAPER']`, and the equilibrium-verification split verdict
— `isEquilibrium: false` with `aPlaysOnlyBestResponses: true` but
`bPlaysOnlyBestResponses: false`, a genuinely subtle case worth calling
out: Player A's pure Rock happens to *tie* for best response against a
uniform Player B, since every pure action ties at 0 there, but Player
B's uniform play is not itself optimal against A's pure Rock). The
general correctness suite (all 9 round outcomes, zero-sum property,
the hand-calculated -0.25/+0.25 example from
`docs/RPS_STRATEGY_ENGINE.md` §3, tied best responses against uniform,
non-negative exploitability) is cross-checked the same way the
existing `test_analysis.py`/`test_equilibrium.py` suites are
structured, just reproduced in TypeScript.

## 2. Page Architecture: Six Tabs, One Shared State

`RPSMatrixPage.tsx` uses a small accessible `Tabs` component
(`components/ui/Tabs.tsx` — new, generic, standard `<button>`s with
`role="tab"`/`aria-selected`, so keyboard focus and activation work
with no extra handling) to split the lab into six sections, so the
page is never one enormous scroll:

1. **Payoff Matrix** — `InteractivePayoffMatrix`.
2. **Mixed Strategy Explorer** — `MixedStrategyExplorer`.
3. **Expected Payoff Calculator** — `ExpectedPayoffCalculator`.
4. **Best Response Lab** — `BestResponseLab`.
5. **Nash Equilibrium Explorer** — `NashEquilibriumExplorer`.
6. **Exploitability Demonstration** — `ExploitabilityDemonstration`.

Tabs 2-4 share **one** pair of Player A / Player B mixed-strategy
slots, lifted into `frontend/src/hooks/useRpsStrategyLab.ts` and passed
down as props. Editing a probability in the Mixed Strategy Explorer
tab is immediately visible in the Expected Payoff Calculator and Best
Response Lab tabs (and vice versa — those tabs can edit the same
state too) because they all read and write the same React state, not
independent copies. The Nash Equilibrium Explorer and Exploitability
Demonstration tabs are deliberately self-contained instead: their
purpose is to walk through specific named scenarios (four equilibrium
comparisons; four preset strategies) side by side, which reads more
clearly as dedicated local state than as edits to the shared pair.

## 3. Interactive Payoff Matrix

`InteractivePayoffMatrix` renders `PAYOFF_MATRIX` (imported, not
re-typed) as a 3×3 grid: Player A's actions as rows, Player B's as
columns, always — switching the perspective toggle (Player
A / Player B) only changes which side's payoff number is displayed and
color-coded (win/loss/tie), computed as `perspective === 'A' ?
PAYOFF_MATRIX[a][b] : -PAYOFF_MATRIX[a][b]`; it never changes the
table or the row/column convention. Every cell is a real `<button>`
(keyboard-focusable; Enter/Space select it with no extra handling);
hovering or focusing previews a cell's explanation, clicking pins it.
The explanation panel below names the action combination, states the
outcome (win/loss/tie, and for a win, which action beat which), and
always shows both players' payoffs together with the zero-sum
reminder that Player B's payoff is `-PAYOFF_MATRIX[a][b]`.

## 4. Mixed Strategy Explorer

`ProbabilityInputGroup` (shared by multiple tabs) gives each player a
slider **and** a numeric input per action, plus a probability bar,
"Reset to uniform," and an explicit "Normalize to sum 1" action.

Validation rules (identical to Phase 8's `MixedStrategy`, reused via
`rpsEngine.ts`'s `validateProbabilities`): every probability must be
finite and non-negative, and the three must sum to 1 within
`DEFAULT_TOLERANCE = 1e-9`. Critically, **this editor never silently
rescales an invalid entry** — typing a Rock probability that pushes
the sum away from 1 is displayed exactly as typed, with a visible
`role="alert"` validation message (`useRpsStrategyLab.ts`'s
`useStrategySlot` validates on every change but never auto-corrects).
The only two ways to reach a valid state again are fixing the numbers
directly, "Reset to uniform," or the explicit "Normalize to sum 1"
action (`rpsGameTheory.ts::normalizeWeights`, itself a mirror of
`MixedStrategy.from_unnormalized` — the one explicitly-named,
opt-in-only normalization path in the whole system). Every tab that
depends on a strategy being valid (Expected Payoff Calculator, Best
Response Lab) shows a plain "fix the invalid distribution" message
instead of computing nonsense from an invalid distribution.

## 5. Expected Payoff Calculator

Computes `U(p, q) = pᵀ A q` live from the shared Player A/B state via
`expectedPayoffA`/`expectedPayoffB`, and additionally
`expectedPayoffContributions`, which breaks the same sum into its 9
additive terms (`P(a)·P(b) · PAYOFF_MATRIX[a][b]`) so the player can
see *where* the number comes from, not just the final value — the sum
of every `contributionA` reproduces `expectedPayoffA` exactly
(asserted in `rpsGameTheory.test.ts`). Displays Player A's and Player
B's expected payoff side by side with their sum (always 0, the
zero-sum check), a bar chart of the 9 contributions
(`ComparisonBarChart`, real computed data), and a full breakdown
table. Preset buttons ("Load uniform equilibrium," pure Rock/Paper/
Scissors, the Phase 8 biased-demo distribution) and a "Load this
worked example" button reproduce the exact -0.25/+0.25 hand-calculated
example from `docs/RPS_STRATEGY_ENGINE.md` §3 live in the calculator.

## 6. Best Response Lab

`BestResponseLab` computes both directions from the same shared state:
Player A's best response to Player B's current strategy, and Player
B's best response to Player A's, via `rpsGameTheory.ts::bestResponse`
— a direct mirror of `analysis.py::best_response`, including exact
tie preservation (`bestActions` can hold more than one action; a
genuine tie, such as any strategy's best response to the uniform
distribution, is never arbitrarily resolved to one action). Each
direction shows the opponent's distribution, a bar chart of all three
pure-action expected payoffs with the best (or tied) ones highlighted,
and the resulting best-response text.

## 7. Nash Equilibrium Explorer

Shows the derived uniform equilibrium
(`rpsGameTheory.ts::deriveUniformEquilibrium`, same value as
`uniformStrategy()` — the derivation is the *justification*, not a
different number) and its expected payoff (exactly 0), then lets the
player compare four named scenarios: both players uniform; Player A
deviates (a single "bias toward Rock" slider) while B stays uniform;
the symmetric case for B; and both players using the Phase 8
biased-demo distribution. `verifyEquilibrium` (mirroring
`equilibrium.py::verify_equilibrium`) reports whether each scenario is
actually a Nash equilibrium.

The one-sided deviation scenarios demonstrate a real, provable fact
about this payoff matrix rather than an illustrative approximation:
**every row and every column of `PAYOFF_MATRIX` sums to exactly 0**, so
`expectedPayoffA(anyStrategy, uniform)` is mathematically always 0,
and the symmetric statement holds for B. The UI shows this live — no
matter how far the slider pushes the deviation, the resulting expected
payoff against a uniform opponent stays exactly 0 — and explains that
this is *why* unilateral deviation never improves expected payoff
against the equilibrium: it's not that the deviating action happens to
tie, it's that nothing can beat uniform play in expectation. The page
is explicit that this describes strategic **stability**, not a
guarantee of winning any individual round, and separately notes that a
one-sided deviation *does* create exploitability if the opponent later
adapts — covered concretely in the next tab.

## 8. Exploitability Demonstration

Uses `rpsGameTheory.ts::exploitability` exactly as
`analysis.py::exploitability` defines it: the best expected payoff the
*opponent* can guarantee by best-responding to the analyzed strategy,
minus the equilibrium game value (0) — never a different definition,
and never shown as negative (`EQUILIBRIUM_GAME_VALUE = 0` is the only
baseline used; the result is non-negative by construction, since the
opponent can always guarantee at least 0 by playing uniform). Four
presets demonstrate this concretely: Uniform (exploitability exactly
0 — not exploitable), Always Rock (exploitability exactly 1, opponent
best response Paper), the Phase 8 biased-demo distribution
(exploitability computed live, not hardcoded, and positive), and a
free-form Custom option reusing the same `ProbabilityInputGroup`
validation. A bar chart shows the opponent's expected payoff for each
of their three pure actions with the best-responding one highlighted
— directly demonstrating that the opponent's best response is, by
definition, their highest available expected payoff against that
specific strategy.

## 9. Charts

`components/charts/ComparisonBarChart.tsx` is a new, generic Recharts
bar chart (styled like the existing `DemoBarChart.tsx`, but taking
real `{name, value, highlighted?}` data rather than sample data) used
for the expected-payoff contribution breakdown, both Best Response
Lab panels, and the Exploitability Demonstration's per-action payoff
chart. Every value charted is the live output of `rpsGameTheory.ts`
for whatever distribution the player currently has entered — nothing
is hardcoded to simulate an interaction. Each chart has labeled axes,
a value-formatted tooltip, and an explicit empty state ("No data to
display yet") for the (currently unreachable, since both tabs gate on
`bothValid` first) case of an empty dataset.

## 10. Accessibility

- Every interactive control is a native `<button>`, `<input>`,
  `<select>`, or `role="radio"`/`role="tab"` element — all
  keyboard-focusable and activatable with Enter/Space with no custom
  key handling needed.
- Every probability slider has a paired numeric input, so no value is
  only settable by imprecise pointer dragging, and both carry explicit
  `aria-label`s distinguishing player, action, and whether it's the
  slider or the exact-value field.
- Payoff-matrix cells use `aria-label` (not just color) to state the
  full outcome; win/loss/tie are additionally distinguished by text
  (`+1`/`-1`/`0`) and position, not color alone.
- Validation messages use `role="alert"`, and the live explanation
  panel in the Payoff Matrix tab uses `aria-live="polite"`.
- The page uses the existing dashboard theme and responsive container
  (`PageContainer`, `Card`) rather than the graph-paper canvas; the tab
  strip wraps and scrolls horizontally rather than overflowing the
  viewport at narrow widths, and every panel is a single-column stack
  on small screens (Tailwind's default stacking for `grid`/`flex`
  without an explicit breakpoint override, consistent with the rest of
  the dashboard-theme pages).

## 11. Testing

**Frontend math layer** — `frontend/src/lib/rpsGameTheory.test.ts`
(**38 tests**): all 9 pure-vs-pure outcomes, the zero-sum property,
the hand-calculated -0.25/+0.25 example, best response to each pure
action and to uniform (including the 3-way tie), equilibrium
verification (uniform-vs-uniform, "always Rock" rejected, the
asymmetric split-verdict case), exploitability (uniform is 0, always
Rock is exactly 1, a biased strategy is positive, never negative for a
range of strategies), explicit normalization (rescales correctly,
rejects negative/zero-total/non-finite weights), and the
Python-cross-checked parity assertions in §1.1.

**Components** (`frontend/src/components/rps/strategy-lab/*.test.tsx`):
`InteractivePayoffMatrix` (all 9 cells' labels, perspective switch,
cell-click and tie explanations), `MixedStrategyExplorer` (uniform
default, valid pure strategy, invalid-sum/negative/non-finite
rejection with visible alerts, reset, explicit normalize),
`BestResponseLab` (tied response at uniform, response updates live
when the shared strategy changes, invalid-state warning),
`NashEquilibriumExplorer` (uniform-equilibrium baseline, the
exactly-zero-payoff deviation demonstration, the "not a Nash
equilibrium" verdict, a real non-hardcoded biased-vs-biased value, the
stability-not-guaranteed-wins explanation), `ExploitabilityDemonstration`
(uniform not exploitable, Always Rock exploitable with Paper as the
response, biased demo exploitable, never-negative check, player
switch, custom validation).

**Integration** — `frontend/src/features/algorithm-labs/rps-matrix/RPSMatrixPage.test.tsx`
(**8 tests**): page renders with all six tabs, default tab, tab
navigation, a strategy edit in one tab being visible in another
(proving the shared state actually flows through), an invalid state
surfacing in a dependent tab, "Reset to uniform" clearing that invalid
state everywhere, the pre-existing mandatory
`EducationalVariantBanner` label still present, and the frontend-demo
disclosure badge.

Run with:

```bash
cd frontend
npx vitest run src/lib/rpsGameTheory.test.ts
npx vitest run src/components/rps/strategy-lab/
npx vitest run src/features/algorithm-labs/rps-matrix/
npx vitest run                                   # full frontend suite
```

Full frontend suite after this phase: **164 passed** (82 prior + 38
math-layer + 44 new component/integration tests), 0 failed. No
existing test was removed or weakened; `App.test.tsx`'s pre-existing
assertion on the mandatory sequential-variant banner still passes
unchanged.

## 12. Phase 12 API Integration Boundary (specified, not built here)

Identical pattern to `docs/RPS_GAMEPLAY.md` §6: when a FastAPI layer
exists, this page would call a stateless analysis endpoint instead of
`rpsGameTheory.ts`, with the same request/response shapes already
defined by the Python types in Phase 8:

```
POST /api/v1/rps/analysis/expected-payoff
  body: { strategyA: ProbabilityTriple, strategyB: ProbabilityTriple }
  response: { payoffA: number, payoffB: number }

POST /api/v1/rps/analysis/best-response
  body: { player: "A" | "B", opponentStrategy: ProbabilityTriple }
  response: BestResponseResult   # { player, payoffs, bestActions }

POST /api/v1/rps/analysis/exploitability
  body: { strategy: ProbabilityTriple, player: "A" | "B" }
  response: ExploitabilityResult
```

Each handler would call exactly the existing `analysis.py`/
`equilibrium.py` functions this phase already mirrors — no new
backend math would be needed, only the transport layer.

## 13. Known Limitations

- This page is a frontend demonstration pending Phase 12; it computes
  nothing the Python engine wouldn't, but does not call it directly.
- Mobile-layout correctness is verified by code review and the
  existing responsive patterns (stacking grids, horizontally-scrolling
  tab strip, no fixed pixel widths) rather than an automated viewport
  test — jsdom (used by the Vitest suite) does not lay out CSS media
  queries or flex-wrap the way a real mobile browser does, so there is
  no automated assertion that nothing overflows at narrow widths.
- The Nash Equilibrium Explorer's one-sided "deviation" control only
  biases toward Rock (keeping Paper and Scissors equal) rather than
  exposing a full 3-probability editor for that scenario — a
  deliberate simplification to keep the control to one slider; the
  Mixed Strategy Explorer tab already provides the full 3-probability
  editor for free-form exploration.
- `ProbabilityInputGroup` does not auto-rebalance the other two
  sliders when one changes — this is intentional (see §4), so that
  invalid intermediate states are directly visible and correctable,
  but it means reaching a new valid 3-way split by slider alone
  requires adjusting more than one control.
