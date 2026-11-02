"""Nash equilibrium derivation and verification tests."""

from __future__ import annotations

from fractions import Fraction

import pytest

from app.games.rock_paper_scissors import (
    Action,
    MixedStrategy,
    derive_uniform_equilibrium,
    exact_game_value_at_uniform,
    verify_equilibrium,
)

ROCK, PAPER, SCISSORS = Action.ROCK, Action.PAPER, Action.SCISSORS


class TestDerivation:
    def test_derives_the_uniform_strategy(self):
        strategy = derive_uniform_equilibrium()
        assert strategy.as_tuple() == pytest.approx((1 / 3, 1 / 3, 1 / 3))

    def test_exact_game_value_is_precisely_zero(self):
        # Exact rational arithmetic — no floating-point tolerance needed,
        # the equality is exact.
        assert exact_game_value_at_uniform() == Fraction(0, 1)


class TestVerification:
    def test_uniform_vs_uniform_is_a_nash_equilibrium(self):
        u = MixedStrategy.uniform()
        result = verify_equilibrium(u, u)
        assert result.is_equilibrium is True
        assert result.a_plays_only_best_responses is True
        assert result.b_plays_only_best_responses is True

    def test_equilibrium_expected_payoff_is_zero_for_both(self):
        u = MixedStrategy.uniform()
        result = verify_equilibrium(u, u)
        assert result.value_a == pytest.approx(0.0, abs=1e-9)
        assert result.value_b == pytest.approx(0.0, abs=1e-9)

    def test_no_unilateral_deviation_by_a_improves_payoff(self):
        u = MixedStrategy.uniform()
        result = verify_equilibrium(u, u)
        best_possible_for_a = result.best_response_a.best_value
        # A's actual equilibrium payoff must equal the best any deviation could achieve.
        assert result.value_a == pytest.approx(best_possible_for_a, abs=1e-9)

    def test_no_unilateral_deviation_by_b_improves_payoff(self):
        u = MixedStrategy.uniform()
        result = verify_equilibrium(u, u)
        best_possible_for_b = result.best_response_b.best_value
        assert result.value_b == pytest.approx(best_possible_for_b, abs=1e-9)

    def test_always_rock_fails_verification(self):
        pure_rock = MixedStrategy.pure(ROCK)
        result = verify_equilibrium(pure_rock, pure_rock)
        assert result.is_equilibrium is False

    def test_biased_candidate_fails_verification(self):
        biased = MixedStrategy.from_mapping({ROCK: 0.5, PAPER: 0.3, SCISSORS: 0.2})
        result = verify_equilibrium(biased, biased)
        assert result.is_equilibrium is False
        # At least one side must not be playing only best responses.
        assert not (result.a_plays_only_best_responses and result.b_plays_only_best_responses)

    def test_asymmetric_candidate_where_only_one_side_deviates_fails(self):
        u = MixedStrategy.uniform()
        pure_rock = MixedStrategy.pure(ROCK)
        result = verify_equilibrium(pure_rock, u)
        assert result.is_equilibrium is False
