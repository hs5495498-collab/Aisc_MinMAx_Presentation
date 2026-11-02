"""Fair, same-position comparison between Minimax and Alpha-Beta.

"Independent copies of exactly the same initial state" (per the Phase
6 brief) is satisfied without any extra cloning here: both
``minimax.find_best_move`` and ``alpha_beta.find_best_move`` already
clone their input internally and never mutate the caller's object
(each has its own test suite proving this). Passing the same ``game``
to both, one after the other, therefore already gives each algorithm
its own independent copy of the identical starting position.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.algorithms import alpha_beta, minimax
from app.games.tic_tac_toe.engine import TicTacToeGame
from app.games.tic_tac_toe.models import Mark


@dataclass(frozen=True)
class ComparisonResult:
    """Side-by-side Minimax vs. Alpha-Beta result for one position.

    ``evaluations_match`` and ``best_moves_match`` are tracked
    separately on purpose — see docs/ALGORITHM_COMPARISON.md §"Same
    value vs. same move vs. same outcome": two moves can be equally
    optimal (same evaluation) without being the *same* move, and
    neither case is a correctness failure. ``best_moves_match`` is
    reported as an observation, not treated as a pass/fail criterion.
    """

    position_label: str | None
    ai_player: str
    opponent_player: str

    minimax_evaluation: int
    alpha_beta_evaluation: int
    minimax_best_move: tuple[int, int]
    alpha_beta_best_move: tuple[int, int]

    minimax_nodes_visited: int
    alpha_beta_nodes_visited: int
    minimax_terminal_nodes: int
    alpha_beta_terminal_nodes: int
    minimax_execution_time_ms: float
    alpha_beta_execution_time_ms: float

    alpha_beta_cutoffs: int
    branches_pruned: int

    node_reduction_percentage: float
    terminal_node_reduction_percentage: float

    evaluations_match: bool
    best_moves_match: bool

    def to_dict(self) -> dict:
        return {
            "position_label": self.position_label,
            "ai_player": self.ai_player,
            "opponent_player": self.opponent_player,
            "minimax": {
                "evaluation": self.minimax_evaluation,
                "best_move": {"row": self.minimax_best_move[0], "col": self.minimax_best_move[1]},
                "nodes_visited": self.minimax_nodes_visited,
                "terminal_nodes": self.minimax_terminal_nodes,
                "execution_time_ms": self.minimax_execution_time_ms,
            },
            "alpha_beta": {
                "evaluation": self.alpha_beta_evaluation,
                "best_move": {"row": self.alpha_beta_best_move[0], "col": self.alpha_beta_best_move[1]},
                "nodes_visited": self.alpha_beta_nodes_visited,
                "terminal_nodes": self.alpha_beta_terminal_nodes,
                "execution_time_ms": self.alpha_beta_execution_time_ms,
                "cutoffs": self.alpha_beta_cutoffs,
                "branches_pruned": self.branches_pruned,
            },
            "node_reduction_percentage": self.node_reduction_percentage,
            "terminal_node_reduction_percentage": self.terminal_node_reduction_percentage,
            "evaluations_match": self.evaluations_match,
            "best_moves_match": self.best_moves_match,
        }

    def __str__(self) -> str:
        label = f"[{self.position_label}] " if self.position_label else ""
        return (
            f"{label}Minimax nodes={self.minimax_nodes_visited} "
            f"vs AlphaBeta nodes={self.alpha_beta_nodes_visited} "
            f"({self.node_reduction_percentage:.2f}% reduction, "
            f"{self.alpha_beta_cutoffs} cutoffs, {self.branches_pruned} branches pruned); "
            f"evaluations_match={self.evaluations_match} best_moves_match={self.best_moves_match}"
        )


def _safe_percentage_reduction(before: int, after: int) -> float:
    """``((before - after) / before) * 100``, or ``0.0`` if ``before`` is 0
    (nothing to reduce from — e.g. a one-legal-move position where
    both algorithms visit the same tiny number of nodes)."""
    if before == 0:
        return 0.0
    return ((before - after) / before) * 100


def compare_algorithms(
    game: TicTacToeGame,
    ai_player: str | Mark,
    position_label: str | None = None,
) -> ComparisonResult:
    """Run Minimax and Alpha-Beta on the exact same position and AI
    player, and report their results side by side. Neither algorithm's
    input ``game`` is mutated (see module docstring)."""
    mm = minimax.find_best_move(game, ai_player)
    ab = alpha_beta.find_best_move(game, ai_player)

    return ComparisonResult(
        position_label=position_label,
        ai_player=mm.ai_player,
        opponent_player=mm.opponent_player,
        minimax_evaluation=mm.evaluation,
        alpha_beta_evaluation=ab.evaluation,
        minimax_best_move=mm.best_move,
        alpha_beta_best_move=ab.best_move,
        minimax_nodes_visited=mm.nodes_visited,
        alpha_beta_nodes_visited=ab.nodes_visited,
        minimax_terminal_nodes=mm.terminal_nodes,
        alpha_beta_terminal_nodes=ab.terminal_nodes,
        minimax_execution_time_ms=mm.execution_time_ms,
        alpha_beta_execution_time_ms=ab.execution_time_ms,
        alpha_beta_cutoffs=ab.alpha_beta_cutoffs,
        branches_pruned=ab.branches_pruned,
        node_reduction_percentage=_safe_percentage_reduction(mm.nodes_visited, ab.nodes_visited),
        terminal_node_reduction_percentage=_safe_percentage_reduction(
            mm.terminal_nodes, ab.terminal_nodes
        ),
        evaluations_match=(mm.evaluation == ab.evaluation),
        best_moves_match=(mm.best_move == ab.best_move),
    )


__all__ = ["compare_algorithms", "ComparisonResult"]
