"""The Phase 9 match/session engine: round state, scoring, match
completion, and history — built *on top of* the Phase 8 payoff engine,
never duplicating its rules.

Responsibility boundary (see docs/RPS_GAMEPLAY.md):

- Phase 8 (``payoff.py``, ``strategy.py``, ...): mathematical
  calculations and strategy sampling.
- **This module**: round state, score, match completion, history.
- Frontend: presentation and user interaction.

**Simultaneous-action fairness is enforced structurally, not just by
convention:** the AI's action is only ever sampled inside
:meth:`RPSMatch.resolve_pending_round`, which can only be called after
:meth:`RPSMatch.lock_player_move` has already stored the player's
choice. There is no code path that samples (or exposes) an AI action
before the player's move is locked in.
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from enum import Enum

from .ai_strategies import AIStrategyConfig
from .exceptions import (
    InvalidActionError,
    InvalidMatchConfigError,
    MatchAlreadyCompleteError,
    MoveAlreadyLockedError,
    NoPendingMoveError,
)
from .models import Action
from .payoff import resolve_round
from .strategy import sample_action

#: The smallest and largest "best of N" a match may be configured with.
#: A reasonable, documented cap — prevents an effectively-infinite
#: custom match length (see docs/RPS_GAMEPLAY.md §"Match-Length Rules").
MIN_BEST_OF = 1
MAX_BEST_OF = 101


class MatchStatus(str, Enum):
    AWAITING_PLAYER_MOVE = "AWAITING_PLAYER_MOVE"
    COMPLETE = "COMPLETE"


class MatchWinner(str, Enum):
    PLAYER = "PLAYER"
    AI = "AI"


class RoundResult(str, Enum):
    """A resolved round's outcome, from the human player's perspective.

    Translated 1:1 from Phase 8's generic ``RoundOutcome`` (A_WINS/
    B_WINS/TIE) — the player is always "A" and the AI is always "B" in
    every call into Phase 8 from this module, so this translation is
    the *only* place that mapping needs to be remembered.
    """

    PLAYER_WIN = "PLAYER_WIN"
    AI_WIN = "AI_WIN"
    TIE = "TIE"


@dataclass(frozen=True)
class Score:
    """An immutable scoreboard snapshot."""

    player_wins: int = 0
    ai_wins: int = 0
    ties: int = 0

    @property
    def rounds_played(self) -> int:
        return self.player_wins + self.ai_wins + self.ties


@dataclass(frozen=True)
class RoundRecord:
    """One resolved round, kept for match history.

    Frozen — a round, once resolved, is a historical fact and cannot
    be mutated. ``score_after`` is the scoreboard immediately after
    this round, so history review never needs to replay the whole
    match to know the score at any point.
    """

    round_number: int
    player_action: Action
    ai_action: Action
    result: RoundResult
    score_after: Score


def _translate_result(outcome) -> RoundResult:  # outcome: payoff.RoundOutcome
    from .models import RoundOutcome

    if outcome is RoundOutcome.A_WINS:
        return RoundResult.PLAYER_WIN
    if outcome is RoundOutcome.B_WINS:
        return RoundResult.AI_WIN
    return RoundResult.TIE


@dataclass(frozen=True)
class MatchConfig:
    """Validated configuration for one match.

    ``best_of`` must be odd (3, 5, 7, or any other odd value up to
    :data:`MAX_BEST_OF`) so the match always has a decisive winner
    threshold — ``win_threshold = best_of // 2 + 1`` — with no
    possibility of an overall tie. Draws within a round never count
    toward either player's win total (the match simply continues
    until someone reaches the threshold), so the *total number of
    rounds played* can exceed ``best_of`` if ties occur.
    """

    best_of: int
    ai_strategy: AIStrategyConfig

    def __post_init__(self) -> None:
        if not isinstance(self.best_of, int) or isinstance(self.best_of, bool):
            raise InvalidMatchConfigError(f"best_of must be an integer; got {self.best_of!r}.")
        if self.best_of < MIN_BEST_OF or self.best_of > MAX_BEST_OF:
            raise InvalidMatchConfigError(
                f"best_of must be between {MIN_BEST_OF} and {MAX_BEST_OF}; got {self.best_of}."
            )
        if self.best_of % 2 == 0:
            raise InvalidMatchConfigError(
                f"best_of must be odd (e.g. 3, 5, 7) so the match has a decisive winner threshold "
                f"with no possibility of an overall tie; got {self.best_of}."
            )

    @property
    def win_threshold(self) -> int:
        """Round wins needed to win the match (e.g. best-of-5 -> 3)."""
        return self.best_of // 2 + 1


class RPSMatch:
    """A single, stateful Rock Paper Scissors match.

    Mirrors the Tic-Tac-Toe engine's conventions: public accessors
    return immutable snapshots or fresh copies, never a live reference
    into private state, so a caller can never corrupt match state by
    holding onto a returned value and mutating it.
    """

    def __init__(self, config: MatchConfig, rng: random.Random) -> None:
        self.config = config
        self._rng = rng
        self._history: list[RoundRecord] = []
        self._score = Score()
        self._pending_player_action: Action | None = None

    # -- read-only state ---------------------------------------------------

    @property
    def score(self) -> Score:
        return self._score

    @property
    def history(self) -> tuple[RoundRecord, ...]:
        """Full round history, oldest first. Frozen records in a fresh
        tuple each call — safe to share, impossible to mutate externally."""
        return tuple(self._history)

    @property
    def has_pending_move(self) -> bool:
        """True once the player has locked a move this round but it has
        not yet been resolved (the AI action has *not* been sampled yet)."""
        return self._pending_player_action is not None

    @property
    def is_complete(self) -> bool:
        threshold = self.config.win_threshold
        return self._score.player_wins >= threshold or self._score.ai_wins >= threshold

    @property
    def status(self) -> MatchStatus:
        return MatchStatus.COMPLETE if self.is_complete else MatchStatus.AWAITING_PLAYER_MOVE

    @property
    def winner(self) -> MatchWinner | None:
        if not self.is_complete:
            return None
        return MatchWinner.PLAYER if self._score.player_wins > self._score.ai_wins else MatchWinner.AI

    # -- state transitions --------------------------------------------------

    def lock_player_move(self, action: Action) -> None:
        """Step 1-2 of the secure sequence: the player commits an action.

        The AI has not been consulted in any way yet — nothing here
        samples, computes, or exposes an AI action. Raises if the match
        is already over, or if a move is already locked for this round
        (preventing double submission).
        """
        if self.is_complete:
            raise MatchAlreadyCompleteError()
        if not isinstance(action, Action):
            raise InvalidActionError(action)
        if self._pending_player_action is not None:
            raise MoveAlreadyLockedError()
        self._pending_player_action = action

    def resolve_pending_round(self) -> RoundRecord:
        """Steps 3-6 of the secure sequence: sample the AI's action
        *independently* of the (already-locked) player action, reveal
        both together, resolve via Phase 8's `resolve_round`, and
        update the score.

        Raises if the match is already over, or if no move is
        currently locked (preventing resolving a round twice, or
        resolving with nothing submitted).
        """
        if self.is_complete:
            raise MatchAlreadyCompleteError()
        if self._pending_player_action is None:
            raise NoPendingMoveError()

        player_action = self._pending_player_action
        ai_strategy = self.config.ai_strategy.resolve()
        ai_action = sample_action(ai_strategy, self._rng)

        outcome = resolve_round(player_action, ai_action)  # player = "A", AI = "B"
        result = _translate_result(outcome)

        new_score = Score(
            player_wins=self._score.player_wins + (1 if result is RoundResult.PLAYER_WIN else 0),
            ai_wins=self._score.ai_wins + (1 if result is RoundResult.AI_WIN else 0),
            ties=self._score.ties + (1 if result is RoundResult.TIE else 0),
        )
        record = RoundRecord(
            round_number=len(self._history) + 1,
            player_action=player_action,
            ai_action=ai_action,
            result=result,
            score_after=new_score,
        )

        self._history.append(record)
        self._score = new_score
        self._pending_player_action = None
        return record

    def start_new_match(self, config: MatchConfig | None = None, rng: random.Random | None = None) -> None:
        """Reset this match (optionally with a new configuration/RNG),
        clearing score, history, and any pending move — mirrors the
        Tic-Tac-Toe engine's `restart()` convention."""
        if config is not None:
            self.config = config
        if rng is not None:
            self._rng = rng
        self._history = []
        self._score = Score()
        self._pending_player_action = None


__all__ = [
    "MIN_BEST_OF",
    "MAX_BEST_OF",
    "MatchStatus",
    "MatchWinner",
    "RoundResult",
    "Score",
    "RoundRecord",
    "MatchConfig",
    "RPSMatch",
]
