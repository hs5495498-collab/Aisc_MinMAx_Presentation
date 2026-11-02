"""Expected payoff, best response, and exploitability analysis.

Every function here is pure math over :class:`MixedStrategy` — a pure
strategy is simply the degenerate mixed strategy ``MixedStrategy.pure(a)``,
so "pure vs pure", "pure vs mixed", "mixed vs pure", and "mixed vs mixed"
all go through the **same** bilinear-form calculation
(:func:`expected_payoff_a`) rather than four separate, possibly-drifting
implementations.
"""

from __future__ import annotations

from dataclasses import dataclass

from .models import ACTIONS, DEFAULT_TOLERANCE, Action, MixedStrategy, Player
from .payoff import PAYOFF_MATRIX


def expected_payoff_a(strategy_a: MixedStrategy, strategy_b: MixedStrategy) -> float:
    """Player A's expected payoff: the bilinear form ``p^T A q``.

    ``p`` = `strategy_a`'s probabilities, ``A`` = :data:`PAYOFF_MATRIX`,
    ``q`` = `strategy_b`'s probabilities. A pure strategy is just
    ``MixedStrategy.pure(action)`` — no special-casing needed.
    """
    return sum(
        strategy_a.probability(a) * PAYOFF_MATRIX[a][b] * strategy_b.probability(b)
        for a in ACTIONS
        for b in ACTIONS
    )


def expected_payoff_b(strategy_a: MixedStrategy, strategy_b: MixedStrategy) -> float:
    """Player B's expected payoff for the same pair of strategies —
    always ``-expected_payoff_a(...)`` (zero-sum, enforced structurally)."""
    return -expected_payoff_a(strategy_a, strategy_b)


def expected_payoff(player: Player, strategy_a: MixedStrategy, strategy_b: MixedStrategy) -> float:
    """`player`'s expected payoff, dispatching to the matching function above."""
    return expected_payoff_a(strategy_a, strategy_b) if player is Player.A else expected_payoff_b(strategy_a, strategy_b)


@dataclass(frozen=True)
class BestResponseResult:
    """The outcome of computing one player's best response to a fixed
    opponent strategy.

    ``payoffs`` always has all three actions, even the non-optimal
    ones, so a caller can see *how much* worse an action would have
    been, not just which action(s) win.
    """

    player: Player
    payoffs: dict[Action, float]
    best_actions: tuple[Action, ...]

    @property
    def best_value(self) -> float:
        return max(self.payoffs.values())

    @property
    def is_tied(self) -> bool:
        return len(self.best_actions) > 1


def best_response(
    player: Player,
    opponent_strategy: MixedStrategy,
    tolerance: float = DEFAULT_TOLERANCE,
) -> BestResponseResult:
    """`player`'s best response(s) to a fixed `opponent_strategy`.

    Computes the expected payoff of every pure action `player` could
    play against `opponent_strategy`, then returns **every** action
    within `tolerance` of the maximum — a genuine tie is never broken
    arbitrarily; the full tied set is preserved in ``best_actions``.
    """
    if player is Player.A:
        payoffs = {a: expected_payoff_a(MixedStrategy.pure(a), opponent_strategy) for a in ACTIONS}
    else:
        payoffs = {b: expected_payoff_b(opponent_strategy, MixedStrategy.pure(b)) for b in ACTIONS}

    best_value = max(payoffs.values())
    best_actions = tuple(a for a in ACTIONS if abs(payoffs[a] - best_value) <= tolerance)
    return BestResponseResult(player=player, payoffs=payoffs, best_actions=best_actions)


@dataclass(frozen=True)
class ExploitabilityResult:
    """How much the opponent can profit, in expectation, by best-responding
    to a fixed strategy — see docs/RPS_STRATEGY_ENGINE.md §"Exploitability"
    for the precise sign convention this implements.
    """

    exploited_player: Player
    exploitability: float
    opponent_best_response: BestResponseResult


#: The game's value at equilibrium, for either player (zero-sum and
#: symmetric, so both are 0). Exploitability is measured relative to
#: this, never to an arbitrary or implicit baseline.
EQUILIBRIUM_GAME_VALUE = 0.0


def exploitability(
    strategy: MixedStrategy,
    player: Player = Player.A,
    tolerance: float = DEFAULT_TOLERANCE,
) -> ExploitabilityResult:
    """How exploitable `strategy` is, if played by `player`.

    Defined as: the best expected payoff `player`'s opponent can
    guarantee by best-responding to `strategy`, minus the equilibrium
    game value (0). This is always **non-negative** — the opponent can
    always guarantee at least 0 by playing the uniform strategy
    themselves (every row/column of :data:`PAYOFF_MATRIX` sums to 0,
    so uniform play earns exactly 0 against *any* fixed opponent
    strategy) — so best-responding can never do worse than 0, and does
    strictly better than 0 exactly when `strategy` is exploitable.
    A result of 0 (within `tolerance`) means `strategy` cannot be
    profitably exploited; a positive result is the opponent's
    per-round expected profit from exploiting it.
    """
    opponent = player.opponent()
    response = best_response(opponent, strategy, tolerance)
    return ExploitabilityResult(
        exploited_player=player,
        exploitability=response.best_value - EQUILIBRIUM_GAME_VALUE,
        opponent_best_response=response,
    )


__all__ = [
    "expected_payoff_a",
    "expected_payoff_b",
    "expected_payoff",
    "BestResponseResult",
    "best_response",
    "ExploitabilityResult",
    "EQUILIBRIUM_GAME_VALUE",
    "exploitability",
]
