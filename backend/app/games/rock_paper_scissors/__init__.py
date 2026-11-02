"""Pure-Python mathematical strategy engine for standard Rock Paper
Scissors (Phase 8) — game theory only: payoff matrix, mixed
strategies, expected payoff, best response, Nash equilibrium, and
exploitability.

**No gameplay session, no human-vs-AI interaction, and no HTTP layer
exist here** — see Phase 9+ for those. Standard RPS is a
simultaneous-action, zero-sum game and is solved with mixed-strategy
equilibrium analysis, never with Minimax/Alpha-Beta (see
docs/RPS_STRATEGY_ENGINE.md and docs/GAME_THEORY_DESIGN.md).

Public API::

    from app.games.rock_paper_scissors import (
        Action, Player, MixedStrategy,
        payoff_a, payoff_b, resolve_round,
        expected_payoff, best_response, exploitability,
        derive_uniform_equilibrium, verify_equilibrium,
        uniform_strategy, validated_strategy, sample_action,
    )
"""

from .analysis import (
    BestResponseResult,
    ExploitabilityResult,
    best_response,
    expected_payoff,
    expected_payoff_a,
    expected_payoff_b,
    exploitability,
)
from .equilibrium import EquilibriumVerification, derive_uniform_equilibrium, exact_game_value_at_uniform, verify_equilibrium
from .exceptions import InvalidActionError, InvalidMixedStrategyError, RPSError
from .models import ACTIONS, Action, MixedStrategy, Player, RoundOutcome
from .payoff import PAYOFF_MATRIX, payoff_a, payoff_b, resolve_round
from .strategy import sample_action, sample_actions, uniform_strategy, validated_strategy

__all__ = [
    "Action",
    "ACTIONS",
    "Player",
    "RoundOutcome",
    "MixedStrategy",
    "RPSError",
    "InvalidActionError",
    "InvalidMixedStrategyError",
    "PAYOFF_MATRIX",
    "payoff_a",
    "payoff_b",
    "resolve_round",
    "expected_payoff",
    "expected_payoff_a",
    "expected_payoff_b",
    "BestResponseResult",
    "best_response",
    "ExploitabilityResult",
    "exploitability",
    "EquilibriumVerification",
    "derive_uniform_equilibrium",
    "exact_game_value_at_uniform",
    "verify_equilibrium",
    "uniform_strategy",
    "validated_strategy",
    "sample_action",
    "sample_actions",
]
