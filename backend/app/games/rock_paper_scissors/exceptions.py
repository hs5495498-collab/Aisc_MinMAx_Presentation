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
