"""Standard (unpruned) Minimax search for Tic-Tac-Toe.

Builds entirely on the existing engine's public interface
(``legal_moves()``, ``make_move()``, ``undo()``, ``status``,
``current_player``, ``winner``, ``is_game_over``) — nothing here
reaches into the engine's private attributes, and nothing here
duplicates the engine's rules (win/draw detection, move legality).

**This module never maintains alpha/beta bounds and never prunes.**
Every legal successor of every nonterminal node is explored, which is
the entire point of Phase 5: a genuine, unpruned baseline for Phase
6's Alpha-Beta comparison. See docs/MINIMAX_IMPLEMENTATION.md §13.
"""

from __future__ import annotations

import copy
import time

from app.games.tic_tac_toe.engine import TicTacToeGame
from app.games.tic_tac_toe.models import Mark

from .evaluator import evaluate_terminal
from .exceptions import GameOverError, NotAITurnError
from .models import MinimaxResult, SearchStats
from .observer import SearchObserver

#: Strictly outside any real evaluation score (-10..+10 range), so the
#: first candidate move always replaces it at the root.
_NEG_INF = -1_000_000
_POS_INF = 1_000_000


def _clone_game(game: TicTacToeGame) -> TicTacToeGame:
    """An independent copy of ``game``, built only through ``copy.deepcopy``.

    This is the "small adapter" the Phase 5 brief asks for when the
    engine has no dedicated clone method: it treats ``TicTacToeGame``
    as an opaque object rather than reaching into its internals, so it
    keeps working even if the engine's private representation changes.
    """
    return copy.deepcopy(game)


def _minimax(
    game: TicTacToeGame,
    ai_mark: Mark,
    depth: int,
    stats: SearchStats,
    observer: SearchObserver | None,
) -> int:
    """Recursively evaluate ``game`` (already at ``depth`` plies from the root).

    Mutates ``game`` via ``make_move``/``undo`` as it recurses, but
    always undoes every move it makes before returning — so by the
    time this call returns, ``game`` is exactly as it was when this
    call was entered.
    """
    stats.nodes_visited += 1
    stats.maximum_search_depth = max(stats.maximum_search_depth, depth)

    if observer is not None:
        observer.on_node_entered(depth=depth, board=game.board_flat, player=game.current_player)

    if game.is_game_over:
        score = evaluate_terminal(game, ai_mark, depth)
        stats.terminal_nodes += 1
        stats.leaves_evaluated += 1
        if observer is not None:
            observer.on_terminal_evaluated(depth=depth, board=game.board_flat, score=score)
            observer.on_value_returned(depth=depth, value=score)
        return score

    maximizing = game.current_player == ai_mark.value
    best = _NEG_INF if maximizing else _POS_INF

    for row, col in game.legal_moves():
        stats.moves_considered += 1
        if observer is not None:
            observer.on_move_explored(depth=depth, move=(row, col), player=game.current_player)

        game.make_move(row, col)
        value = _minimax(game, ai_mark, depth + 1, stats, observer)
        game.undo()

        if maximizing:
            if value > best:
                best = value
        else:
            if value < best:
                best = value

    if observer is not None:
        observer.on_value_returned(depth=depth, value=best)
    return best


def find_best_move(
    game: TicTacToeGame,
    ai_player: str | Mark,
    observer: SearchObserver | None = None,
) -> MinimaxResult:
    """Find the Minimax-optimal move for ``ai_player`` in ``game``.

    ``game`` is **never mutated** — the search runs against an
    internal deep copy, so the caller's original object (board,
    history, current player, status) is identical before and after
    this call.

    :param ai_player: ``"X"``, ``"O"``, or the corresponding
        :class:`Mark` — whichever player Minimax should find the best
        move *for*. Must be whoever's turn it actually is right now.
    :param observer: optional :class:`SearchObserver` for Phase 7's
        future visualization; ``None`` (the default) adds no observable
        overhead.
    :raises GameOverError: if ``game`` has already ended.
    :raises NotAITurnError: if ``ai_player`` is not the current player.

    Tie-breaking is deterministic: among moves with equal Minimax
    value, the one that appears first in ``game.legal_moves()``'s
    row-major order (smallest row, then smallest column) wins, because
    a strictly-greater-than comparison only replaces the current best
    when a move is *strictly* better.
    """
    ai_mark = Mark(ai_player) if isinstance(ai_player, str) else ai_player

    if game.is_game_over:
        raise GameOverError(game.status.value)
    if game.current_player != ai_mark.value:
        raise NotAITurnError(ai_player=ai_mark.value, current_player=game.current_player)

    clone = _clone_game(game)
    stats = SearchStats()
    start = time.perf_counter()

    stats.nodes_visited += 1  # the root node itself
    stats.maximum_search_depth = max(stats.maximum_search_depth, 0)
    if observer is not None:
        observer.on_node_entered(depth=0, board=clone.board_flat, player=clone.current_player)

    best_move: tuple[int, int] | None = None
    best_score = _NEG_INF

    for row, col in clone.legal_moves():  # row-major order, per the engine
        stats.moves_considered += 1
        if observer is not None:
            observer.on_move_explored(depth=0, move=(row, col), player=clone.current_player)

        clone.make_move(row, col)
        score = _minimax(clone, ai_mark, depth=1, stats=stats, observer=observer)
        clone.undo()

        if score > best_score or best_move is None:
            best_score = score
            best_move = (row, col)
            if observer is not None:
                observer.on_best_move_updated(move=best_move, score=best_score)

    if observer is not None:
        observer.on_value_returned(depth=0, value=best_score)

    elapsed_ms = (time.perf_counter() - start) * 1000

    assert best_move is not None  # unreachable: game not over => legal_moves() is nonempty

    return MinimaxResult(
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
    )


__all__ = ["find_best_move"]
