import { Modal } from '@/components/ui/Modal'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-text-primary">{label}</span>
        <span className="block text-xs text-text-tertiary">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-9 shrink-0 cursor-pointer accent-accent-violet"
        aria-label={label}
      />
    </label>
  )
}

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [reducedMotion, setReducedMotion] = useLocalStorageState('settings.reducedMotion', false)
  const [soundEnabled, setSoundEnabled] = useLocalStorageState('settings.soundEnabled', true)
  const [compactDensity, setCompactDensity] = useLocalStorageState('settings.compactDensity', false)

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="divide-y divide-surface-card-border">
        <ToggleRow
          label="Reduce motion"
          description="Minimize animations across the app, in addition to your OS setting."
          checked={reducedMotion}
          onChange={setReducedMotion}
        />
        <ToggleRow
          label="Sound effects"
          description="Play short sounds on moves and round results (not yet implemented)."
          checked={soundEnabled}
          onChange={setSoundEnabled}
        />
        <ToggleRow
          label="Compact density"
          description="Reduce card and list spacing."
          checked={compactDensity}
          onChange={setCompactDensity}
        />
      </div>
      <p className="mt-4 text-xs text-text-tertiary">
        Preferences are stored only in this browser and are not yet wired into gameplay behavior.
      </p>
    </Modal>
  )
}
