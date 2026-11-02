"""Typed exceptions raised by the Tic-Tac-Toe engine.

All engine errors inherit from :class:`TicTacToeError`, so callers that
want to catch "any engine rule violation" can do so with one except
clause, while still being able to catch a specific failure mode when
they need to react differently to it.
"""

from __future__ import annotations

from .models import GameStatus, Mark


class TicTacToeError(Exception):
    """Base class for all Tic-Tac-Toe engine errors."""


class InvalidPositionError(TicTacToeError):
    """Raised when a row or column is outside the 0-2 board range."""

    def __init__(self, row: int, col: int) -> None:
        self.row = row
        self.col = col
        super().__init__(
            f"Position (row={row}, col={col}) is outside the 3x3 board; "
            "both row and col must be in range 0-2."
        )


class OccupiedCellError(TicTacToeError):
    """Raised when a move targets a cell that is already occupied."""

    def __init__(self, row: int, col: int) -> None:
        self.row = row
        self.col = col
        super().__init__(f"Cell (row={row}, col={col}) is already occupied.")


class WrongPlayerError(TicTacToeError):
    """Raised when the caller explicitly names a player who is not up to move."""

    def __init__(self, expected: Mark, actual: Mark) -> None:
        self.expected = expected
        self.actual = actual
        super().__init__(f"It is {expected.value}'s turn, but {actual.value} attempted to move.")


class GameAlreadyOverError(TicTacToeError):
    """Raised when a move is attempted after the game has already ended."""

    def __init__(self, status: GameStatus) -> None:
        self.status = status
        super().__init__(f"Cannot make a move: the game has already ended ({status.value}).")


class NoMovesToUndoError(TicTacToeError):
    """Raised when :meth:`TicTacToeGame.undo` is called with empty history."""

    def __init__(self) -> None:
        super().__init__("Cannot undo: no moves have been made yet.")
