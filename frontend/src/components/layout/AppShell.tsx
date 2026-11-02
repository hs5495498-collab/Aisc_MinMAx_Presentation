import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileTabBar } from '@/components/navigation/MobileTabBar'
import { Topbar } from '@/components/navigation/Topbar'
import { CommandPalette } from '@/components/navigation/CommandPalette'
import { PageTransition } from './PageTransition'
import { findRouteMeta, dashboardRoute } from '@/lib/routes'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'

export function AppShell() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useLocalStorageState('nav.sidebarCollapsed', false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const route = findRouteMeta(location.pathname) ?? dashboardRoute

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent-violet focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar route={route} onOpenPalette={() => setPaletteOpen(true)} />
        <main id="main-content" className="flex-1 p-4 lg:p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileTabBar />
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  )
}
