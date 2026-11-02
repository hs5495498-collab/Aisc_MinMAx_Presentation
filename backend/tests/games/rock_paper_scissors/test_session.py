"""Tests for the `create_match` factory itself (test vs. production
randomness) — see test_match.py::TestReproducibility for the broader
reproducibility guarantees this factory enables."""

from __future__ import annotations

import random

from app.games.rock_paper_scissors import AIStrategyConfig, AIStrategyKind, MatchConfig, RPSMatch, create_match

CONFIG = MatchConfig(best_of=3, ai_strategy=AIStrategyConfig(kind=AIStrategyKind.NASH_UNIFORM))


class TestCreateMatch:
    def test_returns_an_rps_match_instance(self):
        assert isinstance(create_match(CONFIG, seed=1), RPSMatch)

    def test_seeded_match_uses_the_given_config(self):
        match = create_match(CONFIG, seed=1)
        assert match.config is CONFIG

    def test_two_seeded_matches_with_the_same_seed_are_independent_objects(self):
        a = create_match(CONFIG, seed=5)
        b = create_match(CONFIG, seed=5)
        assert a is not b

    def test_unseeded_match_does_not_raise_and_is_playable(self):
        match = create_match(CONFIG)
        assert match.has_pending_move is False

    def test_creating_an_unseeded_match_does_not_touch_global_random_state(self):
        random.seed(42)
        state_before = random.getstate()
        create_match(CONFIG)
        assert random.getstate() == state_before
