import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { buttonClass, type ButtonVariant } from '../lib/button'
import { useTheme } from '../lib/theme'

/** Logo : trois colonnes de kanban de hauteur décroissante. */
export function Logo({ withName = true, className = '' }: { withName?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-brand" />
        <rect x="7" y="8" width="5" height="16" rx="1.5" className="fill-on-brand" />
        <rect x="13.5" y="8" width="5" height="11" rx="1.5" className="fill-on-brand" fillOpacity=".75" />
        <rect x="20" y="8" width="5" height="7" rx="1.5" className="fill-on-brand" fillOpacity=".5" />
      </svg>
      {withName && <span className="text-lg font-bold tracking-tight">ApplyTrack</span>}
    </span>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`} {...props} />
}

export function ButtonLink({ to, children, variant = 'primary', size = 'md' }: {
  to: string
  children: ReactNode
  variant?: ButtonVariant
  size?: 'md' | 'lg'
}) {
  return (
    <Link to={to} className={buttonClass(variant, size)}>
      {children}
    </Link>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      className={buttonClass('ghost')}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-surface shadow-sm ring-1 ring-line ${className}`}>{children}</div>
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  )
}
