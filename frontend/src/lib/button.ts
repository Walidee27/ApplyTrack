export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover shadow-sm',
  secondary: 'bg-surface text-ink ring-1 ring-line hover:bg-surface-muted',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  danger: 'text-danger hover:bg-danger-soft',
}

/** Classes d'un bouton, réutilisables sur un <button> comme sur un lien. */
export function buttonClass(variant: ButtonVariant = 'primary', size: 'md' | 'lg' = 'md') {
  const sizes = size === 'lg' ? 'px-5 py-3 text-base' : 'px-3.5 py-2 text-sm'
  return `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${sizes} ${VARIANTS[variant]}`
}
