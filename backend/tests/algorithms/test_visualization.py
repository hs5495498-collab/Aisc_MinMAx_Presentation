"""Tests for the Phase 7 search-tree visualization adapter.

These tests verify the *adapter* — that it faithfully transcribes real
observer events into a serializable tree — not the algorithms
themselves (already covered by test_minimax.py / test_alpha_beta.py).
"""

from __future__ import annotations

from app.algorithms import alpha_beta, minimax
from app.algorithms.visualization import TreeBuildingObserver, build_search_tree
from app.algorithms.visualization.models import SearchTreeData, VisualNode
from app.games.tic_tac_toe import TicTacToeGame


def _play(moves: list[tuple[int, int]]) -> TicTacToeGame:
    game = TicTacToeGame()
    for row, col in moves:
        game.make_move(row, col)
    return game


IMMEDIATE_WIN_MOVES = [(0, 0), (1, 0), (0, 1), (1, 1)]  # X to move, wins at (0, 2)


class TestBuildSearchTreeMinimax:
    def test_produces_a_tree_matching_the_real_result(self):
        game = _play(IMMEDIATE_WIN_MOVES)
        direct_result = minimax.find_best_move(_play(IMMEDIATE_WIN_MOVES), "X")
        tree = build_search_tree(game, "X", "minimax")

        assert tree.algorithm == "minimax"
        assert tree.best_move == {"row": direct_result.best_move[0], "col": direct_result.best_move[1]}
        assert tree.statistics["nodes_visited"] == direct_result.nodes_visited
        assert tree.statistics["terminal_nodes"] == direct_result.terminal_nodes
        assert tree.nodes[tree.root_id].evaluation == direct_result.evaluation

    def test_root_node_has_no_parent_and_no_move(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "minimax")
        root = tree.nodes[tree.root_id]
        assert root.parent_id is None
        assert root.move is None
        assert root.depth == 0

    def test_root_role_matches_ai_player(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "minimax")
        assert tree.nodes[tree.root_id].role == "MAX"

    def test_minimax_tree_has_zero_pruned_nodes(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "minimax")
        assert all(node.status != "pruned" for node in tree.nodes.values())

    def test_node_count_equals_nodes_visited(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "minimax")
        assert len(tree.nodes) == tree.statistics["nodes_visited"]


