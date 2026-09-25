import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { buttonClass, type ButtonVariant } from '../lib/button'

/** Pictogramme avion, en trait, dans la couleur de signalisation. */
export function PlaneIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-brand ${className}`}
      aria-hidden="true"
    >
      <path d="M2 16l20-7-3 9-6-2-3 4-1-5z" />
    </svg>
  )
}

export function Logo({ withName = true, className = '' }: { withName?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <PlaneIcon />
      {withName && (
        <span className="text-xl font-extrabold tracking-wide uppercase" style={{ fontStretch: '75%' }}>
          ApplyTrack
        </span>
      )}
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

export function ButtonLink({ to, children, variant = 'primary', size = 'md', className = '' }: {
  to: string
  children: ReactNode
  variant?: ButtonVariant
  size?: 'md' | 'lg'
  className?: string
}) {
  return (
    <Link to={to} className={`${buttonClass(variant, size)} ${className}`}>
      {children}
    </Link>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`border border-line bg-surface ${className}`}>{children}</div>
}

/** Chiffres sur palettes, comme les panneaux à affichage rabattable. */
export function FlapDigits({ value, unit, accent = false }: { value: string; unit?: string; accent?: boolean }) {
  return (
    <span className="flex items-end gap-1" aria-label={unit ? `${value} ${unit}` : value}>
      {[...value].map((char, index) =>
        /[0-9]/.test(char) ? (
          <span
            key={index}
            aria-hidden="true"
            className={`flex h-14 w-10 items-center justify-center border-t border-line-strong bg-surface-muted font-mono text-4xl font-bold sm:h-[4.5rem] sm:w-[3.25rem] sm:text-5xl ${accent ? 'text-brand' : ''}`}
          >
            {char}
          </span>
        ) : (
          <span key={index} aria-hidden="true" className={`font-mono text-4xl font-bold sm:text-5xl ${accent ? 'text-brand' : ''}`}>
            {char}
          </span>
        ),
      )}
      {unit && (
        <span aria-hidden="true" className="pl-1.5 font-mono text-2xl text-ink-faint">
          {unit}
        </span>
      )}
    </span>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  )
}
