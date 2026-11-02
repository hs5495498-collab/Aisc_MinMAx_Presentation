"""Comprehensive tests for the pure-Python Tic-Tac-Toe engine.

Run from the ``backend/`` directory with: ``pytest``
"""

from __future__ import annotations

from itertools import combinations

import pytest

from app.games.tic_tac_toe import (
    GameAlreadyOverError,
    GameStatus,
    InvalidPositionError,
    Mark,
    NoMovesToUndoError,
    OccupiedCellError,
    TicTacToeGame,
    WrongPlayerError,
)
from app.games.tic_tac_toe.engine import WINNING_LINES

ALL_CELLS = [(r, c) for r in range(3) for c in range(3)]


def _safe_filler_for(target_line: tuple, count: int) -> list[tuple[int, int]]:
    """``count`` cells, disjoint from ``target_line``, that do not themselves
    complete any winning line — used to build an O-win sequence where X's
    moves can never accidentally end the game early."""
    remaining = [cell for cell in ALL_CELLS if cell not in target_line]
    for combo in combinations(remaining, count):
        combo_set = set(combo)
        if not any(set(line).issubset(combo_set) for line in WINNING_LINES):
            return list(combo)
    raise AssertionError("no safe filler found — test setup bug")  # pragma: no cover


# ---------------------------------------------------------------------------
# Initialization
# ---------------------------------------------------------------------------


class TestInitialization:
    def test_board_is_empty(self):
        game = TicTacToeGame()
        assert game.board_flat == [""] * 9
        assert game.board == [["", "", ""], ["", "", ""], ["", "", ""]]

    def test_x_starts_first(self):
        game = TicTacToeGame()
        assert game.current_player == "X"

    def test_initial_status_in_progress(self):
        game = TicTacToeGame()
        assert game.status is GameStatus.IN_PROGRESS
        assert game.is_game_over is False
        assert game.winner is None
        assert game.winning_line is None

    def test_empty_history(self):
        game = TicTacToeGame()
        assert game.history == ()
        assert game.move_count == 0
        assert game.last_move is None


# ---------------------------------------------------------------------------
# Move validation
# ---------------------------------------------------------------------------


