import { useState } from 'react'
import { Search, Settings } from 'lucide-react'
import type { RouteMeta } from '@/types/nav'
import { Breadcrumb } from './Breadcrumb'
import { SettingsPanel } from './SettingsPanel'

interface TopbarProps {
  route: RouteMeta
  onOpenPalette: () => void
}

export function Topbar({ route, onOpenPalette }: TopbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="flex items-center justify-between gap-3 border-b border-surface-card-border bg-black/10 px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <Breadcrumb route={route} />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPalette}
          className="flex items-center gap-2 rounded-md border border-surface-card-border px-3 py-1.5 text-xs text-text-tertiary hover:text-text-primary"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Quick navigate</span>
          <kbd className="hidden rounded-sm border border-surface-card-border px-1 text-[10px] sm:inline">
            Ctrl K
          </kbd>
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="rounded-md p-2 text-text-tertiary hover:bg-white/5 hover:text-text-primary"
        >
          <Settings size={18} />
        </button>
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  )
}
