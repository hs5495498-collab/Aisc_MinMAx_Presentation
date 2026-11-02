"""Serializable data model for search-tree visualization (Phase 7).

Every field here is populated only from real observer events — see
``tree_builder.TreeBuildingObserver``. Nothing in this module computes
or guesses a value; it only reshapes what the solver already reported.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal, Optional

#: A node's lifecycle status, as actually observed:
#: - "visited": entered, still exploring children (or just entered, for a leaf about to be evaluated)
#: - "evaluated": a terminal node whose score was computed
#: - "completed": a non-terminal node that finished exploring all its (unpruned) children and returned a backed-up value
#: - "pruned": a stub representing a legal move that was never explored because a cutoff skipped it
NodeStatus = Literal["visited", "evaluated", "completed", "pruned"]
NodeRole = Literal["MAX", "MIN"]


@dataclass
class VisualNode:
    """One node in the visualization tree, built strictly from real events.

    A "pruned" node is a stub: it represents a legal move that the
    algorithm never actually explored (no board/evaluation data exists
    for it, because the algorithm never visited it) — ``board`` is
    left ``None`` and ``children_ids`` is always empty for these, so
    the frontend can never accidentally render a pruned branch as
    though its descendants were evaluated.
    """

    id: str
    parent_id: Optional[str]
    depth: int
    role: Optional[NodeRole]
    board: Optional[list[str]]
    move: Optional[dict]
    status: NodeStatus
    evaluation: Optional[int] = None
    alpha: Optional[int] = None
    beta: Optional[int] = None
    is_terminal: bool = False
    terminal_result: Optional[str] = None
    children_ids: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "parentId": self.parent_id,
            "depth": self.depth,
            "role": self.role,
            "board": self.board,
            "move": self.move,
            "status": self.status,
            "evaluation": self.evaluation,
            "alpha": self.alpha,
            "beta": self.beta,
            "isTerminal": self.is_terminal,
            "terminalResult": self.terminal_result,
            "childrenIds": list(self.children_ids),
        }


@dataclass
class SearchTreeData:
    """The complete, serializable output of one observed search.

    ``events`` is the ordered, replayable log the frontend steps
    through (Phase 7 §6 playback requirement); ``nodes`` is a
    convenience index of final node state, useful for "jump to the
    end" rendering, but is always *derivable* from replaying
    ``events`` in order — it is never a second, independent source of
    truth.
    """

    algorithm: Literal["minimax", "alpha_beta"]
    ai_player: str
    opponent_player: str
    root_id: Optional[str]
    nodes: dict[str, VisualNode]
    events: list[dict]
    statistics: dict
    best_move: dict
    position_label: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "algorithm": self.algorithm,
            "aiPlayer": self.ai_player,
            "opponentPlayer": self.opponent_player,
            "positionLabel": self.position_label,
            "rootId": self.root_id,
            "nodes": {node_id: node.to_dict() for node_id, node in self.nodes.items()},
            "events": self.events,
            "statistics": self.statistics,
            "bestMove": self.best_move,
        }


__all__ = ["VisualNode", "SearchTreeData", "NodeStatus", "NodeRole"]
