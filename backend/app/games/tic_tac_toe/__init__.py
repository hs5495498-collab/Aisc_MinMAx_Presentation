"""Pure-Python Tic-Tac-Toe game engine (rules only — no AI, no HTTP).

Public API::

    from app.games.tic_tac_toe import TicTacToeGame, Mark, GameStatus

See docs/TIC_TAC_TOE_ENGINE.md for the full design write-up.
"""

from .engine import TicTacToeGame, evaluate_board
from .exceptions import (
    GameAlreadyOverError,
    InvalidPositionError,
    NoMovesToUndoError,
    OccupiedCellError,
    TicTacToeError,
    WrongPlayerError,
)
from .models import Board, GameState, GameStatus, Mark, Move

__all__ = [
    "TicTacToeGame",
    "evaluate_board",
    "Board",
    "GameState",
    "GameStatus",
    "Mark",
    "Move",
    "TicTacToeError",
    "InvalidPositionError",
    "OccupiedCellError",
    "WrongPlayerError",
    "GameAlreadyOverError",
    "NoMovesToUndoError",
]