class TestBuildSearchTreeAlphaBeta:
    def test_produces_a_tree_matching_the_real_result(self):
        game = _play(IMMEDIATE_WIN_MOVES)
        direct_result = alpha_beta.find_best_move(_play(IMMEDIATE_WIN_MOVES), "X")
        tree = build_search_tree(game, "X", "alpha_beta")

        assert tree.best_move == {"row": direct_result.best_move[0], "col": direct_result.best_move[1]}
        assert tree.statistics["alpha_beta_cutoffs"] == direct_result.alpha_beta_cutoffs
        assert tree.statistics["branches_pruned"] == direct_result.branches_pruned
        assert tree.nodes[tree.root_id].evaluation == direct_result.evaluation

    def test_total_nodes_equals_explored_plus_pruned(self):
        direct_result = alpha_beta.find_best_move(_play(IMMEDIATE_WIN_MOVES), "X")
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        pruned_count = sum(1 for node in tree.nodes.values() if node.status == "pruned")
        explored_count = sum(1 for node in tree.nodes.values() if node.status != "pruned")
        assert pruned_count == direct_result.branches_pruned
        assert explored_count == direct_result.nodes_visited
        assert len(tree.nodes) == pruned_count + explored_count

    def test_pruned_nodes_are_never_marked_as_evaluated_and_have_no_children(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        pruned_nodes = [node for node in tree.nodes.values() if node.status == "pruned"]
        assert len(pruned_nodes) > 0  # this position is known to prune (see docs/ALGORITHM_COMPARISON.md)
        for node in pruned_nodes:
            assert node.evaluation is None
            assert node.board is None
            assert node.is_terminal is False
            assert node.children_ids == []

    def test_pruned_nodes_have_a_parent_and_a_move(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        for node in tree.nodes.values():
            if node.status == "pruned":
                assert node.parent_id is not None
                assert node.move is not None

    def test_alpha_updates_are_reflected_on_some_node(self):
        tree = build_search_tree(TicTacToeGame(), "X", "alpha_beta")
        alpha_events = [e for e in tree.events if e["type"] == "alpha_updated"]
        assert len(alpha_events) > 0
        for e in alpha_events:
            assert e["newAlpha"] > e["oldAlpha"]

    def test_cutoff_and_branch_pruned_event_counts_match_statistics(self):
        tree = build_search_tree(TicTacToeGame(), "X", "alpha_beta")
        cutoff_events = [e for e in tree.events if e["type"] == "cutoff_triggered"]
        pruned_events = [e for e in tree.events if e["type"] == "branch_pruned"]
        assert len(cutoff_events) == tree.statistics["alpha_beta_cutoffs"]
        assert len(pruned_events) == tree.statistics["branches_pruned"]


class TestNodeIdsAndOrdering:
    def test_node_ids_are_deterministic_across_repeated_runs(self):
        tree1 = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        tree2 = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        assert tree1.root_id == tree2.root_id
        assert set(tree1.nodes.keys()) == set(tree2.nodes.keys())
        for node_id in tree1.nodes:
            assert tree1.nodes[node_id].to_dict() == tree2.nodes[node_id].to_dict()

    def test_node_ids_are_unique(self):
        tree = build_search_tree(TicTacToeGame(), "X", "alpha_beta")
        assert len(tree.nodes) == len(set(tree.nodes.keys()))

    def test_event_indices_are_sequential_from_zero(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "minimax")
        assert [e["index"] for e in tree.events] == list(range(len(tree.events)))

    def test_parent_child_relationships_are_consistent(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        for node_id, node in tree.nodes.items():
            for child_id in node.children_ids:
                assert tree.nodes[child_id].parent_id == node_id

    def test_a_node_is_entered_before_any_event_referencing_its_children(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        entered_so_far: set[str] = set()
        for event in tree.events:
            node_id = event.get("nodeId")
            parent_id = event.get("parentId")
            if event["type"] == "node_entered":
                if parent_id is not None:
                    assert parent_id in entered_so_far
                entered_so_far.add(node_id)
            elif node_id is not None and event["type"] != "branch_pruned":
                assert node_id in entered_so_far


class TestTerminalRepresentation:
    def test_terminal_nodes_have_evaluation_and_are_marked_evaluated(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "minimax")
        terminal_nodes = [n for n in tree.nodes.values() if n.is_terminal]
        assert len(terminal_nodes) == tree.statistics["terminal_nodes"]
        for node in terminal_nodes:
            assert node.status == "evaluated"
            assert node.evaluation is not None
            assert node.board is not None

    def test_non_terminal_internal_nodes_are_completed_not_evaluated(self):
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "minimax")
        for node in tree.nodes.values():
            if not node.is_terminal and node.status != "pruned":
                assert node.status == "completed"
                assert node.evaluation is not None


class TestSerialization:
    def test_to_dict_round_trips_through_json(self):
        import json

        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        serialized = json.dumps(tree.to_dict())
        restored = json.loads(serialized)
        assert restored["rootId"] == tree.root_id
        assert len(restored["nodes"]) == len(tree.nodes)
        assert len(restored["events"]) == len(tree.events)

    def test_no_circular_references_in_node_dict(self):
        # A node's dict only ever contains ids (strings), never nested
        # VisualNode/SearchTreeData objects, so json.dumps can't recurse forever.
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "alpha_beta")
        for node in tree.nodes.values():
            d = node.to_dict()
            assert all(not isinstance(v, (VisualNode, SearchTreeData)) for v in d.values())

    def test_invalid_algorithm_name_raises(self):
        import pytest

        with pytest.raises(ValueError):
            build_search_tree(TicTacToeGame(), "X", "not_a_real_algorithm")


class TestEmptyAndMalformedSequences:
    def test_unused_observer_builds_an_empty_tree_safely(self):
        observer = TreeBuildingObserver(ai_player="X")
        tree = observer.build(
            algorithm="minimax", ai_player="X", opponent_player="O",
            statistics={}, best_move=(0, 0),
        )
        assert tree.root_id is None
        assert tree.nodes == {}
        assert tree.events == []
        assert tree.to_dict()["rootId"] is None  # does not raise

    def test_value_returned_with_empty_stack_does_not_raise(self):
        observer = TreeBuildingObserver(ai_player="X")
        observer.on_value_returned(depth=0, value=5)  # no on_node_entered ever called
        assert observer.events[-1]["nodeId"] is None

    def test_branch_pruned_with_no_current_node_does_not_raise(self):
        observer = TreeBuildingObserver(ai_player="X")
        observer.on_branch_pruned(depth=0, move=(1, 1), player="O")
        assert len(observer.nodes) == 1
        pruned = next(iter(observer.nodes.values()))
        assert pruned.parent_id is None

    def test_alpha_beta_only_methods_are_harmless_when_never_called_by_minimax(self):
        # Minimax's solver never calls on_alpha_updated/on_cutoff_triggered/etc.
        # — confirm the observer still builds a valid, consistent tree.
        tree = build_search_tree(_play(IMMEDIATE_WIN_MOVES), "X", "minimax")
        assert not any(e["type"] in {"alpha_updated", "beta_updated", "cutoff_triggered", "branch_pruned"} for e in tree.events)


class TestAlgorithmBehaviorUnchanged:
    """Confirms attaching the visualization observer never changes what
    the algorithm actually decides — the adapter is purely observational."""

    def test_minimax_result_identical_with_and_without_observer(self):
        plain = minimax.find_best_move(_play(IMMEDIATE_WIN_MOVES), "X")
        observer = TreeBuildingObserver(ai_player="X")
        observed = minimax.find_best_move(_play(IMMEDIATE_WIN_MOVES), "X", observer=observer)
        assert plain.best_move == observed.best_move
        assert plain.evaluation == observed.evaluation
        assert plain.nodes_visited == observed.nodes_visited

    def test_alpha_beta_result_identical_with_and_without_observer(self):
        plain = alpha_beta.find_best_move(_play(IMMEDIATE_WIN_MOVES), "X")
        observer = TreeBuildingObserver(ai_player="X")
        observed = alpha_beta.find_best_move(_play(IMMEDIATE_WIN_MOVES), "X", observer=observer)
        assert plain.best_move == observed.best_move
        assert plain.evaluation == observed.evaluation
        assert plain.alpha_beta_cutoffs == observed.alpha_beta_cutoffs
        assert plain.branches_pruned == observed.branches_pruned
