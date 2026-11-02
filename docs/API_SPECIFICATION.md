# API Specification

Base path: `/api/v1`. All request/response bodies are JSON. This
describes the planned contract; no endpoints are implemented yet.

## Common Error Schema

```json
{
  "error": {
    "code": "ILLEGAL_MOVE",
    "message": "Cell 4 is already occupied.",
    "details": { "position": 4 }
  }
}
```

| HTTP Status | `code` examples |
|---|---|
| 400 | `ILLEGAL_MOVE`, `INVALID_ALGORITHM`, `INVALID_DIFFICULTY` |
| 404 | `SESSION_NOT_FOUND`, `MATCH_NOT_FOUND` |
| 409 | `MATCH_ALREADY_COMPLETE`, `GAME_ALREADY_COMPLETE` |

## Tic-Tac-Toe Endpoints

### Create session
`POST /tic-tac-toe/sessions`

```json
// request
{ "mode": "human_vs_ai", "ai_plays": "O" }

// response 201
{
  "session_id": "ttt_8f2a",
  "board": ["", "", "", "", "", "", "", "", ""],
  "current_player": "X",
  "status": "in_progress"
}
```

### Submit human move
`POST /tic-tac-toe/sessions/{session_id}/move`

```json
// request
{ "position": 4 }

// response 200
{
  "board": ["", "", "", "", "X", "", "", "", ""],
  "current_player": "O",
  "status": "in_progress",
  "winning_line": null
}
```

### Request AI move
`POST /tic-tac-toe/sessions/{session_id}/ai-move`

```json
// request
{ "algorithm": "alpha_beta_ordered", "difficulty": "hard" }

// response 200
{
  "board": ["", "", "", "", "X", "O", "", "", ""],
  "move": 5,
  "status": "in_progress",
  "search_tree": [ /* ordered search-event list, see SEARCH_VISUALIZATION_DESIGN.md */ ],
  "metrics": { "nodes_visited": 412, "nodes_pruned": 231, "elapsed_ms": 3.8 }
}
```

### Undo / Restart

```
POST /tic-tac-toe/sessions/{session_id}/undo
POST /tic-tac-toe/sessions/{session_id}/restart
```

Both return the same shape as "submit human move."

### Get move history
`GET /tic-tac-toe/sessions/{session_id}/history`

```json
{ "moves": [ /* move history records, see GAME_ENGINE_DESIGN.md */ ] }
```

## Rock Paper Scissors Endpoints

### Create match
`POST /rps/matches`

```json
// request
{ "mode": "human_vs_ai", "best_of": 5, "ai_strategy": "nash_uniform" }

// response 201
{ "match_id": "m_0007", "best_of": 5, "scoreboard": { "human_wins": 0, "opponent_wins": 0, "ties": 0 }, "status": "in_progress" }
```

### Submit round
`POST /rps/matches/{match_id}/round`

```json
// request
{ "human_choice": "ROCK" }

// response 200
{
  "round_number": 1,
  "human_choice": "ROCK",
  "opponent_choice": "SCISSORS",
  "result": "human_win",
  "scoreboard": { "human_wins": 1, "opponent_wins": 0, "ties": 0 },
  "status": "in_progress"
}
```

### Get payoff matrix
`GET /rps/payoff-matrix`

```json
{
  "matrix": {
    "ROCK":     { "ROCK": 0,  "PAPER": -1, "SCISSORS": 1 },
    "PAPER":    { "ROCK": 1,  "PAPER": 0,  "SCISSORS": -1 },
    "SCISSORS": { "ROCK": -1, "PAPER": 1,  "SCISSORS": 0 }
  }
}
```

### Get equilibrium analysis
`GET /rps/equilibrium`

```json
{
  "equilibrium": { "ROCK": 0.3333, "PAPER": 0.3333, "SCISSORS": 0.3333 },
  "game_value": 0.0
}
```

### Sequential educational search
`POST /rps/educational/sequential-search`

```json
// request
{ "p1_choice": "ROCK" }

// response 200
{
  "chosen_response": "PAPER",
  "search_tree": [ /* same schema as Tic-Tac-Toe search_tree */ ],
  "label": "Educational — Sequential Variant, Not Standard RPS"
}
```

### Get match history
`GET /rps/matches/{match_id}`

```json
{ "match_id": "m_0007", "rounds": [ /* ... */ ], "scoreboard": { /* ... */ }, "status": "complete" }
```

## Analytics Endpoints

### Compare algorithms
`GET /analytics/algorithm-comparison?game=tic_tac_toe`

```json
{
  "runs": [
    { "algorithm": "minimax", "avg_nodes_visited": 5478, "avg_elapsed_ms": 11.2 },
    { "algorithm": "alpha_beta_unordered", "avg_nodes_visited": 2114, "avg_elapsed_ms": 4.6 },
    { "algorithm": "alpha_beta_ordered", "avg_nodes_visited": 892, "avg_elapsed_ms": 2.1 }
  ]
}
```

### Simulation history
`GET /analytics/simulations?game=rps&limit=20`

Returns a paginated list of past matches/games with summary metrics for
the Insights → Simulation History page.
