"""Tests for the Minimax vs. Alpha-Beta comparison utility, and the
reproducible seven-position benchmark required by the Phase 6 brief.

Run with ``pytest -s`` to see the benchmark table printed.
"""

from __future__ import annotations

import pytest

from app.algorithms.comparison import ComparisonResult, _safe_percentage_reduction, compare_algorithms
from app.games.tic_tac_toe import TicTacToeGame


def _play(moves: list[tuple[int, int]]) -> TicTacToeGame:
    game = TicTacToeGame()
    for row, col in moves:
        game.make_move(row, col)
    return game


# ---------------------------------------------------------------------------
# Comparison utility itself
# ---------------------------------------------------------------------------


class TestCompareAlgorithms:
    def test_returns_comparison_result(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = compare_algorithms(game, "X", position_label="immediate win")
        assert isinstance(result, ComparisonResult)
        assert result.position_label == "immediate win"

    def test_original_game_is_unmutated_by_either_algorithm(self):
        game = _play([(0, 0), (1, 0), (0, 1)])
        before = game.to_dict()
        compare_algorithms(game, "O")
        assert game.to_dict() == before

    def test_evaluations_match_on_a_simple_position(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = compare_algorithms(game, "X")
        assert result.evaluations_match is True
        assert result.minimax_evaluation == result.alpha_beta_evaluation

    def test_alpha_beta_never_visits_more_nodes_than_minimax(self):
        # Guaranteed by the Alpha-Beta correctness theorem under
        # identical move ordering: pruning only removes exploration,
        # it never adds any — so this is a `<=`, not a `<` (Phase 6
        # brief: do not promise *strictly* fewer nodes on every position).
        game = TicTacToeGame()
        result = compare_algorithms(game, "X", position_label="empty board")
        assert result.alpha_beta_nodes_visited <= result.minimax_nodes_visited

    def test_node_reduction_percentage_formula(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = compare_algorithms(game, "X")
        expected = ((result.minimax_nodes_visited - result.alpha_beta_nodes_visited) / result.minimax_nodes_visited) * 100
        assert result.node_reduction_percentage == pytest.approx(expected)

    def test_to_dict_serialization_shape(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = compare_algorithms(game, "X", position_label="p")
        d = result.to_dict()
        assert d["position_label"] == "p"
        assert set(d["minimax"]) == {"evaluation", "best_move", "nodes_visited", "terminal_nodes", "execution_time_ms"}
        assert set(d["alpha_beta"]) == {
            "evaluation",
            "best_move",
            "nodes_visited",
            "terminal_nodes",
            "execution_time_ms",
            "cutoffs",
            "branches_pruned",
        }
        assert isinstance(d["evaluations_match"], bool)
        assert isinstance(d["best_moves_match"], bool)

    def test_str_does_not_raise(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = compare_algorithms(game, "X")
        assert str(result)


class TestSafePercentageReduction:
    def test_zero_denominator_returns_zero_not_an_error(self):
        assert _safe_percentage_reduction(0, 0) == 0.0

    def test_normal_reduction(self):
        assert _safe_percentage_reduction(100, 25) == 75.0

    def test_no_reduction(self):
        assert _safe_percentage_reduction(100, 100) == 0.0


# ---------------------------------------------------------------------------
# The required reproducible seven-position benchmark
# ---------------------------------------------------------------------------

#: (label, moves, ai_player) — see docs/ALGORITHM_COMPARISON.md for why
#: each position was chosen.
BENCHMARK_POSITIONS: list[tuple[str, list[tuple[int, int]], str]] = [
    ("1_empty_board", [], "X"),
    ("2_early_game", [(1, 1)], "O"),
    ("3_mid_game", [(0, 0), (1, 1), (2, 2), (0, 2)], "X"),
    ("4_immediate_win_available", [(0, 0), (1, 0), (0, 1), (1, 1)], "X"),
    ("5_must_block_opponent_win", [(0, 0), (1, 0), (0, 1)], "O"),
    (
        "6_late_game_one_cell_left",
        [(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0)],
        "X",
    ),
    ("7_many_branches_to_prune", [(0, 0), (1, 1)], "X"),
]


class TestSevenPositionBenchmark:
    """The reproducible benchmark required by the Phase 6 brief §9.
    Run `pytest -s tests/algorithms/test_comparison.py::TestSevenPositionBenchmark`
    to reproduce and see the printed table; see docs/ALGORITHM_COMPARISON.md
    for the recorded results from the real run this test performs."""

    @pytest.mark.parametrize("label,moves,ai_player", BENCHMARK_POSITIONS, ids=lambda *a: "")
    def test_benchmark_position(self, label, moves, ai_player):
        game = _play(moves)
        result = compare_algorithms(game, ai_player, position_label=label)
        print(f"\n{result}")

        # Properties guaranteed for every position, never a hardcoded
        # expected node count (see Phase 6 brief §9):
        assert result.evaluations_match is True
        assert result.alpha_beta_nodes_visited <= result.minimax_nodes_visited
        assert result.alpha_beta_terminal_nodes <= result.minimax_terminal_nodes
        assert result.alpha_beta_best_move in game.legal_moves()
        assert result.minimax_best_move in game.legal_moves()
        assert result.alpha_beta_cutoffs >= 0
        assert result.branches_pruned >= 0

    def test_empty_board_matches_the_recorded_phase_5_minimax_baseline(self):
        # Phase 5's docs/MINIMAX_IMPLEMENTATION.md reported exactly
        # nodes_visited=549946, terminal_nodes=255168 from the empty
        # board. This re-derives it live and checks the baseline has
        # not drifted, before comparing Alpha-Beta against it.
        game = TicTacToeGame()
        result = compare_algorithms(game, "X", position_label="empty board baseline")
        assert result.minimax_nodes_visited == 549_946
        assert result.minimax_terminal_nodes == 255_168
        print(f"\n{result}")
