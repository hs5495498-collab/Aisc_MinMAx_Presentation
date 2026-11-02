"""Rock Paper Scissors: a pure-Python game-theory engine (Phase 8) plus
a pure-Python match/session engine built on top of it (Phase 9).

- **Phase 8** — mathematics only: payoff matrix, mixed strategies,
  expected payoff, best response, Nash equilibrium, exploitability.
  Standard RPS is simultaneous-action and zero-sum, solved with
  mixed-strategy equilibrium analysis, never Minimax/Alpha-Beta (see
  docs/RPS_STRATEGY_ENGINE.md and docs/GAME_THEORY_DESIGN.md).
- **Phase 9** — a playable match: round locking/resolution, scoring,
  match completion, and history, built on top of Phase 8 without
  duplicating its rules (see docs/RPS_GAMEPLAY.md).

**No HTTP layer exists here** — Phase 12 will expose this engine over
an API; see docs/RPS_GAMEPLAY.md's integration-boundary section.

Public API::

    from app.games.rock_paper_scissors import (
        # Phase 8 — math
        Action, Player, MixedStrategy,
        payoff_a, payoff_b, resolve_round,
        expected_payoff, best_response, exploitability,
        derive_uniform_equilibrium, verify_equilibrium,
        uniform_strategy, validated_strategy, sample_action,
        # Phase 9 — gameplay
        AIStrategyKind, AIStrategyConfig,
        MatchConfig, RPSMatch, RoundRecord, Score, MatchStatus, MatchWinner, RoundResult,
        create_match,
    )
"""

from .ai_strategies import AIStrategyConfig, AIStrategyKind, DEFAULT_BIASED_DEMO_PROBABILITIES
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
from .exceptions import (
    InvalidActionError,
    InvalidMatchConfigError,
    InvalidMixedStrategyError,
    MatchAlreadyCompleteError,
    MatchError,
    MoveAlreadyLockedError,
    NoPendingMoveError,
    RPSError,
)
from .match import MatchConfig, MatchStatus, MatchWinner, RoundRecord, RoundResult, RPSMatch, Score
from .models import ACTIONS, Action, MixedStrategy, Player, RoundOutcome
from .payoff import PAYOFF_MATRIX, payoff_a, payoff_b, resolve_round
from .session import create_match
from .strategy import sample_action, sample_actions, uniform_strategy, validated_strategy

__all__ = [
    # Phase 8 — math
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
    # Phase 9 — gameplay
    "AIStrategyKind",
    "AIStrategyConfig",
    "DEFAULT_BIASED_DEMO_PROBABILITIES",
    "MatchError",
    "InvalidMatchConfigError",
    "MatchAlreadyCompleteError",
    "MoveAlreadyLockedError",
    "NoPendingMoveError",
    "MatchConfig",
    "MatchStatus",
    "MatchWinner",
    "RoundResult",
    "Score",
    "RoundRecord",
    "RPSMatch",
    "create_match",
]
