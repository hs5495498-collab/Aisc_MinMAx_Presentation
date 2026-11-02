import { useId } from 'react'
import type { ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  items: readonly TabItem[]
  activeId: string
  onChange: (id: string) => void
  children: ReactNode
}

/**
 * A small, keyboard-accessible tab strip (standard `<button>`s, so Tab
 * and Enter/Space already work with no extra handling) plus a single
 * `role="tabpanel"` for whichever child the caller renders for the
 * active tab. Used to split the RPS Strategy Lab into sections without
 * crowding everything onto one page.
 */
export function Tabs({ items, activeId, onChange, children }: TabsProps) {
  const panelId = useId()
  return (
    <div>
      <div role="tablist" aria-label="RPS Strategy Lab sections" className="-mx-1 mb-6 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1">
        {items.map((item) => {
          const selected = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${panelId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${panelId}-panel-${item.id}`}
              onClick={() => onChange(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                selected
                  ? 'border-accent-magenta/50 bg-accent-magenta/15 text-accent-magenta shadow-card'
                  : 'border-surface-card-border text-text-secondary hover:border-accent-violet/40 hover:text-text-primary'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${panelId}-panel-${activeId}`} aria-labelledby={`${panelId}-tab-${activeId}`}>
        {children}
      </div>
    </div>
  )
}
