import type { CameraRotation } from '../types'

const OPTIONS: CameraRotation[] = [0, 90, 180, 270]

interface RotationPickerProps {
  value: CameraRotation
  onChange: (rotation: CameraRotation) => void
}

export default function RotationPicker({
  value,
  onChange
}: RotationPickerProps): React.JSX.Element {
  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((deg) => (
        <button
          key={deg}
          type="button"
          onClick={() => onChange(deg)}
          className={`flex-1 rounded-md border px-2 py-1.5 text-sm transition-colors ${
            value === deg
              ? 'border-accent bg-accent/15 text-white'
              : 'border-panel-border bg-white/5 text-zinc-400 hover:bg-white/10'
          }`}
        >
          {deg}°
        </button>
      ))}
    </div>
  )
}
