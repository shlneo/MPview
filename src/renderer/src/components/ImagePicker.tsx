import { ImagePlus } from 'lucide-react'

interface ImagePickerProps {
  value: string
  onChange: (dataUrl: string) => void
  label: string
  rounded?: boolean
}

export default function ImagePicker({
  value,
  onChange,
  label,
  rounded = true
}: ImagePickerProps): React.JSX.Element {
  async function handlePick(): Promise<void> {
    const dataUrl = await window.api.pickImage()
    if (dataUrl) onChange(dataUrl)
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-panel-border bg-white/5 ${
          rounded ? 'rounded-full' : 'rounded-md'
        }`}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus size={18} className="text-zinc-600" />
        )}
      </div>
      <button
        type="button"
        onClick={handlePick}
        className="rounded-md border border-panel-border bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10"
      >
        {label}
      </button>
    </div>
  )
}
