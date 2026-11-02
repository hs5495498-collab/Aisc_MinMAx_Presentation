"""Typed exceptions for the Rock Paper Scissors strategy engine."""

from __future__ import annotations


class RPSError(Exception):
    """Base class for all Rock Paper Scissors engine errors."""


class InvalidActionError(RPSError):
    """Raised when something that isn't a valid :class:`Action` is used."""

    def __init__(self, value: object) -> None:
        self.value = value
        super().__init__(f"{value!r} is not a valid RPS action (expected ROCK, PAPER, or SCISSORS).")


class InvalidMixedStrategyError(RPSError):
    """Raised when a candidate mixed strategy fails validation.

    ``reason`` is a short machine-checkable code so callers (and tests)
    can assert *which* rule was violated, not just that validation failed.
    """

    def __init__(self, reason: str, detail: str) -> None:
        self.reason = reason
        super().__init__(detail)


class MatchError(RPSError):
    """Base class for Phase 9 match/session engine errors (``match.py``)."""


class InvalidMatchConfigError(MatchError):
    """Raised when a :class:`~.match.MatchConfig` is invalid (bad ``best_of``,
    missing custom-strategy probabilities, etc.)."""

    def __init__(self, detail: str) -> None:
        super().__init__(detail)


class MatchAlreadyCompleteError(MatchError):
    """Raised when an action is attempted on a match that has already
    reached its win threshold — a completed match accepts no further moves."""

    def __init__(self) -> None:
        super().__init__("This match is already complete; it cannot accept further moves.")


class MoveAlreadyLockedError(MatchError):
    """Raised when the player tries to lock a second move for the same
    round before the first has been resolved — prevents double submission."""

    def __init__(self) -> None:
        super().__init__(
            "A player move is already locked for this round; resolve it before locking another."
        )


class NoPendingMoveError(MatchError):
    """Raised when ``resolve_pending_round()`` is called with no move
    locked — prevents resolving a round (and sampling an AI action) with
    nothing to resolve, and prevents resolving the same round twice."""

    def __init__(self) -> None:
        super().__init__("No player move is locked for this round; call lock_player_move() first.")
