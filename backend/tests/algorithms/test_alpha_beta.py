"""Comprehensive tests for the Alpha-Beta Pruning solver.

Run from the ``backend/`` directory with: ``pytest -s`` (``-s`` lets
the exhaustive-verification test print its exact counts).
"""

from __future__ import annotations

import pytest

from app.algorithms.alpha_beta import AlphaBetaResult, GameOverError, NotAITurnError, find_best_move
from app.algorithms.alpha_beta.models import AlphaBetaStats
from app.algorithms.minimax.evaluator import evaluate_terminal
from app.games.tic_tac_toe import GameStatus, Mark, TicTacToeGame


def _play(moves: list[tuple[int, int]]) -> TicTacToeGame:
    game = TicTacToeGame()
    for row, col in moves:
        game.make_move(row, col)
    return game


# ---------------------------------------------------------------------------
# Shared-evaluator proof (not a duplicate scoring rule)
# ---------------------------------------------------------------------------


def test_alpha_beta_reuses_the_exact_minimax_evaluator_function():
    from app.algorithms.alpha_beta import solver as ab_solver
    from app.algorithms.minimax import evaluator as mm_evaluator

    assert ab_solver.evaluate_terminal is mm_evaluator.evaluate_terminal


# ---------------------------------------------------------------------------
# A. Correctness
# ---------------------------------------------------------------------------


