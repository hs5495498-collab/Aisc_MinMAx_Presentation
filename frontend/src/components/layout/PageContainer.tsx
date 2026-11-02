import type { ReactNode } from 'react'
import type { RouteMeta } from '@/types/nav'

interface PageContainerProps {
  route: RouteMeta
  actions?: ReactNode
  children: ReactNode
}

/**
 * Theme-aware page shell: applies the Graph-theme grid background for
 * `theme: 'graph'` routes, and the standard gradient body background
 * (already global) for `theme: 'dashboard'` routes. See
 * UI_UX_DESIGN.md §2.
 */
export function PageContainer({ route, actions, children }: PageContainerProps) {
  return (
    <div className={route.theme === 'graph' ? '-m-4 lg:-m-6 min-h-[calc(100vh-57px)] graph-grid-bg p-4 lg:p-6' : ''}>
      <div className="mx-auto max-w-[1280px] pb-24 lg:pb-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary lg:text-3xl">{route.label}</h1>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">{route.description}</p>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
        {children}
      </div>
    </div>
  )
}
