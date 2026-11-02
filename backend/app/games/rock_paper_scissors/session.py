"""Match creation — the one place test reproducibility and production
randomness diverge, so that distinction lives in exactly one function.

**Test reproducibility:** pass an explicit ``seed`` — the resulting
`random.Random(seed)` instance makes every AI action in the match
fully deterministic for a given sequence of player moves, so a test
can assert on exact AI actions and exact round outcomes.

**Production randomness:** omit ``seed`` (or pass ``None``) — a fresh
`random.Random()` is seeded from the OS's own entropy source, exactly
like calling the bare `random` module would, but still **never shared
as global mutable state** between matches: each match gets its own
independent `random.Random` instance, so two matches running "at the
same time" (e.g. two browser tabs once Phase 12 exists) can never
influence each other's AI actions.

Nothing here — now or later — exposes the seed or the `random.Random`
instance to a caller before a round is resolved; see `match.py`'s own
docstring for how the secure sequence itself prevents that.
"""

from __future__ import annotations

import random

from .match import MatchConfig, RPSMatch


def create_match(config: MatchConfig, seed: int | None = None) -> RPSMatch:
    """Create a new, ready-to-play :class:`RPSMatch`.

    :param config: validated match configuration (best-of length + AI strategy).
    :param seed: if given, makes this match's AI actions fully
        reproducible for the same sequence of player moves (tests). If
        omitted, the match uses normal, OS-entropy-seeded randomness
        (production).
    """
    rng = random.Random(seed) if seed is not None else random.Random()
    return RPSMatch(config, rng)


__all__ = ["create_match"]
