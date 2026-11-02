"""Expected payoff, best response, and exploitability tests."""

from __future__ import annotations

import pytest

from app.games.rock_paper_scissors import (
    Action,
    MixedStrategy,
    Player,
    best_response,
    exploitability,
    expected_payoff_a,
    expected_payoff_b,
)

ROCK, PAPER, SCISSORS = Action.ROCK, Action.PAPER, Action.SCISSORS


def pure(action: Action) -> MixedStrategy:
    return MixedStrategy.pure(action)


class TestExpectedPayoffPureVsPure:
    def test_rock_vs_scissors(self):
        assert expected_payoff_a(pure(ROCK), pure(SCISSORS)) == 1
        assert expected_payoff_b(pure(ROCK), pure(SCISSORS)) == -1

    def test_rock_vs_rock_ties(self):
        assert expected_payoff_a(pure(ROCK), pure(ROCK)) == 0

    def test_paper_vs_rock(self):
        assert expected_payoff_a(pure(PAPER), pure(ROCK)) == 1


class TestExpectedPayoffPureVsMixed:
    def test_rock_vs_uniform_is_zero(self):
        # Hand-calculable: (1/3)*0 + (1/3)*(-1) + (1/3)*1 = 0
        assert expected_payoff_a(pure(ROCK), MixedStrategy.uniform()) == pytest.approx(0.0)

    def test_rock_vs_biased_toward_scissors(self):
        # B plays Scissors 100% -> A (Rock) wins every time -> payoff 1.
        biased = MixedStrategy.from_mapping({ROCK: 0.0, PAPER: 0.0, SCISSORS: 1.0})
        assert expected_payoff_a(pure(ROCK), biased) == pytest.approx(1.0)

    def test_rock_vs_half_paper_half_scissors(self):
        # Hand-calculable: 0.5*(-1) + 0.5*(1) = 0
        half = MixedStrategy.from_mapping({ROCK: 0.0, PAPER: 0.5, SCISSORS: 0.5})
        assert expected_payoff_a(pure(ROCK), half) == pytest.approx(0.0)


class TestExpectedPayoffMixedVsPure:
    def test_uniform_vs_rock_is_zero(self):
        assert expected_payoff_a(MixedStrategy.uniform(), pure(ROCK)) == pytest.approx(0.0)

    def test_biased_vs_rock(self):
        # A plays Paper 100% against B's Rock -> A always wins -> payoff 1.
        biased = MixedStrategy.from_mapping({ROCK: 0.0, PAPER: 1.0, SCISSORS: 0.0})
        assert expected_payoff_a(biased, pure(ROCK)) == pytest.approx(1.0)


class TestExpectedPayoffMixedVsMixed:
    def test_uniform_equilibrium_payoff_is_zero(self):
        u = MixedStrategy.uniform()
        assert expected_payoff_a(u, u) == pytest.approx(0.0, abs=1e-9)
        assert expected_payoff_b(u, u) == pytest.approx(0.0, abs=1e-9)

    def test_hand_calculated_mixed_vs_mixed(self):
        # A = (0.5, 0.5, 0.0), B = (0.0, 0.5, 0.5)
        # p^T A q = sum over a,b of p(a) * M[a][b] * q(b)
        # Only nonzero p(a): ROCK(0.5), PAPER(0.5). Only nonzero q(b): PAPER(0.5), SCISSORS(0.5).
        # ROCK vs PAPER = -1 * 0.5*0.5 = -0.25
        # ROCK vs SCISSORS = 1 * 0.5*0.5 = 0.25
        # PAPER vs PAPER = 0 * 0.5*0.5 = 0
        # PAPER vs SCISSORS = -1 * 0.5*0.5 = -0.25
        # total = -0.25 + 0.25 + 0 - 0.25 = -0.25
        a = MixedStrategy.from_mapping({ROCK: 0.5, PAPER: 0.5, SCISSORS: 0.0})
        b = MixedStrategy.from_mapping({ROCK: 0.0, PAPER: 0.5, SCISSORS: 0.5})
        assert expected_payoff_a(a, b) == pytest.approx(-0.25)
        assert expected_payoff_b(a, b) == pytest.approx(0.25)


