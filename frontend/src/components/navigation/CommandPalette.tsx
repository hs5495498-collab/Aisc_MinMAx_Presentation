import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { allRoutes } from '@/lib/routes'

/**
 * Rendered only while open (see AppShell: `{paletteOpen && <CommandPalette .../>}`),
 * so mounting is itself the "reset" — no effect needs to clear `query` on open.
 */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allRoutes
    return allRoutes.filter(
      (route) => route.label.toLowerCase().includes(q) || route.description.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick navigation"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-surface-card-border bg-bg-gradient-end shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-surface-card-border px-4 py-3">
          <Search size={16} className="text-text-tertiary" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, labs, lessons…"
            aria-label="Search pages"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          <kbd className="rounded-sm border border-surface-card-border px-1.5 py-0.5 text-[10px] text-text-tertiary">
            Esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-text-tertiary">No matching pages.</li>
          )}
          {results.map((route) => (
            <li key={route.path}>
              <button
                onClick={() => {
                  navigate(route.path)
                  onClose()
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                <route.icon size={16} />
                <span>
                  <span className="block font-medium text-text-primary">{route.label}</span>
                  <span className="block text-xs text-text-tertiary">{route.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
