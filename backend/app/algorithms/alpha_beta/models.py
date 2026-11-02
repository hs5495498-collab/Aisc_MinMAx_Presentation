"""Typed result and statistics structures for the Alpha-Beta solver."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AlphaBetaResult:
    """The outcome of one :func:`solver.find_best_move` call. Immutable."""

    best_move: tuple[int, int]
    evaluation: int
    ai_player: str
    opponent_player: str
    nodes_visited: int
    terminal_nodes: int
    leaves_evaluated: int
    moves_considered: int
    maximum_search_depth: int
    execution_time_ms: float
    alpha_beta_cutoffs: int
    branches_pruned: int

    def to_dict(self) -> dict:
        """JSON-compatible representation of this result."""
        return {
            "best_move": {"row": self.best_move[0], "col": self.best_move[1]},
            "evaluation": self.evaluation,
            "ai_player": self.ai_player,
            "opponent_player": self.opponent_player,
            "statistics": {
                "nodes_visited": self.nodes_visited,
                "terminal_nodes": self.terminal_nodes,
                "leaves_evaluated": self.leaves_evaluated,
                "moves_considered": self.moves_considered,
                "maximum_search_depth": self.maximum_search_depth,
                "execution_time_ms": self.execution_time_ms,
                "alpha_beta_cutoffs": self.alpha_beta_cutoffs,
                "branches_pruned": self.branches_pruned,
            },
        }

    def __str__(self) -> str:
        row, col = self.best_move
        return (
            f"AlphaBeta({self.ai_player} vs {self.opponent_player}): "
            f"move=({row},{col}) evaluation={self.evaluation} "
            f"nodes_visited={self.nodes_visited} terminal_nodes={self.terminal_nodes} "
            f"cutoffs={self.alpha_beta_cutoffs} branches_pruned={self.branches_pruned} "
            f"depth={self.maximum_search_depth} time={self.execution_time_ms:.3f}ms"
        )


@dataclass
class AlphaBetaStats:
    """Mutable accumulator the solver fills in while it recurses.

    Field definitions (see docs/ALPHA_BETA_IMPLEMENTATION.md §6):

    - ``nodes_visited`` / ``terminal_nodes`` / ``leaves_evaluated`` /
      ``moves_considered`` / ``maximum_search_depth``: identical
      definitions to Minimax's ``SearchStats`` (see
      docs/MINIMAX_IMPLEMENTATION.md §8) — kept equivalent so the two
      algorithms are comparable on the same terms.
    - ``alpha_beta_cutoffs``: the number of **cutoff events** — how
      many times, at any node, ``alpha >= beta`` caused the remaining
      not-yet-explored siblings to be skipped. One event can skip
      several siblings at once.
    - ``branches_pruned``: the number of **individual successor
      branches** actually skipped as a result of those cutoff events —
      i.e. ``sum(remaining siblings skipped)`` across all cutoffs. This
      is deliberately a different number from ``alpha_beta_cutoffs``:
      one cutoff event with 3 remaining siblings contributes 1 to
      ``alpha_beta_cutoffs`` and 3 to ``branches_pruned``.
    """

    nodes_visited: int = 0
    terminal_nodes: int = 0
    leaves_evaluated: int = 0
    moves_considered: int = 0
    maximum_search_depth: int = 0
    alpha_beta_cutoffs: int = 0
    branches_pruned: int = 0


__all__ = ["AlphaBetaResult", "AlphaBetaStats"]
