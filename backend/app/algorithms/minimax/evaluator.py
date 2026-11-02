"""Terminal-state scoring for Minimax, from a fixed player's perspective.

Scoring convention (see docs/MINIMAX_IMPLEMENTATION.md §3-4):

- A win for ``ai_mark``:      ``WIN_SCORE - depth``   (prefer winning sooner)
- A win for the opponent:     ``depth - WIN_SCORE``    (prefer losing later)
- A draw:                     ``0`` (depth-independent — a draw is a draw)

``depth`` is the number of plies from the position being searched
(depth 0) to this terminal node, so a faster win always scores
strictly higher than a slower win, and a slower loss always scores
strictly higher (less negative) than a faster loss.
"""

from __future__ import annotations

from app.games.tic_tac_toe.engine import TicTacToeGame
from app.games.tic_tac_toe.models import GameStatus, Mark

WIN_SCORE = 10


def evaluate_terminal(game: TicTacToeGame, ai_mark: Mark, depth: int) -> int:
    """Score ``game`` (which must be over) from ``ai_mark``'s perspective at ``depth``."""
    if not game.is_game_over:
        raise ValueError("evaluate_terminal() called on a non-terminal position.")

    if game.status is GameStatus.DRAW:
        return 0

    if game.winner == ai_mark.value:
        return WIN_SCORE - depth
    return depth - WIN_SCORE


__all__ = ["evaluate_terminal", "WIN_SCORE"]
