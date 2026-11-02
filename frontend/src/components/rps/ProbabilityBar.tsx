export function ProbabilityBar({ label, probability }: { label: string; probability: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-text-secondary">
        <span>{label}</span>
        <span className="font-mono">{(probability * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2.5 w-full rounded-pill bg-white/10">
        <div
          className="h-full rounded-pill bg-gradient-to-r from-accent-violet to-accent-cyan"
          style={{ width: `${probability * 100}%` }}
        />
      </div>
    </div>
  )
}
