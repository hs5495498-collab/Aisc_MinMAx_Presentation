"""Payoff matrix and round-resolution tests."""

from __future__ import annotations

import pytest

from app.games.rock_paper_scissors import Action, RoundOutcome, payoff_a, payoff_b, resolve_round
from app.games.rock_paper_scissors.exceptions import InvalidActionError

ALL_ACTIONS = (Action.ROCK, Action.PAPER, Action.SCISSORS)

EXPECTED_PAYOFF_A = {
    (Action.ROCK, Action.ROCK): 0,
    (Action.ROCK, Action.PAPER): -1,
    (Action.ROCK, Action.SCISSORS): 1,
    (Action.PAPER, Action.ROCK): 1,
    (Action.PAPER, Action.PAPER): 0,
    (Action.PAPER, Action.SCISSORS): -1,
    (Action.SCISSORS, Action.ROCK): -1,
    (Action.SCISSORS, Action.PAPER): 1,
    (Action.SCISSORS, Action.SCISSORS): 0,
}


class TestPayoffMatrix:
    @pytest.mark.parametrize("pair,expected", EXPECTED_PAYOFF_A.items())
    def test_all_nine_combinations(self, pair, expected):
        a, b = pair
        assert payoff_a(a, b) == expected

    @pytest.mark.parametrize("a,b", [(a, b) for a in ALL_ACTIONS for b in ALL_ACTIONS])
    def test_zero_sum_consistency(self, a, b):
        assert payoff_b(a, b) == -payoff_a(a, b)

    @pytest.mark.parametrize("action", ALL_ACTIONS)
    def test_ties_are_zero(self, action):
        assert payoff_a(action, action) == 0

    def test_matrix_is_skew_symmetric_under_swapping_players(self):
        # payoff_a(x, y) == -payoff_a(y, x): swapping who's "A" and who's
        # "B" while keeping the same two actions negates the payoff.
        for a in ALL_ACTIONS:
            for b in ALL_ACTIONS:
                assert payoff_a(a, b) == -payoff_a(b, a)

    def test_invalid_action_rejected(self):
        with pytest.raises(InvalidActionError):
            payoff_a("ROCK", Action.PAPER)  # plain string, not an Action

    def test_invalid_action_rejected_for_second_argument(self):
        with pytest.raises(InvalidActionError):
            payoff_a(Action.ROCK, "not-an-action")


class TestResolveRound:
    def test_rock_beats_scissors(self):
        assert resolve_round(Action.ROCK, Action.SCISSORS) is RoundOutcome.A_WINS

    def test_scissors_beats_paper(self):
        assert resolve_round(Action.SCISSORS, Action.PAPER) is RoundOutcome.A_WINS

    def test_paper_beats_rock(self):
        assert resolve_round(Action.PAPER, Action.ROCK) is RoundOutcome.A_WINS

    @pytest.mark.parametrize("action", ALL_ACTIONS)
    def test_identical_actions_tie(self, action):
        assert resolve_round(action, action) is RoundOutcome.TIE

    def test_losing_outcome_from_a_perspective(self):
        assert resolve_round(Action.SCISSORS, Action.ROCK) is RoundOutcome.B_WINS
