"""Standard Alpha-Beta Pruning search for Tic-Tac-Toe.

Public API::

    from app.algorithms.alpha_beta import find_best_move, AlphaBetaResult

Shares its terminal evaluator with ``app.algorithms.minimax`` (same
scoring convention, same game-engine interfaces, same move ordering),
so the two are directly comparable — see
``app.algorithms.comparison`` and docs/ALGORITHM_COMPARISON.md.
"""

from .exceptions import GameOverError, MinimaxError, NotAITurnError
from .models import AlphaBetaResult
from .observer import SearchObserver
from .solver import find_best_move

__all__ = [
    "find_best_move",
    "AlphaBetaResult",
    "SearchObserver",
    "MinimaxError",
    "GameOverError",
    "NotAITurnError",
]
