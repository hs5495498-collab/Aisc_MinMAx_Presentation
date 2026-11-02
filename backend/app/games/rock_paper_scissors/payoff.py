"""The standard Rock Paper Scissors payoff matrix and round resolution.

Convention: payoffs are from **Player A's** perspective, indexed
``PAYOFF_MATRIX[player_a_action][player_b_action]``. The game is
zero-sum, so Player B's payoff for the same pair is always the
negation of Player A's — enforced structurally here (``payoff_b`` is
defined *in terms of* ``payoff_a``, not as an independent table that
could drift out of sync).
"""

from __future__ import annotations

from .exceptions import InvalidActionError
from .models import Action, RoundOutcome

#: Player A's payoff for every (A's action, B's action) pair. Matches
#: docs/GAME_THEORY_DESIGN.md's table exactly: Rock beats Scissors,
#: Scissors beats Paper, Paper beats Rock.
PAYOFF_MATRIX: dict[Action, dict[Action, int]] = {
    Action.ROCK: {Action.ROCK: 0, Action.PAPER: -1, Action.SCISSORS: 1},
    Action.PAPER: {Action.ROCK: 1, Action.PAPER: 0, Action.SCISSORS: -1},
    Action.SCISSORS: {Action.ROCK: -1, Action.PAPER: 1, Action.SCISSORS: 0},
}


def _require_action(value: Action) -> None:
    if not isinstance(value, Action):
        raise InvalidActionError(value)


def payoff_a(action_a: Action, action_b: Action) -> int:
    """Player A's payoff when A plays `action_a` and B plays `action_b`."""
    _require_action(action_a)
    _require_action(action_b)
    return PAYOFF_MATRIX[action_a][action_b]


def payoff_b(action_a: Action, action_b: Action) -> int:
    """Player B's payoff for the same round — always ``-payoff_a(...)``,
    by construction, so the zero-sum property can never silently drift."""
    return -payoff_a(action_a, action_b)


def resolve_round(action_a: Action, action_b: Action) -> RoundOutcome:
    """Who wins a single round, derived from the sign of `payoff_a`."""
    value = payoff_a(action_a, action_b)
    if value > 0:
        return RoundOutcome.A_WINS
    if value < 0:
        return RoundOutcome.B_WINS
    return RoundOutcome.TIE


__all__ = ["PAYOFF_MATRIX", "payoff_a", "payoff_b", "resolve_round"]
