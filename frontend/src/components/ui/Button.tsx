import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none min-h-11'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-accent-violet to-accent-magenta text-white shadow-card hover:brightness-110 active:scale-[0.98]',
  secondary:
    'border border-surface-card-border bg-surface-card text-text-primary hover:border-accent-magenta/40 active:scale-[0.98]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-[0.98]',
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
