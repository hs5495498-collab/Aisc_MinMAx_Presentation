"""Standard Alpha-Beta Pruning search for Tic-Tac-Toe.

Built on the same engine interface as Minimax
(``legal_moves()``, ``make_move()``, ``undo()``, ``status``,
``current_player``, ``winner``, ``is_game_over``), and reusing
Minimax's terminal evaluator directly — this module defines **no**
separate scoring rule, so the two algorithms are guaranteed to agree
on every terminal position by construction, not by coincidence.

Uses exactly the same row-major move ordering as Minimax
(``game.legal_moves()``), so the only difference between this module
and ``app.algorithms.minimax.solver`` is the alpha/beta cutoff below —
making a fair Phase 6 comparison possible.
"""

from __future__ import annotations

import copy
import time

from app.algorithms.minimax.evaluator import evaluate_terminal
from app.games.tic_tac_toe.engine import TicTacToeGame
from app.games.tic_tac_toe.models import Mark

from .exceptions import GameOverError, NotAITurnError
from .models import AlphaBetaResult, AlphaBetaStats
from .observer import SearchObserver

_NEG_INF = -1_000_000
_POS_INF = 1_000_000


def _clone_game(game: TicTacToeGame) -> TicTacToeGame:
    """Same adapter strategy as Minimax's: treat ``TicTacToeGame`` as
    opaque and clone it only through ``copy.deepcopy``, never by
    reaching into its private attributes."""
    return copy.deepcopy(game)


def _alpha_beta(
    game: TicTacToeGame,
    ai_mark: Mark,
    depth: int,
    alpha: int,
    beta: int,
    stats: AlphaBetaStats,
    observer: SearchObserver | None,
) -> int:
    """Recursively evaluate ``game`` with Alpha-Beta Pruning.

    Mutates ``game`` via ``make_move``/``undo`` as it recurses, always
    undoing before returning, exactly like Minimax's ``_minimax``.
    """
    stats.nodes_visited += 1
    stats.maximum_search_depth = max(stats.maximum_search_depth, depth)

    if observer is not None:
        observer.on_node_entered(
            depth=depth, board=game.board_flat, player=game.current_player, alpha=alpha, beta=beta
        )

    if game.is_game_over:
        score = evaluate_terminal(game, ai_mark, depth)
        stats.terminal_nodes += 1
        stats.leaves_evaluated += 1
        if observer is not None:
            observer.on_terminal_evaluated(depth=depth, board=game.board_flat, score=score)
            observer.on_value_returned(depth=depth, value=score)
        return score

    maximizing = game.current_player == ai_mark.value
    moves = game.legal_moves()  # row-major — identical ordering to Minimax
    value = _NEG_INF if maximizing else _POS_INF

    for index, (row, col) in enumerate(moves):
        stats.moves_considered += 1
        if observer is not None:
            observer.on_move_explored(depth=depth, move=(row, col), player=game.current_player)

        game.make_move(row, col)
        child_value = _alpha_beta(game, ai_mark, depth + 1, alpha, beta, stats, observer)
        game.undo()

        if maximizing:
            if child_value > value:
                value = child_value
            if value > alpha:
                old_alpha, alpha = alpha, value
                if observer is not None:
                    observer.on_alpha_updated(depth=depth, old_alpha=old_alpha, new_alpha=alpha)
        else:
            if child_value < value:
                value = child_value
            if value < beta:
                old_beta, beta = beta, value
                if observer is not None:
                    observer.on_beta_updated(depth=depth, old_beta=old_beta, new_beta=beta)

        if alpha >= beta:
            remaining = moves[index + 1 :]
            stats.alpha_beta_cutoffs += 1
            stats.branches_pruned += len(remaining)
            if observer is not None:
                observer.on_cutoff_triggered(
                    depth=depth,
                    role="MAX" if maximizing else "MIN",
                    alpha=alpha,
                    beta=beta,
                    reason="alpha_beta_cutoff",
                )
                for pruned_move in remaining:
                    observer.on_branch_pruned(depth=depth, move=pruned_move, player=game.current_player)
            break

    if observer is not None:
        observer.on_value_returned(depth=depth, value=value)
    return value


def find_best_move(
    game: TicTacToeGame,
    ai_player: str | Mark,
    observer: SearchObserver | None = None,
) -> AlphaBetaResult:
    """Find the Alpha-Beta-optimal move for ``ai_player`` in ``game``.

    Validation, non-mutation guarantee, row-major move ordering, and
    strict-greater-than tie-breaking are all identical to
    ``app.algorithms.minimax.solver.find_best_move`` — see
    docs/ALPHA_BETA_IMPLEMENTATION.md §5 for why this makes the two
    directly comparable.

    :raises GameOverError: if ``game`` has already ended.
    :raises NotAITurnError: if ``ai_player`` is not the current player.
    """
    ai_mark = Mark(ai_player) if isinstance(ai_player, str) else ai_player

    if game.is_game_over:
        raise GameOverError(game.status.value)
    if game.current_player != ai_mark.value:
        raise NotAITurnError(ai_player=ai_mark.value, current_player=game.current_player)

    clone = _clone_game(game)
    stats = AlphaBetaStats()
    start = time.perf_counter()

    alpha, beta = _NEG_INF, _POS_INF
    stats.nodes_visited += 1  # the root node itself
    if observer is not None:
        observer.on_node_entered(
            depth=0, board=clone.board_flat, player=clone.current_player, alpha=alpha, beta=beta
        )

    moves = clone.legal_moves()  # row-major, identical to Minimax
    best_move: tuple[int, int] | None = None
    best_score = _NEG_INF

    for index, (row, col) in enumerate(moves):
        stats.moves_considered += 1
        if observer is not None:
            observer.on_move_explored(depth=0, move=(row, col), player=clone.current_player)

        clone.make_move(row, col)
        score = _alpha_beta(clone, ai_mark, 1, alpha, beta, stats, observer)
        clone.undo()

        if score > best_score or best_move is None:
            best_score = score
            best_move = (row, col)
            if observer is not None:
                observer.on_best_move_updated(move=best_move, score=best_score)

        if best_score > alpha:
            alpha = best_score

        # The root is a MAX node with no ancestor MIN bound, so beta
        # stays +inf and this can never actually trigger — kept for
        # structural symmetry with `_alpha_beta` and documented as such.
        if alpha >= beta:  # pragma: no cover - unreachable at the root by construction
            remaining = moves[index + 1 :]
            stats.alpha_beta_cutoffs += 1
            stats.branches_pruned += len(remaining)
            break

    if observer is not None:
        observer.on_value_returned(depth=0, value=best_score)

    elapsed_ms = (time.perf_counter() - start) * 1000

    assert best_move is not None  # unreachable: game not over => legal_moves() is nonempty

    return AlphaBetaResult(
        best_move=best_move,
        evaluation=best_score,
        ai_player=ai_mark.value,
        opponent_player=ai_mark.opponent().value,
        nodes_visited=stats.nodes_visited,
        terminal_nodes=stats.terminal_nodes,
        leaves_evaluated=stats.leaves_evaluated,
        moves_considered=stats.moves_considered,
        maximum_search_depth=stats.maximum_search_depth,
        execution_time_ms=elapsed_ms,
        alpha_beta_cutoffs=stats.alpha_beta_cutoffs,
        branches_pruned=stats.branches_pruned,
    )


__all__ = ["find_best_move"]
