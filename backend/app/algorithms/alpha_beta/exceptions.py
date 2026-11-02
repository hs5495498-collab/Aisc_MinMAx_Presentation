"""Alpha-Beta's error conditions are identical to Minimax's ("the game
is already over", "it isn't the AI's turn") — rather than duplicate
equivalent exception classes, this module re-exports Minimax's. A
caller catching ``GameOverError`` works the same way regardless of
which algorithm raised it.
"""

from __future__ import annotations

from app.algorithms.minimax.exceptions import GameOverError, MinimaxError, NotAITurnError

__all__ = ["MinimaxError", "GameOverError", "NotAITurnError"]
