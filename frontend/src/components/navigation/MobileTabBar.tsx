import { NavLink } from 'react-router-dom'
import { navSections } from '@/lib/routes'

/** Bottom tab bar for the five top-level sections on mobile. See UI_UX_DESIGN.md §3. */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-surface-card-border bg-bg-base/95 backdrop-blur-xl lg:hidden"
    >
      {navSections.map((section) => {
        const to = section.directPath ?? section.items[0]?.path ?? '/dashboard'
        return (
          <NavLink
            key={section.key}
            to={to}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] ${
                isActive ? 'text-accent-cyan' : 'text-text-tertiary'
              }`
            }
          >
            <section.icon size={20} />
            {section.label === 'Dashboard' ? 'Dash' : section.label.split(' ')[0]}
          </NavLink>
        )
      })}
    </nav>
  )
}
