"""Converts real Minimax/Alpha-Beta observer callbacks into a
serializable, replayable search tree — the Phase 7 event adapter.

``TreeBuildingObserver`` is written once and works, unmodified, as the
observer for *either* solver: it accepts every keyword argument both
``app.algorithms.minimax.observer.SearchObserver`` and
``app.algorithms.alpha_beta.observer.SearchObserver`` can call it
with (Alpha-Beta's extra ``alpha``/``beta`` on ``on_node_entered``,
and its five pruning-specific methods that Minimax's solver simply
never calls). Neither observer Protocol was changed to make this
work — this is exactly the "adapter over modifying the algorithm"
the Phase 7 brief asks for.

Node IDs are assigned by a single monotonic counter, in the exact
order nodes are discovered during the real search (``on_node_entered``
and ``on_branch_pruned`` both draw from it), so IDs are deterministic
for a deterministic search (already proven in Phase 5/6's own
determinism tests) and parent-child relationships are built from a
simple stack mirroring the solver's actual call/return structure —
never guessed or reconstructed after the fact.
"""

from __future__ import annotations

from app.algorithms import alpha_beta, minimax
from app.games.tic_tac_toe.engine import TicTacToeGame
from app.games.tic_tac_toe.models import Mark

from .models import SearchTreeData, VisualNode


