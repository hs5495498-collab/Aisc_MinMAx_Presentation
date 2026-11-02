"""The four selectable AI opponent strategies for Phase 9 gameplay.

Every strategy here resolves to a Phase 8 :class:`MixedStrategy` —
this module never computes a probability itself; it only *selects
which already-validated Phase 8 distribution* a match should sample
from. That keeps "the math" in Phase 8 and "which math applies to
this match" in Phase 9, per the brief's separation of concerns.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Mapping, Optional

from .exceptions import InvalidMatchConfigError
from .models import Action, MixedStrategy
from .strategy import uniform_strategy, validated_strategy


class AIStrategyKind(str, Enum):
    """Which of the four Phase 9 strategy options is in play."""

    #: (1/3, 1/3, 1/3) — framed as "the Nash equilibrium": cannot be
    #: exploited in expectation by a fixed opponent strategy.
    NASH_UNIFORM = "NASH_UNIFORM"

    #: Also (1/3, 1/3, 1/3) — same :class:`MixedStrategy`, same
    #: `uniform_strategy()` call, same number. Framed as "pick
    #: uniformly at random" rather than "the equilibrium strategy", but
    #: mathematically **identical** to NASH_UNIFORM. See module
    #: docstring and docs/RPS_GAMEPLAY.md §"AI Strategies" — this
    #: engine never presents them as two different distributions.
    RANDOM_UNIFORM = "RANDOM_UNIFORM"

    #: A user-supplied distribution, validated through Phase 8's
    #: `MixedStrategy` (never silently normalized).
    CUSTOM = "CUSTOM"

    #: A fixed, documented, exploitable distribution for teaching
    #: purposes — never claimed to be optimal.
    BIASED_DEMO = "BIASED_DEMO"


#: The Strategy D demonstration distribution: 70% Rock, 20% Paper, 10%
#: Scissors. Deliberately predictable, so a best response (Phase 8's
#: `best_response`/`exploitability`) can profitably exploit it — see
#: docs/RPS_GAMEPLAY.md for a worked example.
DEFAULT_BIASED_DEMO_PROBABILITIES: Mapping[Action, float] = {
    Action.ROCK: 0.7,
    Action.PAPER: 0.2,
    Action.SCISSORS: 0.1,
}


@dataclass(frozen=True)
class AIStrategyConfig:
    """Which strategy a match's AI opponent uses.

    ``custom_probabilities`` is required (and validated via Phase 8's
    `MixedStrategy`) when ``kind`` is :attr:`AIStrategyKind.CUSTOM`;
    it is ignored for every other kind.
    """

    kind: AIStrategyKind
    custom_probabilities: Optional[Mapping[Action, float]] = None
    #: Only meaningful for BIASED_DEMO — lets a caller use a different,
    #: still-explicit, still-documented demonstration bias instead of
    #: the module default. Never implicitly derived or normalized.
    biased_demo_probabilities: Optional[Mapping[Action, float]] = None

    def __post_init__(self) -> None:
        if self.kind is AIStrategyKind.CUSTOM and self.custom_probabilities is None:
            raise InvalidMatchConfigError("AIStrategyKind.CUSTOM requires custom_probabilities.")

    def resolve(self) -> MixedStrategy:
        """The actual :class:`MixedStrategy` to sample from this round.

        Always re-resolves from Phase 8 primitives — never caches or
        duplicates a probability value anywhere else in this engine.
        """
        if self.kind is AIStrategyKind.NASH_UNIFORM:
            return uniform_strategy()
        if self.kind is AIStrategyKind.RANDOM_UNIFORM:
            return uniform_strategy()
        if self.kind is AIStrategyKind.CUSTOM:
            assert self.custom_probabilities is not None  # enforced in __post_init__
            return validated_strategy(self.custom_probabilities)
        if self.kind is AIStrategyKind.BIASED_DEMO:
            probabilities = self.biased_demo_probabilities or DEFAULT_BIASED_DEMO_PROBABILITIES
            return MixedStrategy.from_mapping(dict(probabilities))
        raise InvalidMatchConfigError(f"Unknown AIStrategyKind: {self.kind!r}")

    def explanation(self) -> str:
        """A short, UI-ready, mathematically-accurate explanation of
        this strategy — see docs/RPS_GAMEPLAY.md for the full text."""
        if self.kind is AIStrategyKind.NASH_UNIFORM:
            return (
                "This strategy randomizes uniformly (1/3 Rock, 1/3 Paper, 1/3 Scissors) and "
                "cannot be exploited in expectation by an opponent using a fixed strategy. "
                "It does not guarantee that the AI wins individual rounds."
            )
        if self.kind is AIStrategyKind.RANDOM_UNIFORM:
            return (
                "This strategy picks uniformly at random (1/3 Rock, 1/3 Paper, 1/3 Scissors) — "
                "the exact same probability distribution as the Nash equilibrium strategy above, "
                "just framed as plain randomness rather than as game-theoretic optimality. "
                "The two options play identically; neither can be exploited in expectation."
            )
        if self.kind is AIStrategyKind.CUSTOM:
            probs = self.resolve().as_tuple()
            return (
                f"A custom distribution you configured: "
                f"Rock {probs[0]:.0%}, Paper {probs[1]:.0%}, Scissors {probs[2]:.0%}. "
                "Unless this happens to equal (1/3, 1/3, 1/3), it is exploitable by a suitable "
                "best response."
            )
        if self.kind is AIStrategyKind.BIASED_DEMO:
            probs = self.resolve().as_tuple()
            return (
                f"A deliberately predictable demonstration strategy "
                f"(Rock {probs[0]:.0%}, Paper {probs[1]:.0%}, Scissors {probs[2]:.0%}) — not an "
                "optimal strategy. It exists to show how a biased opponent can be exploited; see "
                "the Phase 8 best-response/exploitability analysis for exactly how much."
            )
        return ""


__all__ = ["AIStrategyKind", "AIStrategyConfig", "DEFAULT_BIASED_DEMO_PROBABILITIES"]
