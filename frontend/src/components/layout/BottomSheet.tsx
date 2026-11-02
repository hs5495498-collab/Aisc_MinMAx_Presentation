import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Mobile-only bottom sheet, used by the search-tree pages to present
 * the config/stats/node-inspector panels without permanently
 * occupying vertical space — this replaces Phase 3's documented
 * simplification (those panels just stacked vertically under the
 * canvas on mobile) specifically for the pages that now have a real,
 * data-rich workspace worth reclaiming screen space for. See
 * docs/SEARCH_TREE_VISUALIZATION.md "Mobile Behavior".
 */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 lg:hidden"
      onClick={onClose}
    >
      <div
        className="max-h-[70vh] w-full overflow-y-auto rounded-t-2xl border-t border-surface-card-border bg-bg-gradient-end p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-text-tertiary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
