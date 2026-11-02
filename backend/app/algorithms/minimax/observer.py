"""Optional search-event observer — the Phase 7 visualization hook point.

Phase 7 will render the *genuine* recorded search as a graph. To make
that possible without fabricating a tree, ``solver.py`` reports real
events through this interface as it searches. Passing no observer
(the default) skips every call site via a cheap ``is None`` check, so
the unobserved search is not meaningfully slowed down.

This module defines the event contract only — no graph library, no
React, no fabricated tree. See docs/MINIMAX_IMPLEMENTATION.md §12 for
how Phase 7 is expected to consume this.
"""

from __future__ import annotations

from typing import Protocol


class SearchObserver(Protocol):
    """Implement any subset of these methods; the solver checks for
    the observer's presence once per call site, not once per method."""

    def on_node_entered(self, *, depth: int, board: list[str], player: str) -> None:
        """Called every time the search enters a node (including the root)."""
        ...

    def on_move_explored(self, *, depth: int, move: tuple[int, int], player: str) -> None:
        """Called just before recursing into the successor of ``move``."""
        ...

    def on_terminal_evaluated(self, *, depth: int, board: list[str], score: int) -> None:
        """Called when a terminal node's score is computed."""
        ...

    def on_value_returned(self, *, depth: int, value: int) -> None:
        """Called when a node (terminal or not) returns its final value to its parent."""
        ...

    def on_best_move_updated(self, *, move: tuple[int, int], score: int) -> None:
        """Called at the root whenever a new best move is found."""
        ...
