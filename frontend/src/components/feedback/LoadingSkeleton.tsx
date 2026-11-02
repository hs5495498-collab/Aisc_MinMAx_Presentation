export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded-md bg-white/10" style={{ width: `${100 - i * 12}%` }} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}
