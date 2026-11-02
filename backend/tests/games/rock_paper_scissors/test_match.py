"""Tests for the Phase 9 match/session engine (round resolution, scoring,
match completion, history, and security/fairness properties)."""

from __future__ import annotations

import random

import pytest

from app.games.rock_paper_scissors import (
    Action,
    AIStrategyConfig,
    AIStrategyKind,
    InvalidActionError,
    MatchAlreadyCompleteError,
    MatchConfig,
    MatchStatus,
    MatchWinner,
    MoveAlreadyLockedError,
    NoPendingMoveError,
    RoundResult,
    create_match,
)

ROCK, PAPER, SCISSORS = Action.ROCK, Action.PAPER, Action.SCISSORS


def _pure_ai(action: Action) -> AIStrategyConfig:
    """A deterministic AI opponent for testing round resolution without
    depending on random sampling — always plays `action`."""
    probs = {ROCK: 0.0, PAPER: 0.0, SCISSORS: 0.0}
    probs[action] = 1.0
    return AIStrategyConfig(kind=AIStrategyKind.CUSTOM, custom_probabilities=probs)


def _match_with_pure_ai(ai_action: Action, best_of: int = 3, seed: int = 0):
    config = MatchConfig(best_of=best_of, ai_strategy=_pure_ai(ai_action))
    return create_match(config, seed=seed)


# ---------------------------------------------------------------------------
# Round resolution — all nine combinations, via a deterministic AI
# ---------------------------------------------------------------------------

ALL_COMBINATIONS = [
    (ROCK, ROCK, RoundResult.TIE),
    (ROCK, PAPER, RoundResult.AI_WIN),
    (ROCK, SCISSORS, RoundResult.PLAYER_WIN),
    (PAPER, ROCK, RoundResult.PLAYER_WIN),
    (PAPER, PAPER, RoundResult.TIE),
    (PAPER, SCISSORS, RoundResult.AI_WIN),
    (SCISSORS, ROCK, RoundResult.AI_WIN),
    (SCISSORS, PAPER, RoundResult.PLAYER_WIN),
    (SCISSORS, SCISSORS, RoundResult.TIE),
]


