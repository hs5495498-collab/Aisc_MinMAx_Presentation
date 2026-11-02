"""Typed result and statistics structures for the Minimax solver."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MinimaxResult:
    """The outcome of one :func:`solver.find_best_move` call.

    Immutable — a result is a record of what already happened, not a
    handle into the (cloned, already-discarded) search state.
    """

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
            },
        }

    def __str__(self) -> str:
        row, col = self.best_move
        return (
            f"Minimax({self.ai_player} vs {self.opponent_player}): "
            f"move=({row},{col}) evaluation={self.evaluation} "
            f"nodes_visited={self.nodes_visited} terminal_nodes={self.terminal_nodes} "
            f"depth={self.maximum_search_depth} time={self.execution_time_ms:.3f}ms"
        )


@dataclass
class SearchStats:
    """Mutable accumulator the solver fills in while it recurses.

    Internal to the solver — ``find_best_move`` freezes the final
    numbers into an immutable :class:`MinimaxResult` before returning.

    Field definitions (see docs/MINIMAX_IMPLEMENTATION.md §8):

    - ``nodes_visited``: every search-node entry, including the root.
    - ``terminal_nodes``: terminal (won/lost/drawn) positions reached.
    - ``leaves_evaluated``: evaluator-function invocations. Always
      equal to ``terminal_nodes`` in this unpruned baseline (every
      terminal node is evaluated exactly once, with no caching) — kept
      as a distinct counter because Phase 6's Alpha-Beta comparison
      wants both terminology slots available, and the two questions
      ("how many terminal positions were reached" vs. "how many
      evaluator calls were made") are conceptually different even
      though they coincide here.
    - ``moves_considered``: successor moves actually explored (i.e.
      recursed into), not merely the number of empty cells available.
    - ``maximum_search_depth``: the deepest recursion level reached
      (root = depth 0).
    """

    nodes_visited: int = 0
    terminal_nodes: int = 0
    leaves_evaluated: int = 0
    moves_considered: int = 0
    maximum_search_depth: int = 0


__all__ = ["MinimaxResult", "SearchStats"]
