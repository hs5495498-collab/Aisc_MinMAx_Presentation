"""Core types for standard Rock Paper Scissors: actions, players, and
validated mixed strategies.

Standard Rock Paper Scissors is a **simultaneous-action**, one-shot,
zero-sum game — neither player observes the other's choice before
committing their own. That is fundamentally different from Tic-Tac-Toe's
alternating, perfect-information structure, which is why this module
has no "turn," no board, and no Minimax/Alpha-Beta anywhere in it. See
docs/RPS_STRATEGY_ENGINE.md §1 and docs/GAME_THEORY_DESIGN.md for the
full justification. The educational *sequential* variant that genuinely
can be solved with Alpha-Beta is explicitly out of scope for this
module — it belongs to Phase 11.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from enum import Enum
from typing import Mapping

from .exceptions import InvalidMixedStrategyError

#: Floating-point tolerance used throughout this engine for probability-sum
#: checks, best-response tie detection, and equilibrium verification. One
#: constant, documented once, reused everywhere — never a magic number
#: re-typed at each call site.
DEFAULT_TOLERANCE = 1e-9


class Action(str, Enum):
    """A single Rock Paper Scissors choice."""

    ROCK = "ROCK"
    PAPER = "PAPER"
    SCISSORS = "SCISSORS"


#: The canonical action ordering used everywhere a fixed order matters
#: (payoff matrix rows/columns, mixed-strategy probability tuples, ...).
ACTIONS: tuple[Action, Action, Action] = (Action.ROCK, Action.PAPER, Action.SCISSORS)


class Player(str, Enum):
    """Which side of the (symmetric, zero-sum) game a calculation is for."""

    A = "A"
    B = "B"

    def opponent(self) -> "Player":
        return Player.B if self is Player.A else Player.A


class RoundOutcome(str, Enum):
    """The result of resolving one round for a fixed pair of actions."""

    A_WINS = "A_WINS"
    B_WINS = "B_WINS"
    TIE = "TIE"


def _validate_probabilities(probabilities: Mapping[Action, float]) -> None:
    """Raise :class:`InvalidMixedStrategyError` if `probabilities` is not a
    valid probability distribution over exactly :data:`ACTIONS`.

    Deliberately strict and non-normalizing — see module docstring and
    :meth:`MixedStrategy.from_unnormalized` for the one explicit,
    documented exception to that rule.
    """
    if set(probabilities.keys()) != set(ACTIONS):
        raise InvalidMixedStrategyError(
            "wrong_actions",
            f"A mixed strategy must specify exactly the three actions {[a.value for a in ACTIONS]}; "
            f"got {[k.value for k in probabilities.keys()]}.",
        )

    for action, p in probabilities.items():
        if math.isnan(p):
            raise InvalidMixedStrategyError("not_finite", f"Probability for {action.value} is NaN.")
        if math.isinf(p):
            raise InvalidMixedStrategyError("not_finite", f"Probability for {action.value} is infinite.")
        if p < 0:
            raise InvalidMixedStrategyError(
                "negative_probability", f"Probability for {action.value} is negative ({p})."
            )

    total = sum(probabilities.values())
    if abs(total - 1.0) > DEFAULT_TOLERANCE:
        raise InvalidMixedStrategyError(
            "sum_mismatch",
            f"Probabilities must sum to 1 within tolerance {DEFAULT_TOLERANCE}; got sum={total}.",
        )


@dataclass(frozen=True)
class MixedStrategy:
    """A validated probability distribution over :data:`ACTIONS`.

    Construction always validates — there is no silent-success path for
    an invalid distribution. To build a strategy from numbers that don't
    already sum to 1, use :meth:`from_unnormalized` explicitly; the
    default constructor never normalizes on your behalf.
    """

    probabilities: Mapping[Action, float]

    def __post_init__(self) -> None:
        _validate_probabilities(self.probabilities)

    def probability(self, action: Action) -> float:
        return self.probabilities[action]

    def as_tuple(self) -> tuple[float, float, float]:
        """Probabilities in the canonical :data:`ACTIONS` order."""
        return tuple(self.probabilities[a] for a in ACTIONS)  # type: ignore[return-value]

    def support(self) -> tuple[Action, ...]:
        """Actions played with strictly positive probability."""
        return tuple(a for a in ACTIONS if self.probabilities[a] > 0)

    @classmethod
    def pure(cls, action: Action) -> "MixedStrategy":
        """A degenerate mixed strategy that always plays `action`."""
        return cls({a: (1.0 if a is action else 0.0) for a in ACTIONS})

    @classmethod
    def uniform(cls) -> "MixedStrategy":
        """The (1/3, 1/3, 1/3) strategy — see docs/RPS_STRATEGY_ENGINE.md
        for why this is the Nash equilibrium, derived (not assumed) in
        ``equilibrium.py``."""
        return cls({a: 1.0 / 3.0 for a in ACTIONS})

    @classmethod
    def from_mapping(cls, probabilities: Mapping[Action, float]) -> "MixedStrategy":
        """Explicit, validating constructor from a ``{Action: probability}`` mapping."""
        return cls(dict(probabilities))

    @classmethod
    def from_unnormalized(cls, weights: Mapping[Action, float]) -> "MixedStrategy":
        """Explicitly normalize non-negative `weights` into a valid strategy.

        This is the **only** place this engine ever silently adjusts
        numbers into validity — and it does so only because the caller
        asked for exactly that, by name. The default constructor and
        :meth:`from_mapping` never do this implicitly.
        """
        for action, w in weights.items():
            if math.isnan(w) or math.isinf(w) or w < 0:
                raise InvalidMixedStrategyError(
                    "invalid_weight", f"Weight for {action.value} must be a finite, non-negative number; got {w}."
                )
        total = sum(weights.values())
        if total <= 0:
            raise InvalidMixedStrategyError("zero_total_weight", "Weights must sum to a positive number.")
        return cls({a: weights[a] / total for a in ACTIONS})


__all__ = [
    "Action",
    "ACTIONS",
    "Player",
    "RoundOutcome",
    "MixedStrategy",
    "DEFAULT_TOLERANCE",
]