class TestMoveValidation:
    def test_valid_move_updates_board(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        assert game.board_flat[0] == "X"
        assert game.current_player == "O"

    def test_negative_row_raises(self):
        game = TicTacToeGame()
        with pytest.raises(InvalidPositionError):
            game.make_move(-1, 0)

    def test_row_greater_than_two_raises(self):
        game = TicTacToeGame()
        with pytest.raises(InvalidPositionError):
            game.make_move(3, 0)

    def test_negative_col_raises(self):
        game = TicTacToeGame()
        with pytest.raises(InvalidPositionError):
            game.make_move(0, -1)

    def test_col_greater_than_two_raises(self):
        game = TicTacToeGame()
        with pytest.raises(InvalidPositionError):
            game.make_move(0, 3)

    def test_occupied_cell_raises(self):
        game = TicTacToeGame()
        game.make_move(1, 1)
        with pytest.raises(OccupiedCellError):
            game.make_move(1, 1)

    def test_wrong_player_raises(self):
        game = TicTacToeGame()
        # X moves first; claiming to be O on move 1 is wrong.
        with pytest.raises(WrongPlayerError):
            game.make_move(0, 0, player="O")

    def test_wrong_player_string_and_enum_both_detected(self):
        game = TicTacToeGame()
        with pytest.raises(WrongPlayerError):
            game.make_move(0, 0, player=Mark.O)

    def test_move_after_completion_raises(self):
        game = TicTacToeGame()
        for row, col in [(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)]:  # X wins top row
            game.make_move(row, col)
        assert game.status is GameStatus.X_WON
        with pytest.raises(GameAlreadyOverError):
            game.make_move(2, 2)

    def test_invalid_move_leaves_state_unchanged(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        snapshot_board = game.board_flat
        snapshot_player = game.current_player
        snapshot_count = game.move_count

        with pytest.raises(OccupiedCellError):
            game.make_move(0, 0)

        assert game.board_flat == snapshot_board
        assert game.current_player == snapshot_player
        assert game.move_count == snapshot_count


# ---------------------------------------------------------------------------
# Win detection — parametrized across all 8 lines, for X and for O
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("line", WINNING_LINES, ids=lambda line: str(line))
class TestWinDetectionX:
    def test_x_wins_line(self, line):
        target = list(line)
        filler = [cell for cell in ALL_CELLS if cell not in target][:2]

        game = TicTacToeGame()
        game.make_move(*target[0])  # X
        game.make_move(*filler[0])  # O
        game.make_move(*target[1])  # X
        game.make_move(*filler[1])  # O
        game.make_move(*target[2])  # X, completes the line

        assert game.status is GameStatus.X_WON
        assert game.winner == "X"
        assert game.is_game_over is True
        assert set(map(tuple, game.winning_line)) == set(target)


@pytest.mark.parametrize("line", WINNING_LINES, ids=lambda line: str(line))
class TestWinDetectionO:
    def test_o_wins_line(self, line):
        target = list(line)
        filler = _safe_filler_for(line, 3)

        game = TicTacToeGame()
        game.make_move(*filler[0])  # X
        game.make_move(*target[0])  # O
        game.make_move(*filler[1])  # X
        game.make_move(*target[1])  # O
        game.make_move(*filler[2])  # X
        game.make_move(*target[2])  # O, completes the line

        assert game.status is GameStatus.O_WON
        assert game.winner == "O"
        assert game.is_game_over is True
        assert set(map(tuple, game.winning_line)) == set(target)


def test_full_board_is_not_confused_with_a_win():
    """A full board that happens to contain no 3-in-a-row is a draw, not a win."""
    game = TicTacToeGame()
    # Verified draw layout (see TestDrawDetection.test_draw_scenario_one):
    # X = {(0,0),(0,2),(1,0),(2,1),(2,2)}, O = {(0,1),(1,1),(1,2),(2,0)} — no line is all-same-mark.
    for row, col in [(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0), (2, 2)]:
        game.make_move(row, col)
    assert game.status is GameStatus.DRAW
    assert game.winner is None


# ---------------------------------------------------------------------------
# Draw detection
# ---------------------------------------------------------------------------


class TestDrawDetection:
    def test_draw_scenario_one(self):
        moves = [
            (0, 0),  # X
            (0, 1),  # O
            (0, 2),  # X
            (1, 1),  # O
            (1, 0),  # X
            (1, 2),  # O
            (2, 1),  # X
            (2, 0),  # O
            (2, 2),  # X
        ]
        game = TicTacToeGame()
        for row, col in moves:
            game.make_move(row, col)
        assert game.status is GameStatus.DRAW
        assert game.winner is None
        assert game.is_game_over is True

    def test_draw_scenario_two(self):
        moves = [
            (0, 1),  # X
            (0, 0),  # O
            (0, 2),  # X
            (1, 1),  # O
            (1, 0),  # X
            (1, 2),  # O
            (2, 0),  # X
            (2, 1),  # O
            (2, 2),  # X
        ]
        game = TicTacToeGame()
        for row, col in moves:
            game.make_move(row, col)
        assert game.status is GameStatus.DRAW
        assert game.winner is None
        assert game.is_game_over is True


# ---------------------------------------------------------------------------
# State transitions
# ---------------------------------------------------------------------------


class TestStateTransitions:
    def test_turn_switches_after_each_move(self):
        game = TicTacToeGame()
        assert game.current_player == "X"
        game.make_move(0, 0)
        assert game.current_player == "O"
        game.make_move(0, 1)
        assert game.current_player == "X"

    def test_move_count_increments(self):
        game = TicTacToeGame()
        assert game.move_count == 0
        game.make_move(0, 0)
        assert game.move_count == 1
        game.make_move(1, 1)
        assert game.move_count == 2

    def test_last_move_tracks_most_recent(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        assert game.last_move.row == 0 and game.last_move.col == 0 and game.last_move.player is Mark.X
        game.make_move(1, 1)
        assert game.last_move.row == 1 and game.last_move.col == 1 and game.last_move.player is Mark.O

    def test_correct_terminal_state_on_win(self):
        game = TicTacToeGame()
        for row, col in [(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)]:
            game.make_move(row, col)
        assert game.status is GameStatus.X_WON
        assert game.winner == "X"

    def test_no_turn_switch_after_game_completion(self):
        game = TicTacToeGame()
        for row, col in [(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)]:
            game.make_move(row, col)
        # X made the winning move; current_player should not have advanced to O.
        assert game.current_player == "X"


# ---------------------------------------------------------------------------
# Undo
# ---------------------------------------------------------------------------


class TestUndo:
    def test_undo_one_move(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        game.undo()
        assert game.board_flat == [""] * 9
        assert game.current_player == "X"
        assert game.move_count == 0
        assert game.status is GameStatus.IN_PROGRESS

    def test_undo_multiple_moves(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        game.make_move(1, 1)
        game.make_move(0, 1)
        game.undo()
        game.undo()
        assert game.move_count == 1
        assert game.board_flat[0] == "X"
        assert game.current_player == "O"

    def test_undo_after_win_restores_in_progress(self):
        game = TicTacToeGame()
        for row, col in [(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)]:
            game.make_move(row, col)
        assert game.status is GameStatus.X_WON

        game.undo()

        assert game.status is GameStatus.IN_PROGRESS
        assert game.winner is None
        assert game.winning_line is None
        assert game.current_player == "X"
        assert game.move_count == 4
        # The winning cell is empty again and can be legally replayed.
        game.make_move(0, 2)
        assert game.status is GameStatus.X_WON

    def test_undo_after_draw_restores_in_progress(self):
        game = TicTacToeGame()
        moves = [(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0), (2, 2)]
        for row, col in moves:
            game.make_move(row, col)
        assert game.status is GameStatus.DRAW

        game.undo()

        assert game.status is GameStatus.IN_PROGRESS
        assert game.winner is None
        assert game.move_count == 8
        assert game.board_flat[8] == ""  # (2, 2) is empty again

    def test_undo_with_empty_history_raises(self):
        game = TicTacToeGame()
        with pytest.raises(NoMovesToUndoError):
            game.undo()

    def test_undo_restores_exact_prior_board_and_turn(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        board_after_first_move = game.board_flat
        game.make_move(1, 1)
        game.undo()
        assert game.board_flat == board_after_first_move
        assert game.current_player == "O"


# ---------------------------------------------------------------------------
# Restart / reset
# ---------------------------------------------------------------------------


class TestRestartAndReset:
    def test_restart_unfinished_game(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        game.make_move(1, 1)
        game.restart()
        assert game.board_flat == [""] * 9
        assert game.current_player == "X"
        assert game.status is GameStatus.IN_PROGRESS
        assert game.history == ()

    def test_restart_won_game(self):
        game = TicTacToeGame()
        for row, col in [(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)]:
            game.make_move(row, col)
        assert game.status is GameStatus.X_WON
        game.restart()
        assert game.status is GameStatus.IN_PROGRESS
        assert game.winner is None
        assert game.board_flat == [""] * 9
        assert game.history == ()

    def test_restart_drawn_game(self):
        game = TicTacToeGame()
        moves = [(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0), (2, 2)]
        for row, col in moves:
            game.make_move(row, col)
        assert game.status is GameStatus.DRAW
        game.restart()
        assert game.status is GameStatus.IN_PROGRESS
        assert game.board_flat == [""] * 9
        assert game.history == ()

    def test_restart_clears_all_history(self):
        game = TicTacToeGame()
        for row, col in [(0, 0), (1, 1), (0, 1)]:
            game.make_move(row, col)
        assert game.move_count == 3
        game.restart()
        assert game.move_count == 0
        assert game.last_move is None

    def test_reset_is_documented_alias_of_restart(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        game.reset()
        assert game.board_flat == [""] * 9
        assert game.current_player == "X"
        assert game.status is GameStatus.IN_PROGRESS
        assert game.history == ()


# ---------------------------------------------------------------------------
# State safety — public accessors cannot corrupt internal state
# ---------------------------------------------------------------------------


class TestStateSafety:
    def test_mutating_returned_board_rows_does_not_affect_engine(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        rows = game.board
        rows[0][0] = "O"
        rows.append(["Z", "Z", "Z"])
        assert game.board[0][0] == "X"
        assert len(game.board) == 3

    def test_mutating_returned_flat_board_does_not_affect_engine(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        flat = game.board_flat
        flat[0] = "O"
        flat.clear()
        assert game.board_flat[0] == "X"
        assert len(game.board_flat) == 9

    def test_history_tuple_cannot_be_appended_to(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        history = game.history
        with pytest.raises(AttributeError):
            history.append("not a real move")  # tuples have no .append

    def test_move_dataclass_is_frozen(self):
        game = TicTacToeGame()
        game.make_move(0, 0)
        move = game.last_move
        with pytest.raises(Exception):
            move.row = 99  # frozen dataclass must reject attribute mutation

    def test_invalid_move_does_not_mutate_history_or_board(self):
        game = TicTacToeGame()
        game.make_move(1, 1)
        history_before = game.history
        board_before = game.board_flat
        with pytest.raises(InvalidPositionError):
            game.make_move(5, 5)
        assert game.history == history_before
        assert game.board_flat == board_before


# ---------------------------------------------------------------------------
# Serialization — JSON-compatible snapshot (section 8 of the Phase 4 brief)
# ---------------------------------------------------------------------------


class TestSerialization:
    def test_to_dict_shape_on_fresh_game(self):
        game = TicTacToeGame()
        state = game.to_dict()
        assert state == {
            "board": [""] * 9,
            "current_player": "X",
            "status": "IN_PROGRESS",
            "winner": None,
            "move_count": 0,
            "last_move": None,
            "move_history": [],
            "winning_line": None,
        }

    def test_to_dict_after_win_includes_winning_line(self):
        game = TicTacToeGame()
        for row, col in [(0, 0), (1, 0), (0, 1), (1, 1), (0, 2)]:
            game.make_move(row, col)
        state = game.to_dict()
        assert state["status"] == "X_WON"
        assert state["winner"] == "X"
        assert state["winning_line"] == [[0, 0], [0, 1], [0, 2]]
        assert state["move_count"] == 5
        assert len(state["move_history"]) == 5
        assert state["last_move"]["position"] == 2  # (0, 2) -> row*3+col
