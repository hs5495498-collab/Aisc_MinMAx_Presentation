"""Strategy generation and sampling — deliberately separate from the
mathematical analysis in ``analysis.py``/``equilibrium.py``.

Sampling an action from a distribution is a random-number-generation
concern, not a game-theory calculation; keeping it in its own module
makes that boundary explicit. **Sampling is never a substitute for
equilibrium computation** — see :func:`sample_action`'s docstring.

No global mutable random state is ever touched here: every sampling
function takes a caller-supplied :class:`random.Random` instance, so
reproducibility is entirely the caller's choice (``random.Random(seed)``
for a reproducible sequence, the shared default global RNG via
``random.Random()`` wrapping nothing for non-reproducible use, etc.).
"""

from __future__ import annotations

import random
from typing import Mapping

from .models import ACTIONS, Action, MixedStrategy


def uniform_strategy() -> MixedStrategy:
    """The (1/3, 1/3, 1/3) strategy. A thin, explicitly-named alias of
    ``MixedStrategy.uniform()`` for discoverability alongside the other
    generation functions in this module."""
    return MixedStrategy.uniform()


def validated_strategy(probabilities: Mapping[Action, float]) -> MixedStrategy:
    """A user-supplied mixed strategy, validated (not normalized) —
    raises :class:`InvalidMixedStrategyError` via ``MixedStrategy``'s
    own constructor if `probabilities` isn't already a valid distribution."""
    return MixedStrategy.from_mapping(probabilities)


def sample_action(strategy: MixedStrategy, rng: random.Random) -> Action:
    """Draw one action from `strategy` using the supplied `rng`.

    This is a **random draw**, not a game-theory calculation — it
    tells you what one simulated play looks like, never what the
    "correct" or "optimal" strategy is. Pass ``random.Random(seed)``
    for a reproducible sequence of draws; this function never reads or
    writes any global random state.
    """
    roll = rng.random()
    cumulative = 0.0
    for action in ACTIONS:
        cumulative += strategy.probability(action)
        if roll < cumulative:
            return action
    return ACTIONS[-1]  # floating-point safety net if cumulative rounds just under 1.0


def sample_actions(strategy: MixedStrategy, rng: random.Random, count: int) -> list[Action]:
    """`count` independent draws from `strategy`, using the same `rng`
    (so the whole sequence is reproducible from one seed)."""
    return [sample_action(strategy, rng) for _ in range(count)]


__all__ = ["uniform_strategy", "validated_strategy", "sample_action", "sample_actions"]
