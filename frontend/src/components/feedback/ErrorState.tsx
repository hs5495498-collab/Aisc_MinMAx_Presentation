import { CircleX } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-md border border-state-error/30 bg-state-error/10 px-4 py-3 text-sm text-state-error"
    >
      <span className="flex items-center gap-2">
        <CircleX size={18} aria-hidden="true" />
        {message}
      </span>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} className="shrink-0">
          Retry
        </Button>
      ) : null}
    </div>
  )
}
