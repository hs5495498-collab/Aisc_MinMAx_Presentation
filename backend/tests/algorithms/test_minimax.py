"""Comprehensive tests for the standard (unpruned) Minimax solver.

Run from the ``backend/`` directory with: ``pytest -s`` (``-s`` lets
the exhaustive-verification tests print the exact node/leaf counts
they checked).
"""

from __future__ import annotations

import pytest

from app.algorithms.minimax import GameOverError, MinimaxResult, NotAITurnError, find_best_move
from app.algorithms.minimax.evaluator import evaluate_terminal
from app.algorithms.minimax.models import SearchStats
from app.games.tic_tac_toe import GameStatus, Mark, TicTacToeGame


def _play(moves: list[tuple[int, int]]) -> TicTacToeGame:
    game = TicTacToeGame()
    for row, col in moves:
        game.make_move(row, col)
    return game


# ---------------------------------------------------------------------------
# A. Terminal states
# ---------------------------------------------------------------------------


class TestTerminalEvaluation:
    def test_ai_win_scores_positive(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)])  # X wins top row
        assert game.status is GameStatus.X_WON
        score = evaluate_terminal(game, Mark.X, depth=0)
        assert score > 0

    def test_ai_loss_scores_negative(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)])  # X wins
        score = evaluate_terminal(game, Mark.O, depth=0)  # scored for the loser
        assert score < 0

    def test_draw_scores_zero(self):
        game = _play([(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0), (2, 2)])
        assert game.status is GameStatus.DRAW
        assert evaluate_terminal(game, Mark.X, depth=0) == 0
        assert evaluate_terminal(game, Mark.O, depth=0) == 0

    def test_evaluation_is_from_the_named_players_perspective(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)])  # X wins
        assert evaluate_terminal(game, Mark.X, depth=5) == -evaluate_terminal(game, Mark.O, depth=5)

    def test_faster_win_scores_higher_than_slower_win(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)])  # X wins
        fast = evaluate_terminal(game, Mark.X, depth=4)
        slow = evaluate_terminal(game, Mark.X, depth=8)
        assert fast > slow

    def test_slower_loss_scores_higher_than_faster_loss(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)])  # X wins, O lost
        slow_loss = evaluate_terminal(game, Mark.O, depth=8)
        fast_loss = evaluate_terminal(game, Mark.O, depth=4)
        assert slow_loss > fast_loss

    def test_evaluate_terminal_rejects_nonterminal_position(self):
        game = TicTacToeGame()
        with pytest.raises(ValueError):
            evaluate_terminal(game, Mark.X, depth=0)


# ---------------------------------------------------------------------------
# B. Optimal decisions
# ---------------------------------------------------------------------------


class TestOptimalDecisions:
    def test_takes_immediate_winning_move(self):
        # Moves: (0,0)X, (1,0)O, (0,1)X, (1,1)O -> X={(0,0),(0,1)}, O={(1,0),(1,1)}.
        # 4 moves played, so it's X's turn (move 5); X completes the top row at (0,2).
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        assert game.current_player == "X"
        result = find_best_move(game, "X")
        assert result.best_move == (0, 2)
        assert result.evaluation > 0

    def test_blocks_immediate_opponent_win(self):
        # Moves: (0,0)X, (1,0)O, (0,1)X -> X={(0,0),(0,1)} threatens (0,2).
        # 3 moves played, so it's O's turn (move 4); O must block (0,2).
        game = _play([(0, 0), (1, 0), (0, 1)])
        assert game.current_player == "O"
        result = find_best_move(game, "O")
        assert result.best_move == (0, 2)

    def test_avoids_forced_loss_in_the_classic_double_corner_trap(self):
        # X takes center, O takes a corner, X takes the opposite corner.
        # This is the textbook Tic-Tac-Toe "double corner" trap: O must
        # reply with one of the two remaining corners, not an edge, or
        # X can force a fork and win. With a correct O reply, perfect
        # play still leads to a draw (evaluation 0) — Tic-Tac-Toe from
        # a non-blundering position is never a forced loss.
        game = _play([(1, 1), (0, 0), (2, 2)])
        assert game.current_player == "O"
        result = find_best_move(game, "O")
        assert result.evaluation == 0
        assert result.best_move in {(0, 2), (2, 0)}

    def test_never_selects_an_illegal_move(self):
        boards = [
            [],
            [(1, 1)],
            [(0, 0), (1, 1)],
            [(0, 0), (0, 1), (1, 1), (1, 0)],
        ]
        for moves in boards:
            game = _play(moves)
            if game.is_game_over:
                continue
            result = find_best_move(game, game.current_player)
            assert result.best_move in game.legal_moves()

    def test_game_over_raises_game_over_error(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)])  # X_WON
        with pytest.raises(GameOverError):
            find_best_move(game, "X")

    def test_wrong_turn_raises_not_ai_turn_error(self):
        game = TicTacToeGame()  # X to move
        with pytest.raises(NotAITurnError):
            find_best_move(game, "O")


