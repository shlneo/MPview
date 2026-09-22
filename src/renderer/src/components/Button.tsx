import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export default function Button({
  variant = 'ghost',
  className = '',
  children,
  ...rest
}: ButtonProps): React.JSX.Element {
  const base =
    'inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors'
  const variants: Record<string, string> = {
    primary: 'bg-accent-2 text-white hover:bg-accent',
    ghost: 'border border-panel-border bg-white/5 text-zinc-200 hover:bg-white/10'
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
