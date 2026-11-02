import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { navSections } from '@/lib/routes'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

/** Desktop sidebar — fixed 260px, collapsible to a 72px icon rail. See UI_UX_DESIGN.md §3. */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-surface-card-border bg-black/20 transition-all duration-200 lg:flex ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        {!collapsed && (
          <span className="font-display text-sm font-semibold text-text-primary">
            Competitive AI Game Lab
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-md p-1.5 text-text-tertiary hover:bg-white/5 hover:text-text-primary"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6 no-scrollbar">
        {navSections.map((section) => (
          <div key={section.key}>
            {section.directPath ? (
              <NavLink
                to={section.directPath}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-violet/15 text-accent-violet'
                      : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  }`
                }
              >
                <section.icon size={18} />
                {!collapsed && section.label}
              </NavLink>
            ) : (
              <>
                {!collapsed && (
                  <p className="mb-1 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    <section.icon size={14} />
                    {section.label}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        title={item.label}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                            collapsed ? 'justify-center' : 'pl-5'
                          } ${
                            isActive
                              ? 'bg-accent-violet/15 font-medium text-accent-violet'
                              : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                          }`
                        }
                      >
                        <item.icon size={16} />
                        {!collapsed && item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
