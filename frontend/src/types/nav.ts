import type { ComponentType } from 'react'

export type ThemeKind = 'dashboard' | 'graph'

export type NavSectionKey = 'dashboard' | 'games' | 'labs' | 'insights' | 'learning'

export interface IconProps {
  size?: number
  className?: string
}

export interface RouteMeta {
  path: string
  label: string
  section: NavSectionKey
  theme: ThemeKind
  /** One sentence shown in the page header / topbar breadcrumb tooltip. */
  description: string
  icon: ComponentType<IconProps>
}

export interface NavSection {
  key: NavSectionKey
  label: string
  icon: ComponentType<IconProps>
  /** True when the section itself is a single page (Dashboard has no sub-items). */
  directPath?: string
  items: RouteMeta[]
}
