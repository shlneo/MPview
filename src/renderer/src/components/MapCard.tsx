import { useEffect, useState } from 'react'
import { Ban, Check, Hourglass, MapPin, Star } from 'lucide-react'
import type { MapInfo } from '../mapPool'

export type MapCardState = 'available' | 'banned' | 'picked' | 'decider' | 'pending'

interface MapCardProps {
  map: MapInfo
  state: MapCardState
  clickable: boolean
  teamLabel?: string
  deciderText?: string
  onClick?: () => void
}

export default function MapCard({
  map,
  state,
  clickable,
  teamLabel,
  deciderText = 'Decider',
  onClick
}: MapCardProps): React.JSX.Element {
  const inactive = state === 'banned'

  // Заводская картинка из public/maps/ — если файла для этой карты нет,
  // остаётся градиент-заглушка вместо сломанной иконки.
  const [defaultImageFailed, setDefaultImageFailed] = useState(false)
  useEffect(() => setDefaultImageFailed(false), [map.defaultImage])

  const resolvedImage = !defaultImageFailed ? map.defaultImage : undefined

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className={`group relative flex aspect-[3/4.2] flex-col justify-end overflow-hidden rounded-xl border text-left transition-all duration-150 ${
        clickable
          ? 'cursor-pointer border-panel-border hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/20'
          : 'cursor-default border-panel-border'
      } ${state === 'picked' ? 'ring-2 ring-emerald-400' : ''} ${
        state === 'decider' ? 'ring-2 ring-amber-400' : ''
      } ${state === 'pending' ? 'ring-2 ring-accent animate-pulse' : ''}`}
      style={resolvedImage ? undefined : { background: map.gradient }}
    >
      {resolvedImage ? (
        <img
          src={resolvedImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setDefaultImageFailed(true)}
        />
      ) : (
        // лёгкая текстура поверх градиента-плейсхолдера, чтобы карточка не выглядела плоской заливкой
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(255,255,255,.25) 0 2px, transparent 2px 10px)'
          }}
        />
      )}

      {inactive && <div className="absolute inset-0 bg-black/70" />}

      <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80">
        <MapPin size={10} />
        Active Duty
      </div>

      {state === 'banned' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-red-400">
          <Ban size={26} />
          <span className="text-xs font-bold uppercase tracking-wider">Banned</span>
        </div>
      )}

      {state === 'decider' && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">
          <Star size={10} />
          {deciderText}
        </div>
      )}

      {state === 'picked' && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-emerald-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">
          <Check size={10} />
          Pick
        </div>
      )}

      {state === 'pending' && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
          <Hourglass size={10} />
          Side?
        </div>
      )}

      <div className="relative bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8">
        <p className="text-base font-bold uppercase tracking-wide text-white drop-shadow">
          {map.name}
        </p>
        {teamLabel && (
          <p className="mt-0.5 text-[11px] font-medium text-white/70">{teamLabel}</p>
        )}
      </div>
    </button>
  )
}
