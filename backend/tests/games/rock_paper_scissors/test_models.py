"""MixedStrategy construction and validation tests."""

from __future__ import annotations

import math

import pytest

from app.games.rock_paper_scissors import Action, MixedStrategy
from app.games.rock_paper_scissors.exceptions import InvalidMixedStrategyError

ROCK, PAPER, SCISSORS = Action.ROCK, Action.PAPER, Action.SCISSORS


class TestValidDistributions:
    def test_uniform_strategy(self):
        s = MixedStrategy.uniform()
        assert s.as_tuple() == pytest.approx((1 / 3, 1 / 3, 1 / 3))

    @pytest.mark.parametrize("action", [ROCK, PAPER, SCISSORS])
    def test_pure_strategy(self, action):
        s = MixedStrategy.pure(action)
        assert s.probability(action) == 1.0
        others = [a for a in (ROCK, PAPER, SCISSORS) if a != action]
        assert all(s.probability(a) == 0.0 for a in others)
        assert s.support() == (action,)

    def test_valid_biased_distribution(self):
        s = MixedStrategy.from_mapping({ROCK: 0.5, PAPER: 0.3, SCISSORS: 0.2})
        assert s.as_tuple() == pytest.approx((0.5, 0.3, 0.2))

    def test_sum_within_documented_tolerance_is_accepted(self):
        # 1e-9 is the documented tolerance; this sum is off by less than that.
        MixedStrategy.from_mapping({ROCK: 1 / 3, PAPER: 1 / 3, SCISSORS: 1 / 3})


class TestInvalidDistributions:
    def test_negative_probability_rejected(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_mapping({ROCK: -0.1, PAPER: 0.6, SCISSORS: 0.5})
        assert exc.value.reason == "negative_probability"

    def test_probability_above_one_rejected_via_sum(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_mapping({ROCK: 1.5, PAPER: 0.0, SCISSORS: 0.0})
        assert exc.value.reason == "sum_mismatch"

    def test_incorrect_number_of_entries_rejected(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_mapping({ROCK: 0.5, PAPER: 0.5})
        assert exc.value.reason == "wrong_actions"

    def test_sum_not_equal_to_one_rejected(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_mapping({ROCK: 0.2, PAPER: 0.2, SCISSORS: 0.2})
        assert exc.value.reason == "sum_mismatch"

    def test_nan_rejected(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_mapping({ROCK: math.nan, PAPER: 0.5, SCISSORS: 0.5})
        assert exc.value.reason == "not_finite"

    def test_infinity_rejected(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_mapping({ROCK: math.inf, PAPER: 0.5, SCISSORS: 0.5})
        assert exc.value.reason == "not_finite"

    def test_negative_infinity_rejected(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_mapping({ROCK: -math.inf, PAPER: 0.5, SCISSORS: 0.5})
        assert exc.value.reason in {"not_finite", "negative_probability"}

    def test_error_message_is_clear(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_mapping({ROCK: 0.5, PAPER: 0.6, SCISSORS: 0.1})
        assert "sum to 1" in str(exc.value)


class TestNormalization:
    def test_from_mapping_never_silently_normalizes(self):
        # A distribution that sums to 1.2 must be rejected outright, not
        # silently rescaled — normalization only ever happens via the
        # explicitly-named from_unnormalized().
        with pytest.raises(InvalidMixedStrategyError):
            MixedStrategy.from_mapping({ROCK: 0.5, PAPER: 0.5, SCISSORS: 0.2})

    def test_from_unnormalized_explicitly_rescales(self):
        s = MixedStrategy.from_unnormalized({ROCK: 2, PAPER: 1, SCISSORS: 1})
        assert s.as_tuple() == pytest.approx((0.5, 0.25, 0.25))

    def test_from_unnormalized_rejects_all_zero_weights(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_unnormalized({ROCK: 0, PAPER: 0, SCISSORS: 0})
        assert exc.value.reason == "zero_total_weight"

    def test_from_unnormalized_rejects_negative_weights(self):
        with pytest.raises(InvalidMixedStrategyError) as exc:
            MixedStrategy.from_unnormalized({ROCK: -1, PAPER: 1, SCISSORS: 1})
        assert exc.value.reason == "invalid_weight"
