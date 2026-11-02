import { NavLink } from 'react-router-dom'
import type { RouteMeta } from '@/types/nav'

/**
 * Mobile-only sub-navigation strip for sections with multiple pages
 * (Games, Algorithm Labs, Insights, Learning). On desktop the sidebar
 * already lists these, so this is hidden at the `lg` breakpoint — see
 * docs/RESPONSIVE_DESIGN.md ("reached via an in-page segmented control
 * ... not nested hamburger menus").
 */
export function SectionSubNav({ items }: { items: RouteMeta[] }) {
  if (items.length < 2) return null
  return (
    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-1.5 rounded-pill border px-3.5 py-2 text-xs font-medium whitespace-nowrap ${
              isActive
                ? 'border-accent-magenta/40 bg-accent-magenta/15 text-accent-magenta'
                : 'border-surface-card-border text-text-secondary'
            }`
          }
        >
          <item.icon size={14} />
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}
