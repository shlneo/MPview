import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
}

export default function FormField({ label, children }: FormFieldProps): React.JSX.Element {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full rounded-md border border-panel-border bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-accent'
