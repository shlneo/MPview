import { useState } from 'react'
import { RefreshCw, Upload, ChevronDown, Copy } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'

const sampleHud = {
  name: 'JTs Hud',
  version: 'V1.0.8',
  verified: true,
  author: 'twitch.tv/jtmythic'
}

export default function HudsPage(): React.JSX.Element {
  const [variantsOpen, setVariantsOpen] = useState(false)

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
          <img
            src="https://api.dicebear.com/9.x/thumbs/svg?seed=jtshud"
            alt=""
            className="h-12 w-12 rounded-md object-cover"
          />

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
              <Button variant="primary">Launch Overlay</Button>
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
