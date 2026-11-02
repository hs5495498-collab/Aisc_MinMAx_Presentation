import type { VisualNode } from '@/types/searchTree'
import { explainNodeStatus, formatBound, formatEvaluation } from '@/lib/searchTreeExplain'

export function NodeInspectorPanel({ node }: { node: VisualNode | null }) {
  if (!node) {
    return <p className="text-text-tertiary">Select a node to inspect its board, value, and alpha/beta.</p>
  }

  return (
    <div className="space-y-3 text-xs">
      <dl className="space-y-1">
        <Row label="Node ID" value={node.id} />
        <Row label="Parent" value={node.parentId ?? 'none (root)'} />
        <Row label="Depth" value={String(node.depth)} />
        <Row label="Role" value={node.role ?? '—'} />
        <Row label="Status" value={node.status} />
        <Row label="Move" value={node.move ? `(${node.move.row}, ${node.move.col})` : '—'} />
        <Row label="Evaluation" value={formatEvaluation(node.evaluation)} />
        <Row label="Alpha" value={formatBound(node.alpha)} />
        <Row label="Beta" value={formatBound(node.beta)} />
        {node.isTerminal && <Row label="Terminal" value="yes" />}
      </dl>

      {node.board && (
        <div>
          <p className="mb-1 text-text-tertiary">Board</p>
          <div className="grid grid-cols-3 gap-0.5 w-24">
            {node.board.map((cell, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center border border-graph-grid font-mono text-text-primary"
              >
                {cell}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="rounded-sm border border-accent-cyan/30 bg-accent-cyan/5 p-2 text-text-secondary">
        {explainNodeStatus(node)}
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="text-right text-text-primary">{value}</dd>
    </div>
  )
}
