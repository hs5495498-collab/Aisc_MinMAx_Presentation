"""Immutable data model for the Tic-Tac-Toe game engine.

Coordinate convention (documented once, used everywhere in this
package): the board is addressed by ``(row, col)`` with ``row`` and
``col`` each in ``{0, 1, 2}``. ``row=0`` is the top row, ``row=2`` is
the bottom row; ``col=0`` is the left column, ``col=2`` is the right
column. The equivalent flat, row-major index used for JSON/API
compatibility is ``position = row * 3 + col`` (0-8), matching
docs/API_SPECIFICATION.md's existing board representation.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Mark(str, Enum):
    """A single board cell's occupant, or the player making a move.

    Backed by ``str`` so values serialize directly to JSON-friendly
    strings (``Mark.X.value == "X"``), matching docs/API_SPECIFICATION.md.
    """

    EMPTY = ""
    X = "X"
    O = "O"

    def opponent(self) -> "Mark":
        """Return the other player. Only valid for ``X`` or ``O``."""
        if self is Mark.X:
            return Mark.O
        if self is Mark.O:
            return Mark.X
        raise ValueError("Mark.EMPTY has no opponent.")


class GameStatus(str, Enum):
    """Overall game status."""

    IN_PROGRESS = "IN_PROGRESS"
    X_WON = "X_WON"
    O_WON = "O_WON"
    DRAW = "DRAW"


#: A winning line expressed as three (row, col) coordinates.
WinningLine = tuple[tuple[int, int], tuple[int, int], tuple[int, int]]


class Board:
    """An immutable 3x3 board of :class:`Mark` values.

    Every mutating-looking operation (:meth:`set`) returns a *new*
    ``Board`` rather than modifying the receiver, so a reference to a
    past board can never be corrupted by a later move.
    """

    SIZE = 3

    __slots__ = ("_cells",)

    def __init__(self, cells: tuple[tuple[Mark, ...], ...] | None = None) -> None:
        if cells is None:
            cells = tuple(tuple(Mark.EMPTY for _ in range(self.SIZE)) for _ in range(self.SIZE))
        self._cells = cells

    def get(self, row: int, col: int) -> Mark:
        """Return the mark at ``(row, col)``. Caller must pass in-range coordinates."""
        return self._cells[row][col]

    def set(self, row: int, col: int, mark: Mark) -> "Board":
        """Return a new :class:`Board` with ``(row, col)`` set to ``mark``."""
        rows = [list(existing_row) for existing_row in self._cells]
        rows[row][col] = mark
        return Board(tuple(tuple(row_values) for row_values in rows))

    def is_full(self) -> bool:
        """True when every cell is occupied by X or O."""
        return all(cell is not Mark.EMPTY for row in self._cells for cell in row)

    def to_rows(self) -> list[list[str]]:
        """A fresh, mutable 3x3 list-of-lists copy, safe for callers to modify."""
        return [[cell.value for cell in row] for row in self._cells]

    def to_flat(self) -> list[str]:
        """A fresh, mutable 9-element row-major list copy (position 0-8)."""
        return [cell.value for row in self._cells for cell in row]

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Board):
            return NotImplemented
        return self._cells == other._cells

    def __repr__(self) -> str:
        rows = ", ".join(str([cell.value for cell in row]) for row in self._cells)
        return f"Board({rows})"


@dataclass(frozen=True)
class Move:
    """A single, already-applied move, kept for history and undo.

    ``board_after`` is an immutable (tuple) row-major snapshot of the
    board *after* this move, so historical records can never be
    mutated by later gameplay.
    """

    move_number: int
    player: Mark
    row: int
    col: int
    position: int
    board_after: tuple[str, ...]

    def to_dict(self) -> dict:
        """JSON-compatible representation of this move."""
        return {
            "move_number": self.move_number,
            "player": self.player.value,
            "row": self.row,
            "col": self.col,
            "position": self.position,
            "board_after": list(self.board_after),
        }


@dataclass(frozen=True)
class GameState:
    """A single, immutable snapshot of the whole game at one point in time."""

    board: Board
    current_player: Mark
    status: GameStatus
    winner: Mark | None
    history: tuple[Move, ...]
    last_move: Move | None
    winning_line: WinningLine | None

    @staticmethod
    def new_game() -> "GameState":
        """The initial state: empty board, X to move, no history."""
        return GameState(
            board=Board(),
            current_player=Mark.X,
            status=GameStatus.IN_PROGRESS,
            winner=None,
            history=(),
            last_move=None,
            winning_line=None,
        )
