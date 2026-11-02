"""Generates real search-tree visualization fixtures for the frontend.

Run from `backend/`:

    PYTHONPATH=. python scripts/generate_visualization_fixtures.py

This is NOT a FastAPI endpoint — Phase 7 does not implement a backend
API. Instead, this script runs the real Minimax/Alpha-Beta solvers
(with `TreeBuildingObserver` attached) once, offline, and writes their
genuine recorded output as static JSON the frontend loads and replays.
Every number in the generated files comes from an actual algorithm
execution — see docs/SEARCH_TREE_VISUALIZATION.md for why this
approach was chosen over fabricating or hand-authoring tree data.

Re-run this script and commit the regenerated files whenever the
curated position list changes, or after any change to either solver.
"""

from __future__ import annotations

import json
from pathlib import Path

from app.algorithms.visualization import build_search_tree
from app.games.tic_tac_toe import TicTacToeGame

OUTPUT_DIR = Path(__file__).resolve().parents[2] / "frontend" / "src" / "data" / "search-trees"

#: (fixture_name, label, moves, ai_player, size_tier)
#: size_tier is metadata only (used by the frontend to decide whether to
#: show a "large dataset" warning before loading) — it does not change
#: how the fixture itself is generated.
POSITIONS: list[tuple[str, str, list[tuple[int, int]], str, str]] = [
    ("immediate-win", "Immediate win available", [(0, 0), (1, 0), (0, 1), (1, 1)], "X", "small"),
    ("must-block", "Must block opponent win", [(0, 0), (1, 0), (0, 1)], "O", "large"),
]

#: A position deliberately NOT generated as a shipped static fixture:
#: [(0, 0), (1, 1)] ("many branches") produces a 7,332-node / 25,464-event
#: Minimax tree whose JSON is ~5.8MB — too large to commit as a bundled
#: frontend asset. The adapter and this script both fully support it
#: (and even larger positions, up to the empty board's 549,946 nodes);
#: it is simply not pre-generated here. See docs/SEARCH_TREE_VISUALIZATION.md
#: "Known Limitations" for how to generate it yourself if needed.


def _play(moves: list[tuple[int, int]]) -> TicTacToeGame:
    game = TicTacToeGame()
    for row, col in moves:
        game.make_move(row, col)
    return game


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = []

    for fixture_name, label, moves, ai_player, size_tier in POSITIONS:
        for algorithm in ("minimax", "alpha_beta"):
            game = _play(moves)
            tree = build_search_tree(game, ai_player, algorithm, position_label=label)
            data = tree.to_dict()
            data["sizeTier"] = size_tier
            data["initialMoves"] = [{"row": r, "col": c} for r, c in moves]

            out_path = OUTPUT_DIR / f"{fixture_name}-{algorithm}.json"
            out_path.write_text(json.dumps(data), encoding="utf-8")

            manifest.append(
                {
                    "fixture": fixture_name,
                    "algorithm": algorithm,
                    "label": label,
                    "sizeTier": size_tier,
                    "nodeCount": len(data["nodes"]),
                    "eventCount": len(data["events"]),
                    "nodesVisited": data["statistics"]["nodes_visited"],
                    "file": out_path.name,
                }
            )
            print(
                f"{fixture_name:16s} {algorithm:10s} nodes={data['statistics']['nodes_visited']:>6} "
                f"events={len(data['events']):>6} -> {out_path.relative_to(OUTPUT_DIR.parents[3])}"
            )

    (OUTPUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nWrote manifest with {len(manifest)} entries to {OUTPUT_DIR / 'manifest.json'}")


if __name__ == "__main__":
    main()
