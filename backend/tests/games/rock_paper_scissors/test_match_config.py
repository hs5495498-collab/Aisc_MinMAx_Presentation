"""MatchConfig validation and win-threshold tests."""

from __future__ import annotations

import pytest

from app.games.rock_paper_scissors import (
    Action,
    AIStrategyConfig,
    AIStrategyKind,
    InvalidMatchConfigError,
    MatchConfig,
)
from app.games.rock_paper_scissors.match import MAX_BEST_OF

NASH = AIStrategyConfig(kind=AIStrategyKind.NASH_UNIFORM)


class TestValidConfigurations:
    @pytest.mark.parametrize("best_of,expected_threshold", [(1, 1), (3, 2), (5, 3), (7, 4), (9, 5)])
    def test_win_threshold(self, best_of, expected_threshold):
        config = MatchConfig(best_of=best_of, ai_strategy=NASH)
        assert config.win_threshold == expected_threshold

    def test_each_ai_strategy_kind_is_accepted(self):
        for kind in (AIStrategyKind.NASH_UNIFORM, AIStrategyKind.RANDOM_UNIFORM, AIStrategyKind.BIASED_DEMO):
            MatchConfig(best_of=3, ai_strategy=AIStrategyConfig(kind=kind))
        MatchConfig(
            best_of=3,
            ai_strategy=AIStrategyConfig(
                kind=AIStrategyKind.CUSTOM,
                custom_probabilities={Action.ROCK: 0.5, Action.PAPER: 0.3, Action.SCISSORS: 0.2},
            ),
        )


class TestInvalidConfigurations:
    def test_even_best_of_is_rejected(self):
        with pytest.raises(InvalidMatchConfigError):
            MatchConfig(best_of=4, ai_strategy=NASH)

    def test_zero_best_of_is_rejected(self):
        with pytest.raises(InvalidMatchConfigError):
            MatchConfig(best_of=0, ai_strategy=NASH)

    def test_negative_best_of_is_rejected(self):
        with pytest.raises(InvalidMatchConfigError):
            MatchConfig(best_of=-3, ai_strategy=NASH)

    def test_best_of_above_the_documented_maximum_is_rejected(self):
        with pytest.raises(InvalidMatchConfigError):
            MatchConfig(best_of=MAX_BEST_OF + 2, ai_strategy=NASH)

    def test_best_of_at_the_documented_maximum_is_accepted(self):
        MatchConfig(best_of=MAX_BEST_OF, ai_strategy=NASH)

    def test_non_integer_best_of_is_rejected(self):
        with pytest.raises(InvalidMatchConfigError):
            MatchConfig(best_of=3.5, ai_strategy=NASH)
