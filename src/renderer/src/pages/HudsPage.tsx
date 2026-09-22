import { useEffect, useState } from 'react'
import { RefreshCw, Upload, ChevronDown, Copy, MonitorPlay, MonitorX } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'

const sampleHud = {
  id: 'match-5v5-demo',
  name: 'MPview',
  version: 'V1.0.0',
  verified: true,
  author: 'twitch.tv/shlneo'
}

export default function HudsPage(): React.JSX.Element {
  const [variantsOpen, setVariantsOpen] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)

  useEffect(() => {
    window.api.isHudOpen(sampleHud.id).then(setOverlayOpen)

    return window.api.onHudStatusChanged((status) => {
      if (status.hudId === sampleHud.id) setOverlayOpen(status.open)
    })
  }, [])

  async function handleLaunch(): Promise<void> {
    await window.api.launchHud(sampleHud.id)
    setOverlayOpen(true)
  }

  async function handleClose(): Promise<void> {
    await window.api.closeHud(sampleHud.id)
    setOverlayOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="HUDs"
        subtitle="Manage and launch your custom HUDs."
        actions={
          <>
            <Button>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button variant="primary">
              <Upload size={14} />
              Import HUD (.zip)
            </Button>
          </>
        }
      />

      <div className="rounded-lg border border-panel-border bg-panel">
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-panel-border bg-white/5">
            <MonitorPlay size={20} className="text-zinc-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{sampleHud.name}</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-300">
                {sampleHud.version}
              </span>
              {sampleHud.verified && (
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-zinc-500">Author: {sampleHud.author}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <Button onClick={() => setVariantsOpen((v) => !v)}>
                Variants
                <ChevronDown size={14} className={variantsOpen ? 'rotate-180' : ''} />
              </Button>
              <Button>Panel</Button>
              <Button variant="primary" onClick={handleLaunch}>
                Launch Overlay
              </Button>
              {overlayOpen && (
                <Button onClick={handleClose}>
                  <MonitorX size={14} />
                  Close Overlay
                </Button>
              )}
            </div>
            <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300">
              <Copy size={12} />
              Copy URL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