class TestBestResponse:
    def test_best_response_to_pure_rock_is_paper(self):
        result = best_response(Player.A, pure(ROCK))
        assert result.best_actions == (PAPER,)
        assert result.is_tied is False
        assert result.payoffs[PAPER] == pytest.approx(1.0)

    def test_best_response_to_pure_paper_is_scissors(self):
        result = best_response(Player.A, pure(PAPER))
        assert result.best_actions == (SCISSORS,)

    def test_best_response_to_pure_scissors_is_rock(self):
        result = best_response(Player.A, pure(SCISSORS))
        assert result.best_actions == (ROCK,)

    def test_best_response_to_uniform_is_a_three_way_tie(self):
        result = best_response(Player.A, MixedStrategy.uniform())
        assert set(result.best_actions) == {ROCK, PAPER, SCISSORS}
        assert result.is_tied is True
        for action in (ROCK, PAPER, SCISSORS):
            assert result.payoffs[action] == pytest.approx(0.0, abs=1e-9)

    def test_best_response_to_biased_strategy(self):
        # B heavily favors Rock -> A's best response is Paper.
        biased = MixedStrategy.from_mapping({ROCK: 0.8, PAPER: 0.1, SCISSORS: 0.1})
        result = best_response(Player.A, biased)
        assert result.best_actions == (PAPER,)
        assert result.is_tied is False

    def test_tied_best_response_preserves_full_set(self):
        # A strategy equidistant between favoring two responses equally.
        # (0, 0.5, 0.5): Rock payoff = 0.5*(-1)+0.5*(1) = 0; Paper = 0.5*0+0.5*(-1) = -0.5; Scissors = 0.5*1+0.5*0=0.5
        tricky = MixedStrategy.from_mapping({ROCK: 0.0, PAPER: 0.5, SCISSORS: 0.5})
        result = best_response(Player.A, tricky)
        assert result.best_actions == (SCISSORS,)  # sanity: unique best response here

    def test_best_response_respects_player_b_perspective(self):
        # If A plays pure Rock, B's best response should be Paper too
        # (Paper beats Rock, same winning action regardless of seat).
        result = best_response(Player.B, pure(ROCK))
        assert result.best_actions == (PAPER,)


class TestExploitability:
    def test_uniform_strategy_is_not_exploitable(self):
        result = exploitability(MixedStrategy.uniform(), Player.A)
        assert result.exploitability == pytest.approx(0.0, abs=1e-9)

    def test_pure_rock_is_exploitable(self):
        result = exploitability(pure(ROCK), Player.A)
        assert result.exploitability == pytest.approx(1.0)
        assert result.opponent_best_response.best_actions == (PAPER,)

    def test_biased_strategy_is_exploitable(self):
        biased = MixedStrategy.from_mapping({ROCK: 0.6, PAPER: 0.2, SCISSORS: 0.2})
        result = exploitability(biased, Player.A)
        assert result.exploitability > 0

    def test_best_response_achieves_the_documented_exploitability(self):
        biased = MixedStrategy.from_mapping({ROCK: 0.6, PAPER: 0.2, SCISSORS: 0.2})
        result = exploitability(biased, Player.A)
        # The opponent's best-response value itself, minus the equilibrium
        # value (0), must equal the reported exploitability exactly.
        assert result.opponent_best_response.best_value - 0.0 == pytest.approx(result.exploitability)

    def test_exploitability_is_never_negative(self):
        for probs in (
            {ROCK: 1.0, PAPER: 0.0, SCISSORS: 0.0},
            {ROCK: 0.0, PAPER: 1.0, SCISSORS: 0.0},
            {ROCK: 0.4, PAPER: 0.4, SCISSORS: 0.2},
            {ROCK: 1 / 3, PAPER: 1 / 3, SCISSORS: 1 / 3},
        ):
            strategy = MixedStrategy.from_mapping(probs)
            result = exploitability(strategy, Player.A)
            assert result.exploitability >= -1e-9