class TreeBuildingObserver:
    """Pass an instance of this as ``observer=`` to either solver's
    ``find_best_move``, then call :meth:`build` with the returned
    ``MinimaxResult``/``AlphaBetaResult`` to get a `SearchTreeData`.
    """

    def __init__(self, ai_player: str) -> None:
        self.ai_player = ai_player
        self.nodes: dict[str, VisualNode] = {}
        self.events: list[dict] = []
        self.root_id: str | None = None
        self._stack: list[str] = []
        self._next_id = 0
        self._pending_move: dict | None = None

    # -- internal helpers -------------------------------------------------

    def _new_id(self) -> str:
        node_id = f"n{self._next_id}"
        self._next_id += 1
        return node_id

    def _current(self) -> VisualNode | None:
        if not self._stack:
            return None
        return self.nodes[self._stack[-1]]

    def _role_for(self, player: str) -> str:
        return "MAX" if player == self.ai_player else "MIN"

    def _record(self, event_type: str, **fields) -> None:
        self.events.append({"index": len(self.events), "type": event_type, **fields})

    # -- SearchObserver protocol (both Minimax's and Alpha-Beta's) --------

    def on_node_entered(
        self, *, depth: int, board: list[str], player: str, alpha: int | None = None, beta: int | None = None
    ) -> None:
        parent_id = self._stack[-1] if self._stack else None
        node_id = self._new_id()
        node = VisualNode(
            id=node_id,
            parent_id=parent_id,
            depth=depth,
            role=self._role_for(player),
            board=list(board),
            move=self._pending_move,
            status="visited",
            alpha=alpha,
            beta=beta,
        )
        self._pending_move = None
        self.nodes[node_id] = node
        if parent_id is not None:
            self.nodes[parent_id].children_ids.append(node_id)
        else:
            self.root_id = node_id
        self._stack.append(node_id)

        self._record(
            "node_entered",
            nodeId=node_id,
            parentId=parent_id,
            depth=depth,
            role=node.role,
            board=list(board),
            move=node.move,
            alpha=alpha,
            beta=beta,
        )

    def on_move_explored(self, *, depth: int, move: tuple[int, int], player: str) -> None:
        self._pending_move = {"row": move[0], "col": move[1]}
        current = self._current()
        self._record(
            "move_explored",
            nodeId=current.id if current else None,
            depth=depth,
            move=self._pending_move,
            role=self._role_for(player),
        )

    def on_terminal_evaluated(self, *, depth: int, board: list[str], score: int) -> None:
        current = self._current()
        if current is not None:
            current.is_terminal = True
            current.evaluation = score
            current.status = "evaluated"
        self._record(
            "terminal_evaluated",
            nodeId=current.id if current else None,
            depth=depth,
            board=list(board),
            value=score,
        )

    def on_alpha_updated(self, *, depth: int, old_alpha: int, new_alpha: int) -> None:
        current = self._current()
        if current is not None:
            current.alpha = new_alpha
        self._record(
            "alpha_updated",
            nodeId=current.id if current else None,
            depth=depth,
            oldAlpha=old_alpha,
            newAlpha=new_alpha,
        )

    def on_beta_updated(self, *, depth: int, old_beta: int, new_beta: int) -> None:
        current = self._current()
        if current is not None:
            current.beta = new_beta
        self._record(
            "beta_updated",
            nodeId=current.id if current else None,
            depth=depth,
            oldBeta=old_beta,
            newBeta=new_beta,
        )

    def on_cutoff_triggered(self, *, depth: int, role: str, alpha: int, beta: int, reason: str) -> None:
        current = self._current()
        self._record(
            "cutoff_triggered",
            nodeId=current.id if current else None,
            depth=depth,
            role=role,
            alpha=alpha,
            beta=beta,
            reason=reason,
        )

    def on_branch_pruned(self, *, depth: int, move: tuple[int, int], player: str) -> None:
        parent = self._current()
        node_id = self._new_id()
        node = VisualNode(
            id=node_id,
            parent_id=parent.id if parent else None,
            depth=depth,
            role=self._role_for(player),
            board=None,  # never explored — no board/evaluation data exists for this branch
            move={"row": move[0], "col": move[1]},
            status="pruned",
        )
        self.nodes[node_id] = node
        if parent is not None:
            parent.children_ids.append(node_id)

        self._record(
            "branch_pruned",
            nodeId=node_id,
            parentId=parent.id if parent else None,
            depth=depth,
            move=node.move,
        )

    def on_value_returned(self, *, depth: int, value: int) -> None:
        current = self._current()
        if current is not None:
            current.evaluation = value
            if current.status != "evaluated":  # a terminal node keeps "evaluated", never overwritten
                current.status = "completed"
            self._stack.pop()
        self._record(
            "value_returned",
            nodeId=current.id if current else None,
            depth=depth,
            value=value,
        )

    def on_best_move_updated(self, *, move: tuple[int, int], score: int) -> None:
        self._record("best_move_updated", move={"row": move[0], "col": move[1]}, value=score)

    # -- assembly -----------------------------------------------------------

    def build(
        self,
        *,
        algorithm: str,
        ai_player: str,
        opponent_player: str,
        statistics: dict,
        best_move: tuple[int, int],
        position_label: str | None = None,
    ) -> SearchTreeData:
        return SearchTreeData(
            algorithm=algorithm,  # type: ignore[arg-type]
            ai_player=ai_player,
            opponent_player=opponent_player,
            root_id=self.root_id,
            nodes=self.nodes,
            events=self.events,
            statistics=statistics,
            best_move={"row": best_move[0], "col": best_move[1]},
            position_label=position_label,
        )


def build_search_tree(
    game: TicTacToeGame,
    ai_player: str | Mark,
    algorithm: str,
    position_label: str | None = None,
) -> SearchTreeData:
    """Run ``algorithm`` ("minimax" or "alpha_beta") on ``game`` with a
    :class:`TreeBuildingObserver` attached, and return the resulting
    :class:`SearchTreeData`. ``game`` is not mutated (neither solver
    mutates its input — see each algorithm's own state-safety tests).
    """
    ai_mark = Mark(ai_player) if isinstance(ai_player, str) else ai_player
    observer = TreeBuildingObserver(ai_player=ai_mark.value)

    if algorithm == "minimax":
        result = minimax.find_best_move(game, ai_mark, observer=observer)
    elif algorithm == "alpha_beta":
        result = alpha_beta.find_best_move(game, ai_mark, observer=observer)
    else:
        raise ValueError(f"Unknown algorithm: {algorithm!r} (expected 'minimax' or 'alpha_beta')")

    return observer.build(
        algorithm=algorithm,
        ai_player=result.ai_player,
        opponent_player=result.opponent_player,
        statistics=result.to_dict()["statistics"],
        best_move=result.best_move,
        position_label=position_label,
    )


__all__ = ["TreeBuildingObserver", "build_search_tree"]
