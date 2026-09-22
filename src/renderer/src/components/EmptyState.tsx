import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-panel-border py-20 text-center">
      <Icon size={28} className="mb-3 text-zinc-600" />
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-zinc-500">{description}</p>
    </div>
  )
}
