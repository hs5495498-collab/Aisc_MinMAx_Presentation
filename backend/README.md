# Competitive AI Game Lab — Backend

Phase 4 implementation: a pure-Python, rules-only Tic-Tac-Toe game
engine. No FastAPI, no database, no AI/search algorithms yet — see
[`../docs/TIC_TAC_TOE_ENGINE.md`](../docs/TIC_TAC_TOE_ENGINE.md) for
the full design write-up and
[`../docs/SYSTEM_ARCHITECTURE.md`](../docs/SYSTEM_ARCHITECTURE.md) for
how this fits the overall backend.

## Requirements

- Python 3.12 (tested against 3.12.5)
- `pytest` for running tests — the engine itself has **zero** runtime
  dependencies (standard library only)

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

## Running tests

```bash
cd backend
pytest
```

## Structure

```
backend/
  app/
    games/
      tic_tac_toe/
        engine.py       # TicTacToeGame, evaluate_board, validate_move
        models.py       # Mark, GameStatus, Board, Move, GameState
        exceptions.py   # InvalidPositionError, OccupiedCellError, ...
  tests/
    test_tic_tac_toe.py
  requirements.txt
  pytest.ini
```

## Usage

```python
from app.games.tic_tac_toe import TicTacToeGame

game = TicTacToeGame()
game.make_move(0, 0)   # X
game.make_move(1, 1)   # O
game.make_move(0, 1)   # X
game.make_move(2, 2)   # O
game.make_move(0, 2)   # X completes the top row

print(game.status)        # GameStatus.X_WON
print(game.winner)        # "X"
print(game.to_dict())     # JSON-ready snapshot
```

## Known limitations (expected at this phase)

- No AI opponent (Minimax/Alpha-Beta arrive Phase 5-6).
- No HTTP layer (FastAPI arrives Phase 12).
- No persistence — each `TicTacToeGame` instance lives only in memory
  for the life of the Python process/object holding it.
