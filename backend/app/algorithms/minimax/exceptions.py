"""Typed exceptions raised by the Minimax solver.

Deliberately separate from ``app.games.tic_tac_toe.exceptions`` — the
algorithm layer's error conditions ("it isn't the AI's turn") are not
game-engine concepts, so they get their own names rather than
reusing/subclassing the engine's exceptions.
"""

from __future__ import annotations


class MinimaxError(Exception):
    """Base class for all Minimax solver errors."""


class GameOverError(MinimaxError):
    """Raised when a best-move search is requested on a finished game."""

    def __init__(self, status: str) -> None:
        self.status = status
        super().__init__(f"Cannot search for a best move: the game has already ended ({status}).")


class NotAITurnError(MinimaxError):
    """Raised when the AI player named is not the one whose turn it is."""

    def __init__(self, ai_player: str, current_player: str) -> None:
        self.ai_player = ai_player
        self.current_player = current_player
        super().__init__(
            f"Cannot search for {ai_player}'s best move: it is currently {current_player}'s turn."
        )
