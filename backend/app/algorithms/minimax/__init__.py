"""Standard (unpruned) Minimax search for Tic-Tac-Toe.

Public API::

    from app.algorithms.minimax import find_best_move, MinimaxResult

See docs/MINIMAX_IMPLEMENTATION.md for the full design write-up.
Alpha-Beta Pruning is intentionally **not** implemented here — see
Phase 6.
"""

from .evaluator import WIN_SCORE, evaluate_terminal
from .exceptions import GameOverError, MinimaxError, NotAITurnError
from .models import MinimaxResult
from .observer import SearchObserver
from .solver import find_best_move

__all__ = [
    "find_best_move",
    "MinimaxResult",
    "SearchObserver",
    "evaluate_terminal",
    "WIN_SCORE",
    "MinimaxError",
    "GameOverError",
    "NotAITurnError",
]
