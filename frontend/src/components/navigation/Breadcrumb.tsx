import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { navSections } from '@/lib/routes'
import type { RouteMeta } from '@/types/nav'

export function Breadcrumb({ route }: { route: RouteMeta }) {
  const section = navSections.find((s) => s.key === route.section)
  const isSectionDirect = section?.directPath === route.path

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-text-tertiary">
      <Link to="/dashboard" className="hover:text-text-primary">
        {section?.label ?? 'Dashboard'}
      </Link>
      {!isSectionDirect && (
        <>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="font-medium text-text-primary" aria-current="page">
            {route.label}
          </span>
        </>
      )}
    </nav>
  )
}
