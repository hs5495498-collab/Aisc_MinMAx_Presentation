"""Tests for the four selectable AI opponent strategies."""

from __future__ import annotations

import pytest

from app.games.rock_paper_scissors import (
    Action,
    AIStrategyConfig,
    AIStrategyKind,
    InvalidMatchConfigError,
    InvalidMixedStrategyError,
)

ROCK, PAPER, SCISSORS = Action.ROCK, Action.PAPER, Action.SCISSORS


class TestNashUniform:
    def test_resolves_to_exact_thirds(self):
        strategy = AIStrategyConfig(kind=AIStrategyKind.NASH_UNIFORM).resolve()
        assert strategy.as_tuple() == pytest.approx((1 / 3, 1 / 3, 1 / 3))

    def test_explanation_matches_the_documented_wording(self):
        explanation = AIStrategyConfig(kind=AIStrategyKind.NASH_UNIFORM).explanation()
        assert "cannot be exploited in expectation" in explanation
        assert "does not guarantee" in explanation


class TestRandomUniform:
    def test_resolves_to_the_same_distribution_as_nash_uniform(self):
        nash = AIStrategyConfig(kind=AIStrategyKind.NASH_UNIFORM).resolve()
        rand = AIStrategyConfig(kind=AIStrategyKind.RANDOM_UNIFORM).resolve()
        assert rand.as_tuple() == nash.as_tuple()

    def test_explanation_states_it_is_mathematically_identical_to_nash(self):
        explanation = AIStrategyConfig(kind=AIStrategyKind.RANDOM_UNIFORM).explanation()
        assert "same probability distribution as the Nash equilibrium" in explanation
        assert "play identically" in explanation


class TestCustomStrategy:
    def test_valid_custom_distribution_resolves_correctly(self):
        config = AIStrategyConfig(
            kind=AIStrategyKind.CUSTOM,
            custom_probabilities={ROCK: 0.5, PAPER: 0.3, SCISSORS: 0.2},
        )
        assert config.resolve().as_tuple() == pytest.approx((0.5, 0.3, 0.2))

    def test_custom_without_probabilities_is_rejected(self):
        with pytest.raises(InvalidMatchConfigError):
            AIStrategyConfig(kind=AIStrategyKind.CUSTOM)

    def test_custom_with_negative_probability_is_rejected(self):
        config = AIStrategyConfig(
            kind=AIStrategyKind.CUSTOM,
            custom_probabilities={ROCK: -0.1, PAPER: 0.6, SCISSORS: 0.5},
        )
        with pytest.raises(InvalidMixedStrategyError):
            config.resolve()

    def test_custom_with_sum_not_equal_to_one_is_rejected(self):
        config = AIStrategyConfig(
            kind=AIStrategyKind.CUSTOM,
            custom_probabilities={ROCK: 0.5, PAPER: 0.5, SCISSORS: 0.5},
        )
        with pytest.raises(InvalidMixedStrategyError):
            config.resolve()

    def test_custom_is_never_silently_normalized(self):
        # A sum of 1.3 must be rejected outright, never silently rescaled.
        config = AIStrategyConfig(
            kind=AIStrategyKind.CUSTOM,
            custom_probabilities={ROCK: 0.5, PAPER: 0.5, SCISSORS: 0.3},
        )
        with pytest.raises(InvalidMixedStrategyError):
            config.resolve()

    def test_explanation_reports_the_configured_probabilities(self):
        config = AIStrategyConfig(
            kind=AIStrategyKind.CUSTOM,
            custom_probabilities={ROCK: 0.5, PAPER: 0.3, SCISSORS: 0.2},
        )
        explanation = config.explanation()
        assert "50%" in explanation and "30%" in explanation and "20%" in explanation


class TestBiasedDemoStrategy:
    def test_default_bias_is_seventy_twenty_ten(self):
        strategy = AIStrategyConfig(kind=AIStrategyKind.BIASED_DEMO).resolve()
        assert strategy.as_tuple() == pytest.approx((0.7, 0.2, 0.1))

    def test_custom_bias_can_override_the_default(self):
        config = AIStrategyConfig(
            kind=AIStrategyKind.BIASED_DEMO,
            biased_demo_probabilities={ROCK: 0.4, PAPER: 0.4, SCISSORS: 0.2},
        )
        assert config.resolve().as_tuple() == pytest.approx((0.4, 0.4, 0.2))

    def test_explanation_never_claims_optimality(self):
        explanation = AIStrategyConfig(kind=AIStrategyKind.BIASED_DEMO).explanation()
        assert "not an optimal strategy" in explanation or "not optimal" in explanation.lower()
