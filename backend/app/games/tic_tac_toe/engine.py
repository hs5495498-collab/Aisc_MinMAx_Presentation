"""The Tic-Tac-Toe game engine: pure rules, no AI, no I/O.

This module intentionally knows nothing about HTTP, FastAPI, React, or
any search/AI algorithm. It is deterministic and side-effect-free
except for the explicit, in-memory state held by :class:`TicTacToeGame`.
Minimax/Alpha-Beta (Phase 5-6) will be built *on top of* this engine by
reading :meth:`TicTacToeGame.legal_moves` and :meth:`TicTacToeGame.to_dict`
/ a cloned board — see "Future Minimax integration points" in
docs/TIC_TAC_TOE_ENGINE.md.
"""

from __future__ import annotations

from .exceptions import (
    GameAlreadyOverError,
    InvalidPositionError,
    NoMovesToUndoError,
    OccupiedCellError,
    WrongPlayerError,
)
from .models import Board, GameState, GameStatus, Mark, Move, WinningLine

#: All eight winning lines, as (row, col) triples. Three rows, three
#: columns, then the main diagonal and the anti-diagonal.
WINNING_LINES: tuple[WinningLine, ...] = (
    ((0, 0), (0, 1), (0, 2)),
    ((1, 0), (1, 1), (1, 2)),
    ((2, 0), (2, 1), (2, 2)),
    ((0, 0), (1, 0), (2, 0)),
    ((0, 1), (1, 1), (2, 1)),
    ((0, 2), (1, 2), (2, 2)),
    ((0, 0), (1, 1), (2, 2)),
    ((0, 2), (1, 1), (2, 0)),
)


def evaluate_board(board: Board) -> tuple[GameStatus, Mark | None, WinningLine | None]:
    """Pure rule evaluation: does ``board`` show a win, a draw, or neither?

    Checked independently of whose turn it is or how the board was
    reached — this function only looks at the 8 winning lines and
    fullness, so it can never confuse "board is full" with "board has
    a winning line" (a full board with no three-in-a-row is a draw,
    not a win).
    """
    for line in WINNING_LINES:
        (r0, c0), (r1, c1), (r2, c2) = line
        first = board.get(r0, c0)
        if first is not Mark.EMPTY and first == board.get(r1, c1) == board.get(r2, c2):
            status = GameStatus.X_WON if first is Mark.X else GameStatus.O_WON
            return status, first, line

    if board.is_full():
        return GameStatus.DRAW, None, None

    return GameStatus.IN_PROGRESS, None, None


def validate_move(state: GameState, row: int, col: int, player: Mark | None) -> None:
    """Raise the appropriate typed exception if this move is illegal; otherwise do nothing.

    Validation order is deliberate: game-over is checked before board
    bounds, so a stale out-of-range request against a finished game
    reports the more useful "game is over" error rather than a
    confusing bounds error.
    """
    if state.status is not GameStatus.IN_PROGRESS:
        raise GameAlreadyOverError(state.status)

    if not (0 <= row < Board.SIZE) or not (0 <= col < Board.SIZE):
        raise InvalidPositionError(row, col)

    if state.board.get(row, col) is not Mark.EMPTY:
        raise OccupiedCellError(row, col)

    if player is not None and player != state.current_player:
        raise WrongPlayerError(expected=state.current_player, actual=player)


