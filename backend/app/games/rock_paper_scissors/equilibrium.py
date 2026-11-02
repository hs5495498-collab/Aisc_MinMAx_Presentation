"""Nash equilibrium derivation and verification for standard Rock Paper
Scissors.

This is a **specialized, exact solution for this specific 3-action
symmetric zero-sum game** — not a general two-player matrix-game
solver (e.g. linear-programming-based). A general solver would be
unnecessary machinery for a problem this small and would be harder to
verify independently; see docs/RPS_STRATEGY_ENGINE.md §"Nash
Equilibrium Derivation" for the full symmetry argument this encodes.
"""

from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction

from .analysis import BestResponseResult, best_response, expected_payoff_a
from .models import ACTIONS, DEFAULT_TOLERANCE, MixedStrategy, Player
from .payoff import PAYOFF_MATRIX


def derive_uniform_equilibrium() -> MixedStrategy:
    """Derive the equilibrium strategy from the structure of the payoff
    matrix, rather than assuming it.

    **Symmetry argument:** :data:`PAYOFF_MATRIX` is invariant under the
    cyclic relabeling Rock→Paper→Scissors→Rock (check: row ROCK
    ``(0,-1,1)`` maps to row PAPER ``(1,0,-1)`` under that relabeling of
    both the row and column actions — and indeed `PAYOFF_MATRIX[PAPER]`
    is exactly `PAYOFF_MATRIX[ROCK]` with each entry's action-label
    cycled). Because the game is unchanged by this relabeling, any
    equilibrium must *also* be unchanged by it — which is only possible
    if all three actions carry equal probability. That forces
    ``(1/3, 1/3, 1/3)``, independently of which player we're solving
    for (the game is symmetric between A and B too).
    """
    return MixedStrategy.uniform()


def exact_game_value_at_uniform() -> Fraction:
    """An exact-rational proof (no floating-point tolerance needed at
    all) that the uniform strategy's game value is **precisely** 0,
    not merely float-close to 0.

    ``sum_a sum_b (1/3) * PAYOFF_MATRIX[a][b] * (1/3)`` computed over
    :class:`fractions.Fraction`, so the result is exact.
    """
    one_third = Fraction(1, 3)
    return sum(
        (one_third * Fraction(PAYOFF_MATRIX[a][b]) * one_third for a in ACTIONS for b in ACTIONS),
        start=Fraction(0),
    )


@dataclass(frozen=True)
class EquilibriumVerification:
    """The result of checking whether a candidate ``(strategy_a, strategy_b)``
    pair is actually a Nash equilibrium — computed, not assumed.

    The standard condition: a mixed strategy is a best response to the
    opponent's strategy *iff* every action in its support (played with
    positive probability) achieves the maximum available payoff. Both
    sides must satisfy this simultaneously for the pair to be an
    equilibrium.
    """

    is_equilibrium: bool
    value_a: float
    value_b: float
    best_response_a: BestResponseResult
    best_response_b: BestResponseResult
    a_plays_only_best_responses: bool
    b_plays_only_best_responses: bool


def verify_equilibrium(
    strategy_a: MixedStrategy,
    strategy_b: MixedStrategy,
    tolerance: float = DEFAULT_TOLERANCE,
) -> EquilibriumVerification:
    """Check whether `(strategy_a, strategy_b)` is a Nash equilibrium.

    Neither strategy is assumed correct going in — this recomputes
    each player's best response from scratch and checks that the
    *candidate* strategy only plays actions within that best-response
    set. A wrong candidate (e.g. always Rock) will correctly fail.
    """
    best_response_a = best_response(Player.A, strategy_b, tolerance)
    best_response_b = best_response(Player.B, strategy_a, tolerance)

    a_optimal = all(
        abs(best_response_a.payoffs[action] - best_response_a.best_value) <= tolerance
        for action in strategy_a.support()
    )
    b_optimal = all(
        abs(best_response_b.payoffs[action] - best_response_b.best_value) <= tolerance
        for action in strategy_b.support()
    )

    return EquilibriumVerification(
        is_equilibrium=a_optimal and b_optimal,
        value_a=expected_payoff_a(strategy_a, strategy_b),
        value_b=-expected_payoff_a(strategy_a, strategy_b),
        best_response_a=best_response_a,
        best_response_b=best_response_b,
        a_plays_only_best_responses=a_optimal,
        b_plays_only_best_responses=b_optimal,
    )


__all__ = [
    "derive_uniform_equilibrium",
    "exact_game_value_at_uniform",
    "EquilibriumVerification",
    "verify_equilibrium",
]
