"""Phase 7 event adapter: turns real Minimax/Alpha-Beta observer
callbacks into a serializable, replayable search tree for the
frontend visualization. No FastAPI, no React, no fabricated events —
see docs/SEARCH_TREE_VISUALIZATION.md.
"""

from .models import SearchTreeData, VisualNode
from .tree_builder import TreeBuildingObserver, build_search_tree

__all__ = ["VisualNode", "SearchTreeData", "TreeBuildingObserver", "build_search_tree"]
