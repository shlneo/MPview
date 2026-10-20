import { useEffect, useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import { inputClass } from './FormField'

type InstallStatus =
  | { kind: 'idle' }
  | { kind: 'installing' }
  | { kind: 'ok'; path: string }
  | { kind: 'error'; message: string }

interface SettingsModalProps {
  onClose: () => void
}

function SectionTitle({ children }: { children: string }): React.JSX.Element {
  return <p className="mb-2 text-xs font-medium text-zinc-500">{children}</p>
}

function Toggle({
  checked,
  onChange
}: {
  checked: boolean
  onChange: (value: boolean) => void
}): React.JSX.Element {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-white/15'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

export default function SettingsModal({ onClose }: SettingsModalProps): React.JSX.Element {
  const [autoSwitchSides, setAutoSwitchSides] = useState(true)
  const [steamPath, setSteamPath] = useState('')
  const [status, setStatus] = useState<InstallStatus>({ kind: 'idle' })

  useEffect(() => {
    window.api.settings.get().then((settings) => {
      setAutoSwitchSides(settings.autoSwitchSides)
      setSteamPath(settings.steamPath)
    })
  }, [])

  function changeAutoSwitchSides(value: boolean): void {
    setAutoSwitchSides(value)
    window.api.settings.update({ autoSwitchSides: value })
  }

  async function browse(): Promise<void> {
    const folder = await window.api.pickFolder(steamPath || undefined)
    if (folder) {
      setSteamPath(folder)
      setStatus({ kind: 'idle' })
    }
  }

  async function install(): Promise<void> {
    setStatus({ kind: 'installing' })
    const result = await window.api.installGsiConfig(steamPath)
    if (result.ok) {
      await window.api.settings.update({ steamPath })
      setStatus({ kind: 'ok', path: result.path })
    } else {
      setStatus({ kind: 'error', message: result.error })
    }
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      <SectionTitle>Match Automation</SectionTitle>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-100">Auto Switch Sides</p>
          <p className="text-xs text-zinc-500">Automatically flip team sides at halftime</p>
        </div>
        <Toggle checked={autoSwitchSides} onChange={changeAutoSwitchSides} />
      </div>

      <div className="my-4 border-t border-panel-border" />

      <SectionTitle>CS2 Integration</SectionTitle>
      <p className="text-sm font-medium text-zinc-100">Install GSI Config</p>
      <p className="mb-3 text-xs text-zinc-500">
        Select your Steam root folder. The config file will be written to your CS2 cfg directory.
      </p>
      <div className="mb-2 flex gap-2">
        <input
          className={inputClass}
          value={steamPath}
          onChange={(e) => {
            setSteamPath(e.target.value)
            setStatus({ kind: 'idle' })
          }}
          placeholder="C:\Program Files (x86)\Steam"
        />
        <Button onClick={browse}>Browse</Button>
      </div>
      <Button
        variant="primary"
        className="w-full justify-center py-2"
        onClick={install}
        disabled={!steamPath.trim() || status.kind === 'installing'}
      >
        {status.kind === 'installing' ? 'Installing…' : 'Install GSI Config'}
      </Button>

      {status.kind === 'ok' && (
        <p className="mt-2 text-xs break-all text-emerald-400">
          Installed: {status.path}. Restart CS2 to apply.
        </p>
      )}
      {status.kind === 'error' && <p className="mt-2 text-xs text-red-400">{status.message}</p>}
    </Modal>
  )
}