class TestCorrectness:
    def test_takes_immediate_winning_move(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        assert game.current_player == "X"
        result = find_best_move(game, "X")
        assert result.best_move == (0, 2)
        assert result.evaluation > 0

    def test_blocks_immediate_opponent_win(self):
        game = _play([(0, 0), (1, 0), (0, 1)])
        assert game.current_player == "O"
        result = find_best_move(game, "O")
        assert result.best_move == (0, 2)

    def test_forced_win_and_forced_loss_positions(self):
        # X center, O corner, X opposite corner, O edge (a known blunder —
        # O should have taken a corner, not an edge) -> X now has a fork
        # and forces a win no matter how O responds.
        fork_set = _play([(1, 1), (0, 0), (2, 2), (0, 1)])
        assert fork_set.current_player == "X"
        forced_win = find_best_move(fork_set, "X")
        assert forced_win.evaluation > 0  # X forces a win from here

        # One ply later, after X plays the fork move: now it is O's turn,
        # and EVERY legal move for O leads to a loss (evaluation is O's
        # *best* achievable outcome, and it is still negative).
        fork_set.make_move(*forced_win.best_move)
        assert fork_set.current_player == "O"
        forced_loss = find_best_move(fork_set, "O")
        assert forced_loss.evaluation < 0  # no move saves O here

    def test_draw_position_evaluates_to_zero(self):
        game = _play([(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0)])
        result = find_best_move(game, "X")
        assert result.evaluation == 0

    def test_works_with_x_as_ai(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = find_best_move(game, "X")
        assert result.best_move == (0, 2)

    def test_works_with_o_as_ai(self):
        game = _play([(0, 0), (1, 0), (0, 1)])
        result = find_best_move(game, "O")
        assert result.best_move == (0, 2)

    def test_depth_preference_prefers_faster_win(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = find_best_move(game, "X")
        assert result.evaluation == 9  # 10 - depth(1), matching Minimax's convention exactly

    def test_never_selects_an_illegal_move(self):
        for moves in ([], [(1, 1)], [(0, 0), (1, 1)], [(0, 0), (1, 0), (0, 1), (1, 1)]):
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
        game = TicTacToeGame()
        with pytest.raises(NotAITurnError):
            find_best_move(game, "O")


# ---------------------------------------------------------------------------
# B. Alpha-Beta pruning mechanics
# ---------------------------------------------------------------------------


class _RecordingObserver:
    """Minimal observer that just records every event it receives."""

    def __init__(self) -> None:
        self.cutoffs: list[dict] = []
        self.branches_pruned: list[dict] = []
        self.alpha_updates: list[dict] = []
        self.beta_updates: list[dict] = []

    def on_node_entered(self, **kw):
        pass

    def on_move_explored(self, **kw):
        pass

    def on_terminal_evaluated(self, **kw):
        pass

    def on_alpha_updated(self, **kw):
        self.alpha_updates.append(kw)

    def on_beta_updated(self, **kw):
        self.beta_updates.append(kw)

    def on_cutoff_triggered(self, **kw):
        self.cutoffs.append(kw)

    def on_branch_pruned(self, **kw):
        self.branches_pruned.append(kw)

    def on_value_returned(self, **kw):
        pass

    def on_best_move_updated(self, **kw):
        pass


class TestPruningMechanics:
    def test_pruning_occurs_and_reduces_nodes_on_the_empty_board(self):
        game = TicTacToeGame()
        result = find_best_move(game, "X")
        assert result.alpha_beta_cutoffs > 0
        assert result.branches_pruned > 0
        assert result.nodes_visited < 549_946  # strictly fewer than the Minimax baseline

    def test_both_max_and_min_node_cutoffs_occur(self):
        game = TicTacToeGame()
        observer = _RecordingObserver()
        find_best_move(game, "X", observer=observer)
        roles = {event["role"] for event in observer.cutoffs}
        assert "MAX" in roles
        assert "MIN" in roles

    def test_alpha_and_beta_are_actually_updated_during_search(self):
        game = TicTacToeGame()
        observer = _RecordingObserver()
        find_best_move(game, "X", observer=observer)
        assert len(observer.alpha_updates) > 0
        assert len(observer.beta_updates) > 0
        for update in observer.alpha_updates:
            assert update["new_alpha"] > update["old_alpha"]
        for update in observer.beta_updates:
            assert update["new_beta"] < update["old_beta"]

    def test_observer_event_counts_match_reported_statistics(self):
        game = TicTacToeGame()
        observer = _RecordingObserver()
        result = find_best_move(game, "X", observer=observer)
        assert len(observer.cutoffs) == result.alpha_beta_cutoffs
        assert len(observer.branches_pruned) == result.branches_pruned

    def test_cutoffs_and_branches_pruned_are_distinct_counts(self):
        # A single cutoff event can (and typically does) skip more than
        # one sibling branch, so branches_pruned >= alpha_beta_cutoffs.
        game = TicTacToeGame()
        result = find_best_move(game, "X")
        assert result.branches_pruned >= result.alpha_beta_cutoffs

    def test_no_pruning_possible_with_only_one_legal_move(self):
        # Exact hand-derivation: with exactly one legal move, there are
        # no remaining siblings to ever skip, regardless of alpha/beta.
        game = _play([(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0)])
        assert game.legal_moves() == [(2, 2)]
        result = find_best_move(game, "X")
        assert result.alpha_beta_cutoffs == 0
        assert result.branches_pruned == 0
        assert result.nodes_visited == 2  # root + the one terminal child, same as Minimax

    def test_empty_board_matches_independently_derived_benchmark_numbers(self):
        # Derived and verified by two independent real runs (see
        # docs/ALPHA_BETA_IMPLEMENTATION.md / docs/ALGORITHM_COMPARISON.md)
        # before being hardcoded here as a determinism/regression check.
        game = TicTacToeGame()
        result = find_best_move(game, "X")
        assert result.evaluation == 0
        assert result.best_move == (0, 0)
        assert result.nodes_visited == 20_866
        assert result.terminal_nodes == 8_453
        assert result.alpha_beta_cutoffs == 7_692
        assert result.branches_pruned == 7_788


# ---------------------------------------------------------------------------
# C. Consistency with Minimax
# ---------------------------------------------------------------------------

_REACHABLE_POSITIONS: list[list[tuple[int, int]]] = [
    [],
    [(1, 1)],
    [(0, 0)],
    [(0, 0), (1, 1)],
    [(1, 1), (0, 0)],
    [(0, 0), (1, 0), (0, 1), (1, 1)],
    [(0, 0), (1, 0), (0, 1)],
    [(1, 1), (0, 0), (2, 2)],
    [(0, 0), (0, 1), (1, 1), (1, 0)],
    [(0, 0), (1, 1), (2, 2), (0, 2)],
]


class TestConsistencyWithMinimax:
    @pytest.mark.parametrize("moves", _REACHABLE_POSITIONS, ids=lambda m: str(m))
    def test_evaluations_match_minimax_on_reachable_positions(self, moves):
        from app.algorithms import minimax

        game = _play(moves)
        if game.is_game_over:
            pytest.skip("terminal position, nothing to search")
        mm = minimax.find_best_move(game, game.current_player)
        ab = find_best_move(game, game.current_player)
        assert mm.evaluation == ab.evaluation
        assert ab.best_move in game.legal_moves()
        assert mm.best_move in game.legal_moves()

    @pytest.mark.parametrize("moves", _REACHABLE_POSITIONS, ids=lambda m: str(m))
    def test_best_moves_also_match_given_identical_ordering_and_tie_break(self, moves):
        # Not a correctness requirement by itself (see docs/ALGORITHM_COMPARISON.md
        # on same-value vs same-move), but with identical row-major
        # ordering and identical strict-greater-than tie-breaking, the
        # two baselines are expected to agree on the move too — this
        # test documents whether that expectation holds empirically.
        from app.algorithms import minimax

        game = _play(moves)
        if game.is_game_over:
            pytest.skip("terminal position, nothing to search")
        mm = minimax.find_best_move(game, game.current_player)
        ab = find_best_move(game, game.current_player)
        assert mm.best_move == ab.best_move


# ---------------------------------------------------------------------------
# D. State safety / determinism
# ---------------------------------------------------------------------------


class TestStateSafety:
    def test_original_game_snapshot_is_unchanged_after_search(self):
        game = _play([(0, 0), (1, 0), (0, 1)])
        before = game.to_dict()
        find_best_move(game, "O")
        assert game.to_dict() == before

    def test_repeated_execution_is_deterministic(self):
        game = _play([(0, 0), (1, 0), (0, 1)])
        first = find_best_move(game, "O")
        second = find_best_move(game, "O")
        assert first.best_move == second.best_move
        assert first.evaluation == second.evaluation
        assert first.nodes_visited == second.nodes_visited
        assert first.alpha_beta_cutoffs == second.alpha_beta_cutoffs
        assert first.branches_pruned == second.branches_pruned


# ---------------------------------------------------------------------------
# E. Statistics
# ---------------------------------------------------------------------------


class TestStatistics:
    def test_root_is_counted(self):
        result = find_best_move(TicTacToeGame(), "X")
        assert result.nodes_visited >= 1

    def test_terminal_nodes_are_counted(self):
        result = find_best_move(TicTacToeGame(), "X")
        assert result.terminal_nodes > 0
        assert result.leaves_evaluated == result.terminal_nodes

    def test_statistics_are_nonnegative_and_internally_consistent(self):
        result = find_best_move(TicTacToeGame(), "X")
        assert result.nodes_visited >= 0
        assert result.terminal_nodes >= 0
        assert result.moves_considered >= 0
        assert result.maximum_search_depth >= 0
        assert result.alpha_beta_cutoffs >= 0
        assert result.branches_pruned >= 0
        assert result.terminal_nodes <= result.nodes_visited
        assert result.execution_time_ms >= 0.0

    def test_stats_dataclass_defaults_are_zero(self):
        stats = AlphaBetaStats()
        assert (
            stats.nodes_visited
            == stats.terminal_nodes
            == stats.leaves_evaluated
            == stats.moves_considered
            == stats.maximum_search_depth
            == stats.alpha_beta_cutoffs
            == stats.branches_pruned
            == 0
        )

    def test_result_to_dict_and_str_do_not_raise(self):
        game = _play([(0, 0), (1, 0), (0, 1), (1, 1)])
        result = find_best_move(game, "X")
        assert isinstance(result, AlphaBetaResult)
        d = result.to_dict()
        assert d["best_move"] == {"row": 0, "col": 2}
        assert "alpha_beta_cutoffs" in d["statistics"]
        assert "branches_pruned" in d["statistics"]
        assert str(result)


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
    """Same exhaustive opponent-branching method as Minimax's Phase 5
    verification (see docs/MINIMAX_IMPLEMENTATION.md §11) and the same
    test-harness-only transposition cache, applied to Alpha-Beta."""
    counters.nodes_visited += 1

    if game.is_game_over:
        counters.terminal_leaves_checked += 1
        assert game.winner != ai_mark.opponent().value, (
            f"Alpha-Beta AI ({ai_mark.value}) lost! Final board: {game.board_flat}"
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
    def test_ai_as_x_never_loses_against_any_opponent_strategy(self):
        game = TicTacToeGame()
        counters = _ExhaustiveCounters()
        cache: dict[tuple[str, ...], tuple[int, int]] = {}
        _assert_ai_never_loses(game, Mark.X, counters, cache)
        print(
            f"\n[AlphaBeta exhaustive: AI=X] nodes_visited={counters.nodes_visited} "
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
            f"\n[AlphaBeta exhaustive: AI=O] nodes_visited={counters.nodes_visited} "
            f"terminal_leaves_checked={counters.terminal_leaves_checked} "
            f"distinct_ai_positions_searched={counters.ai_decisions_computed} "
            f"transposition_cache_hits={counters.ai_decisions_reused}"
        )
        assert counters.terminal_leaves_checked > 0

    def test_alpha_beta_versus_minimax_self_play_always_draws(self):
        from app.algorithms import minimax

        game = TicTacToeGame()
        turn = 0
        while not game.is_game_over:
            if turn % 2 == 0:
                result = find_best_move(game, game.current_player)
            else:
                result = minimax.find_best_move(game, game.current_player)
            game.make_move(*result.best_move)
            turn += 1
        assert game.status is GameStatus.DRAW
        assert game.winner is None