# ---------------------------------------------------------------------------
# C. Game-state correctness
# ---------------------------------------------------------------------------


class TestGameStateCorrectness:
    def test_original_game_snapshot_is_unchanged_after_search(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        before = game.to_dict()
        find_best_move(game, "X")
        after = game.to_dict()
        assert before == after

    def test_search_does_not_change_current_player(self):
        game = _play([(0, 0), (1, 0)])
        before = game.current_player
        find_best_move(game, before)
        assert game.current_player == before

    def test_search_does_not_change_status(self):
        game = _play([(0, 0), (1, 0)])
        before = game.status
        find_best_move(game, game.current_player)
        assert game.status == before

    def test_works_with_x_as_ai(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = find_best_move(game, "X")
        assert result.best_move == (0, 2)

    def test_works_with_o_as_ai(self):
        game = _play([(0, 0), (1, 0), (0, 1)])
        result = find_best_move(game, "O")
        assert result.best_move == (0, 2)


# ---------------------------------------------------------------------------
# D. Determinism
# ---------------------------------------------------------------------------


class TestDeterminism:
    def test_same_position_yields_same_result(self):
        game = _play([(0, 0), (0, 1), (1, 1), (1, 0)])
        first = find_best_move(game, "X")
        second = find_best_move(game, "X")
        assert first.best_move == second.best_move
        assert first.evaluation == second.evaluation
        assert first.nodes_visited == second.nodes_visited
        assert first.terminal_nodes == second.terminal_nodes

    def test_tie_breaking_prefers_row_major_order_on_an_empty_board(self):
        # Every opening move in Tic-Tac-Toe has Minimax value 0 (perfect
        # play from the empty board is always a draw, for ANY first
        # move) — a 9-way tie. Row-major tie-breaking must pick (0, 0).
        game = TicTacToeGame()
        result = find_best_move(game, "X")
        assert result.evaluation == 0
        assert result.best_move == (0, 0)


# ---------------------------------------------------------------------------
# E. Search statistics — hand-verified exact counts on a tiny position
# ---------------------------------------------------------------------------


class TestSearchStatistics:
    def test_exact_counts_with_one_legal_move_remaining(self):
        # Reuses the verified draw layout from test_tic_tac_toe.py, one
        # move short of complete: exactly one empty cell, (2, 2), and
        # playing it leads straight to a DRAW.
        game = _play([(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0)])
        assert game.legal_moves() == [(2, 2)]
        assert game.current_player == "X"

        result = find_best_move(game, "X")

        assert result.best_move == (2, 2)
        assert result.evaluation == 0
        assert result.nodes_visited == 2        # root + the one terminal child
        assert result.terminal_nodes == 1
        assert result.leaves_evaluated == 1
        assert result.moves_considered == 1
        assert result.maximum_search_depth == 1
        assert result.execution_time_ms >= 0.0

    def test_statistics_are_internally_consistent_on_a_larger_position(self):
        game = _play([(0, 0), (1, 1)])  # 7 empty cells, X to move
        result = find_best_move(game, "X")

        assert result.nodes_visited >= 1
        assert 0 <= result.terminal_nodes <= result.nodes_visited
        assert result.leaves_evaluated == result.terminal_nodes
        assert result.moves_considered >= len(game.legal_moves())
        assert result.maximum_search_depth >= 1
        assert result.execution_time_ms >= 0.0

    def test_search_stats_dataclass_defaults_are_zero(self):
        stats = SearchStats()
        assert (
            stats.nodes_visited
            == stats.terminal_nodes
            == stats.leaves_evaluated
            == stats.moves_considered
            == stats.maximum_search_depth
            == 0
        )

    def test_result_to_dict_and_str_do_not_raise(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = find_best_move(game, "X")
        assert isinstance(result, MinimaxResult)
        d = result.to_dict()
        assert d["best_move"] == {"row": 0, "col": 2}
        assert "statistics" in d
        assert str(result)  # does not raise, non-empty


# ---------------------------------------------------------------------------
# F. Full-game exhaustive verification
# ---------------------------------------------------------------------------


class _ExhaustiveCounters:
    def __init__(self) -> None:
        self.nodes_visited = 0
        self.terminal_leaves_checked = 0
        self.ai_decisions_computed = 0
        self.ai_decisions_reused = 0


def _assert_ai_never_loses(
    game: TicTacToeGame,
    ai_mark: Mark,
    counters: _ExhaustiveCounters,
    cache: dict[tuple[str, ...], tuple[int, int]],
) -> None:
    """Exhaustively verify: for EVERY possible opponent strategy (branching
    over all legal opponent moves at every opponent turn), and the AI
    always playing its actual Minimax move, the AI is never the loser.

    ``cache`` maps a board (as a flat tuple) to the move Minimax already
    chose there. This is a **test-harness-only** transposition cache —
    it does not touch the solver, which still runs its genuine, unpruned
    full-depth search every time it is actually invoked. It exists only
    to avoid redundantly re-running that full search when the exhaustive
    opponent-branching walk reaches the exact same board (reachable via
    many different move orders) more than once; see
    docs/MINIMAX_IMPLEMENTATION.md §11 for why this was necessary and
    why it does not weaken the verification (every distinct position is
    still resolved by a real, independent call to ``find_best_move``;
    repeats only reuse an already-proven-correct answer for that exact
    board, which the Determinism tests already establish is stable).
    """
    counters.nodes_visited += 1

    if game.is_game_over:
        counters.terminal_leaves_checked += 1
        assert game.winner != ai_mark.opponent().value, (
            f"Minimax AI ({ai_mark.value}) lost! Final board: {game.board_flat}"
        )
        return

    if game.current_player == ai_mark.value:
        key = tuple(game.board_flat)
        cached = cache.get(key)
        if cached is None:
            result = find_best_move(game, ai_mark)
            cached = result.best_move
            cache[key] = cached
            counters.ai_decisions_computed += 1
        else:
            counters.ai_decisions_reused += 1
        game.make_move(*cached)
        _assert_ai_never_loses(game, ai_mark, counters, cache)
        game.undo()
    else:
        for row, col in game.legal_moves():
            game.make_move(row, col)
            _assert_ai_never_loses(game, ai_mark, counters, cache)
            game.undo()


class TestExhaustiveVerification:
    """See docs/MINIMAX_IMPLEMENTATION.md §11 for the exact counts these
    produce and the method used. Run with `pytest -s` to see them printed."""

    def test_ai_as_x_never_loses_against_any_opponent_strategy(self):
        game = TicTacToeGame()
        counters = _ExhaustiveCounters()
        cache: dict[tuple[str, ...], tuple[int, int]] = {}
        _assert_ai_never_loses(game, Mark.X, counters, cache)
        print(
            f"\n[exhaustive: AI=X] nodes_visited={counters.nodes_visited} "
            f"terminal_leaves_checked={counters.terminal_leaves_checked} "
            f"distinct_ai_positions_searched={counters.ai_decisions_computed} "
            f"transposition_cache_hits={counters.ai_decisions_reused}"
        )
        assert counters.terminal_leaves_checked > 0

    def test_ai_as_o_never_loses_against_any_opponent_strategy(self):
        game = TicTacToeGame()
        counters = _ExhaustiveCounters()
        cache: dict[tuple[str, ...], tuple[int, int]] = {}
        _assert_ai_never_loses(game, Mark.O, counters, cache)
        print(
            f"\n[exhaustive: AI=O] nodes_visited={counters.nodes_visited} "
            f"terminal_leaves_checked={counters.terminal_leaves_checked} "
            f"distinct_ai_positions_searched={counters.ai_decisions_computed} "
            f"transposition_cache_hits={counters.ai_decisions_reused}"
        )
        assert counters.terminal_leaves_checked > 0

    def test_minimax_versus_minimax_always_draws(self):
        game = TicTacToeGame()
        while not game.is_game_over:
            result = find_best_move(game, game.current_player)
            game.make_move(*result.best_move)
        assert game.status is GameStatus.DRAW
        assert game.winner is None
