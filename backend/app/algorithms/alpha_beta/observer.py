"""Optional search-event observer for Alpha-Beta — the Phase 7
visualization hook point, extended beyond Minimax's observer with
alpha/beta/cutoff/pruning-specific events.

Passing no observer (the default) means every call site is skipped via
a cheap ``is None`` check — the unobserved search pays no meaningful
overhead for this interface's existence. No fabricated event history
is ever produced: every event reports something that genuinely
happened during a real search.
"""

from __future__ import annotations

from typing import Literal, Protocol

CutoffReason = Literal["alpha_beta_cutoff"]


class SearchObserver(Protocol):
    """Implement any subset of these methods."""

    def on_node_entered(
        self, *, depth: int, board: list[str], player: str, alpha: int, beta: int
    ) -> None:
        """Called every time the search enters a node (including the root),
        with the alpha/beta bounds the node was entered with."""
        ...

    def on_move_explored(self, *, depth: int, move: tuple[int, int], player: str) -> None:
        """Called just before recursing into the successor of ``move``."""
        ...

    def on_terminal_evaluated(self, *, depth: int, board: list[str], score: int) -> None:
        """Called when a terminal node's score is computed."""
        ...

    def on_alpha_updated(self, *, depth: int, old_alpha: int, new_alpha: int) -> None:
        """Called whenever a MAX node raises its alpha bound."""
        ...

    def on_beta_updated(self, *, depth: int, old_beta: int, new_beta: int) -> None:
        """Called whenever a MIN node lowers its beta bound."""
        ...

    def on_cutoff_triggered(
        self, *, depth: int, role: str, alpha: int, beta: int, reason: CutoffReason
    ) -> None:
        """Called once per cutoff event, when alpha >= beta causes the
        remaining siblings at this node to be skipped."""
        ...

    def on_branch_pruned(self, *, depth: int, move: tuple[int, int], player: str) -> None:
        """Called once per individual unexplored successor move that a
        cutoff skipped — ``on_cutoff_triggered`` fires once per cutoff
        event, this fires once per move that event actually skipped."""
        ...

    def on_value_returned(self, *, depth: int, value: int) -> None:
        """Called when a node (terminal or not) returns its final value to its parent."""
        ...

    def on_best_move_updated(self, *, move: tuple[int, int], score: int) -> None:
        """Called at the root whenever a new best move is found."""
        ...