class TicTacToeGame:
    """A single Tic-Tac-Toe game: state representation + rule enforcement.

    All public accessors return defensive copies (or already-immutable
    values) so callers can never mutate internal state by holding onto
    a returned board/history and modifying it in place.
    """

    def __init__(self) -> None:
        # A stack of immutable snapshots, one per ply (index 0 is the
        # empty starting state). Undo is simply popping the stack,
        # which trivially restores the exact prior board/turn/status
        # without needing any inverse-move logic.
        self._states: list[GameState] = [GameState.new_game()]

    # -- internal -----------------------------------------------------

    @property
    def _state(self) -> GameState:
        return self._states[-1]

    # -- read-only public state ----------------------------------------

    @property
    def board(self) -> list[list[str]]:
        """Current board as a fresh 3x3 list of lists (row-major, ``""`` for empty)."""
        return self._state.board.to_rows()

    @property
    def board_flat(self) -> list[str]:
        """Current board as a fresh 9-element list, ``position = row * 3 + col``."""
        return self._state.board.to_flat()

    @property
    def current_player(self) -> str:
        """``"X"`` or ``"O"`` — whoever moves next. Unspecified once the game is over."""
        return self._state.current_player.value

    @property
    def status(self) -> GameStatus:
        return self._state.status

    @property
    def winner(self) -> str | None:
        """``"X"``, ``"O"``, or ``None`` if there is no winner (yet, or ever, in a draw)."""
        return self._state.winner.value if self._state.winner is not None else None

    @property
    def winning_line(self) -> list[list[int]] | None:
        """The three ``[row, col]`` coordinates that won the game, or ``None``."""
        if self._state.winning_line is None:
            return None
        return [list(coord) for coord in self._state.winning_line]

    @property
    def move_count(self) -> int:
        """Number of moves played so far. Derived from history, never stored separately."""
        return len(self._state.history)

    @property
    def last_move(self) -> Move | None:
        return self._state.last_move

    @property
    def history(self) -> tuple[Move, ...]:
        """Full move history, oldest first. ``Move`` is frozen, so this is safe to share."""
        return self._state.history

    @property
    def is_game_over(self) -> bool:
        return self._state.status is not GameStatus.IN_PROGRESS

    def legal_moves(self) -> list[tuple[int, int]]:
        """All empty ``(row, col)`` cells, or ``[]`` if the game has ended."""
        if self.is_game_over:
            return []
        board = self._state.board
        return [
            (row, col)
            for row in range(Board.SIZE)
            for col in range(Board.SIZE)
            if board.get(row, col) is Mark.EMPTY
        ]

    # -- state transitions ----------------------------------------------

    def make_move(self, row: int, col: int, player: str | Mark | None = None) -> None:
        """Play a move at ``(row, col)``.

        :param player: optional explicit symbol the caller believes is
            moving (e.g. a future API layer tracking two human
            players). If given and it does not match whose turn it
            actually is, :class:`WrongPlayerError` is raised and
            nothing changes. If omitted, the engine's own
            ``current_player`` is used, so a caller that always trusts
            the engine's turn order never needs to pass it.

        On any validation failure, the exception is raised *before*
        any state is touched — ``self`` is left exactly as it was.
        """
        requested_player = Mark(player) if isinstance(player, str) else player
        state = self._state

        validate_move(state, row, col, requested_player)

        acting_player = state.current_player
        new_board = state.board.set(row, col, acting_player)
        new_status, winner, winning_line = evaluate_board(new_board)

        move = Move(
            move_number=len(state.history) + 1,
            player=acting_player,
            row=row,
            col=col,
            position=row * Board.SIZE + col,
            board_after=tuple(new_board.to_flat()),
        )

        # The player only switches if the game is still in progress —
        # a game-ending move leaves `current_player` as whoever just
        # moved, which is meaningless once the game is over but keeps
        # the state internally consistent without a sentinel value.
        next_player = acting_player if new_status is not GameStatus.IN_PROGRESS else acting_player.opponent()

        new_state = GameState(
            board=new_board,
            current_player=next_player,
            status=new_status,
            winner=winner,
            history=state.history + (move,),
            last_move=move,
            winning_line=winning_line,
        )
        self._states.append(new_state)

    def undo(self) -> None:
        """Undo the most recent move, restoring the exact prior state.

        Restores the previous board, turn, status, winner, and
        winning line simultaneously, because it restores a whole
        previously-held :class:`GameState` snapshot rather than
        reversing fields one at a time.
        """
        if len(self._states) <= 1:
            raise NoMovesToUndoError()
        self._states.pop()

    def restart(self) -> None:
        """Clear the board and history and start over, X to move first."""
        self._states = [GameState.new_game()]

    def reset(self) -> None:
        """Alias of :meth:`restart`. Kept as a distinct, documented name

        for callers (e.g. a future API) that distinguish "reset my
        session" from "restart this game" at a higher level — at the
        engine level, both operations are identical.
        """
        self.restart()

    # -- serialization -----------------------------------------------

    def to_dict(self) -> dict:
        """A JSON-compatible snapshot of the full game state.

        See docs/TIC_TAC_TOE_ENGINE.md section 11 for the documented,
        stable shape of this dictionary.
        """
        state = self._state
        return {
            "board": state.board.to_flat(),
            "current_player": state.current_player.value,
            "status": state.status.value,
            "winner": state.winner.value if state.winner is not None else None,
            "move_count": len(state.history),
            "last_move": state.last_move.to_dict() if state.last_move is not None else None,
            "move_history": [move.to_dict() for move in state.history],
            "winning_line": [list(coord) for coord in state.winning_line] if state.winning_line else None,
        }


__all__ = [
    "TicTacToeGame",
    "evaluate_board",
    "validate_move",
    "WINNING_LINES",
]