class TestRoundResolutionAllCombinations:
    @pytest.mark.parametrize("player_action,ai_action,expected", ALL_COMBINATIONS)
    def test_combination(self, player_action, ai_action, expected):
        match = _match_with_pure_ai(ai_action, best_of=7)  # best_of=7 so no combo ends the match early
        match.lock_player_move(player_action)
        record = match.resolve_pending_round()
        assert record.player_action == player_action
        assert record.ai_action == ai_action
        assert record.result == expected

    def test_score_updates_on_player_win(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        assert match.score.player_wins == 1
        assert match.score.ai_wins == 0
        assert match.score.ties == 0

    def test_score_updates_on_ai_win(self):
        match = _match_with_pure_ai(PAPER, best_of=7)
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        assert match.score.ai_wins == 1

    def test_score_updates_on_tie(self):
        match = _match_with_pure_ai(ROCK, best_of=7)
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        assert match.score.ties == 1


class TestRoundHistory:
    def test_history_records_every_round_in_order(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        for _ in range(3):
            match.lock_player_move(ROCK)
            match.resolve_pending_round()
        history = match.history
        assert len(history) == 3
        assert [r.round_number for r in history] == [1, 2, 3]

    def test_history_score_after_is_a_running_total(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)  # player always wins with Rock
        for _ in range(3):
            match.lock_player_move(ROCK)
            match.resolve_pending_round()
        assert [r.score_after.player_wins for r in match.history] == [1, 2, 3]

    def test_history_cannot_be_mutated_externally(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        history = match.history
        with pytest.raises(TypeError):
            history[0] = None  # tuple does not support item assignment
        # Mutating the returned tuple object itself is impossible; also
        # confirm a second call returns an equal-but-independent tuple.
        assert match.history == history


# ---------------------------------------------------------------------------
# Match completion — best-of-3/5/7/custom, draws, thresholds
# ---------------------------------------------------------------------------


class TestMatchCompletion:
    @pytest.mark.parametrize("best_of,threshold", [(3, 2), (5, 3), (7, 4)])
    def test_match_completes_exactly_at_the_threshold(self, best_of, threshold):
        match = _match_with_pure_ai(SCISSORS, best_of=best_of)  # player (Rock) always wins
        for i in range(threshold):
            assert not match.is_complete
            match.lock_player_move(ROCK)
            match.resolve_pending_round()
        assert match.is_complete
        assert match.status is MatchStatus.COMPLETE
        assert match.winner is MatchWinner.PLAYER
        assert match.score.player_wins == threshold

    def test_custom_match_length_completes_at_its_own_threshold(self):
        match = _match_with_pure_ai(SCISSORS, best_of=9)  # threshold = 5
        for _ in range(5):
            match.lock_player_move(ROCK)
            match.resolve_pending_round()
        assert match.is_complete
        assert match.score.player_wins == 5

    def test_draws_do_not_count_toward_the_win_threshold(self):
        match = _match_with_pure_ai(ROCK, best_of=3)  # player plays Rock -> always ties
        for _ in range(10):
            match.lock_player_move(ROCK)
            match.resolve_pending_round()
        assert match.score.ties == 10
        assert match.score.player_wins == 0
        assert not match.is_complete  # an all-draw match never completes

    def test_ai_can_win_the_match(self):
        match = _match_with_pure_ai(PAPER, best_of=3)  # AI (Paper) always beats player's Rock
        for _ in range(2):
            match.lock_player_move(ROCK)
            match.resolve_pending_round()
        assert match.winner is MatchWinner.AI

    def test_completed_match_rejects_lock_player_move(self):
        match = _match_with_pure_ai(SCISSORS, best_of=3)
        for _ in range(2):
            match.lock_player_move(ROCK)
            match.resolve_pending_round()
        with pytest.raises(MatchAlreadyCompleteError):
            match.lock_player_move(ROCK)

    def test_completed_match_rejects_resolve_pending_round(self):
        match = _match_with_pure_ai(SCISSORS, best_of=1)
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        assert match.is_complete
        with pytest.raises(MatchAlreadyCompleteError):
            match.resolve_pending_round()


# ---------------------------------------------------------------------------
# Security / fairness
# ---------------------------------------------------------------------------


class TestSecurityAndFairness:
    def test_double_submission_is_rejected(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        match.lock_player_move(ROCK)
        with pytest.raises(MoveAlreadyLockedError):
            match.lock_player_move(PAPER)

    def test_double_resolution_is_rejected(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        with pytest.raises(NoPendingMoveError):
            match.resolve_pending_round()

    def test_resolving_with_nothing_locked_is_rejected(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        with pytest.raises(NoPendingMoveError):
            match.resolve_pending_round()

    def test_invalid_action_is_rejected(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        with pytest.raises(InvalidActionError):
            match.lock_player_move("ROCK")  # plain string, not an Action

    def test_ai_action_is_not_determined_until_resolution(self):
        # The AI strategy is only *sampled* inside resolve_pending_round,
        # strictly after the player's move is already locked — there is
        # no public accessor that exposes an AI action before that call.
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        assert not hasattr(match, "ai_action")
        assert not hasattr(match, "pending_ai_action")
        match.lock_player_move(ROCK)
        # Still nothing reveals the AI's action pre-resolution.
        assert not hasattr(match, "ai_action")
        record = match.resolve_pending_round()
        assert record.ai_action == SCISSORS  # only now is it known

    def test_has_pending_move_reflects_lock_state_without_revealing_ai_action(self):
        match = _match_with_pure_ai(SCISSORS, best_of=7)
        assert match.has_pending_move is False
        match.lock_player_move(ROCK)
        assert match.has_pending_move is True
        match.resolve_pending_round()
        assert match.has_pending_move is False

    def test_match_state_transitions_are_correct(self):
        match = _match_with_pure_ai(SCISSORS, best_of=3)
        assert match.status is MatchStatus.AWAITING_PLAYER_MOVE
        match.lock_player_move(ROCK)
        assert match.status is MatchStatus.AWAITING_PLAYER_MOVE  # locking alone doesn't change status
        match.resolve_pending_round()
        assert match.status is MatchStatus.AWAITING_PLAYER_MOVE  # still need another win
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        assert match.status is MatchStatus.COMPLETE


# ---------------------------------------------------------------------------
# New match / reset
# ---------------------------------------------------------------------------


class TestNewMatch:
    def test_start_new_match_clears_score_and_history(self):
        match = _match_with_pure_ai(SCISSORS, best_of=3)
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        match.start_new_match()
        assert match.score.player_wins == 0
        assert match.history == ()
        assert match.has_pending_move is False
        assert match.status is MatchStatus.AWAITING_PLAYER_MOVE

    def test_start_new_match_can_change_configuration(self):
        match = _match_with_pure_ai(SCISSORS, best_of=3)
        new_config = MatchConfig(best_of=5, ai_strategy=_pure_ai(ROCK))
        match.start_new_match(config=new_config)
        assert match.config.best_of == 5


# ---------------------------------------------------------------------------
# Reproducibility
# ---------------------------------------------------------------------------


class TestReproducibility:
    def test_same_seed_and_same_moves_reproduce_ai_actions(self):
        config = MatchConfig(best_of=9, ai_strategy=AIStrategyConfig(kind=AIStrategyKind.NASH_UNIFORM))
        match_a = create_match(config, seed=12345)
        match_b = create_match(config, seed=12345)

        actions_a, actions_b = [], []
        for _ in range(4):
            match_a.lock_player_move(ROCK)
            actions_a.append(match_a.resolve_pending_round().ai_action)
            match_b.lock_player_move(ROCK)
            actions_b.append(match_b.resolve_pending_round().ai_action)

        assert actions_a == actions_b

    def test_independent_matches_do_not_share_random_state(self):
        config = MatchConfig(best_of=9, ai_strategy=AIStrategyConfig(kind=AIStrategyKind.NASH_UNIFORM))
        random.seed(2024)
        state_before = random.getstate()
        match = create_match(config, seed=1)
        match.lock_player_move(ROCK)
        match.resolve_pending_round()
        assert random.getstate() == state_before

    def test_omitting_seed_still_produces_a_playable_match(self):
        config = MatchConfig(best_of=3, ai_strategy=AIStrategyConfig(kind=AIStrategyKind.NASH_UNIFORM))
        match = create_match(config)  # no seed -> production randomness
        match.lock_player_move(ROCK)
        record = match.resolve_pending_round()
        assert record.ai_action in (ROCK, PAPER, SCISSORS)
