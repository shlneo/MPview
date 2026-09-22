export default function TitleBar(): React.JSX.Element {
  return (
    <div
      className="flex h-9 shrink-0 items-center border-b border-panel-border bg-panel/80 px-3 text-xs text-zinc-500"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      MPView
    </div>
  )
}
