"""Strategy generation and random-sampling tests.

Statistical bounds here are intentionally loose (thousands of samples,
generous tolerance) to avoid flaky tests — see the Phase 8 brief's
explicit instruction not to write unnecessarily tight statistical checks.
"""

from __future__ import annotations

import random
from collections import Counter

import pytest

from app.games.rock_paper_scissors import Action, MixedStrategy, sample_action, sample_actions, uniform_strategy, validated_strategy

ROCK, PAPER, SCISSORS = Action.ROCK, Action.PAPER, Action.SCISSORS


class TestGeneration:
    def test_uniform_strategy_returns_equal_thirds(self):
        s = uniform_strategy()
        assert s.as_tuple() == pytest.approx((1 / 3, 1 / 3, 1 / 3))

    def test_validated_strategy_accepts_a_valid_distribution(self):
        s = validated_strategy({ROCK: 0.5, PAPER: 0.3, SCISSORS: 0.2})
        assert s.as_tuple() == pytest.approx((0.5, 0.3, 0.2))

    def test_validated_strategy_rejects_an_invalid_distribution(self):
        from app.games.rock_paper_scissors.exceptions import InvalidMixedStrategyError

        with pytest.raises(InvalidMixedStrategyError):
            validated_strategy({ROCK: 0.9, PAPER: 0.9, SCISSORS: 0.0})


class TestSeedReproducibility:
    def test_same_seed_produces_the_same_sequence(self):
        strategy = uniform_strategy()
        first = sample_actions(strategy, random.Random(1234), 50)
        second = sample_actions(strategy, random.Random(1234), 50)
        assert first == second

    def test_different_seeds_can_produce_different_sequences(self):
        strategy = uniform_strategy()
        first = sample_actions(strategy, random.Random(1), 50)
        second = sample_actions(strategy, random.Random(2), 50)
        assert first != second

    def test_sampling_never_touches_global_random_state(self):
        # Seed the global `random` module distinctly, then confirm our
        # injected-RNG sampling is unaffected by (and doesn't affect) it.
        random.seed(999)
        global_state_before = random.getstate()
        sample_actions(uniform_strategy(), random.Random(7), 20)
        assert random.getstate() == global_state_before


class TestSampledActionsAreValid:
    def test_single_sample_is_a_valid_action(self):
        action = sample_action(uniform_strategy(), random.Random(0))
        assert action in (ROCK, PAPER, SCISSORS)

    def test_many_samples_are_all_valid_actions(self):
        actions = sample_actions(uniform_strategy(), random.Random(0), 200)
        assert all(a in (ROCK, PAPER, SCISSORS) for a in actions)

    def test_pure_strategy_always_samples_the_same_action(self):
        strategy = MixedStrategy.pure(PAPER)
        actions = sample_actions(strategy, random.Random(0), 100)
        assert set(actions) == {PAPER}


class TestEmpiricalFrequencies:
    def test_uniform_strategy_frequencies_approach_one_third_each(self):
        actions = sample_actions(uniform_strategy(), random.Random(42), 6000)
        counts = Counter(actions)
        for action in (ROCK, PAPER, SCISSORS):
            frequency = counts[action] / len(actions)
            assert frequency == pytest.approx(1 / 3, abs=0.03)  # generous, non-flaky tolerance

    def test_biased_strategy_frequencies_approach_the_supplied_probabilities(self):
        strategy = MixedStrategy.from_mapping({ROCK: 0.7, PAPER: 0.2, SCISSORS: 0.1})
        actions = sample_actions(strategy, random.Random(7), 6000)
        counts = Counter(actions)
        n = len(actions)
        assert counts[ROCK] / n == pytest.approx(0.7, abs=0.03)
        assert counts[PAPER] / n == pytest.approx(0.2, abs=0.03)
        assert counts[SCISSORS] / n == pytest.approx(0.1, abs=0.03)
