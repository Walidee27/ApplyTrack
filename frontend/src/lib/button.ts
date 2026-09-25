export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'signal' | 'ghost' | 'danger'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover',
  secondary: 'border border-ink text-ink hover:border-brand hover:text-brand',
  /** Bordure discrète, pour les actions secondaires des barres de navigation */
  outline: 'border border-line-strong text-ink hover:border-brand hover:text-brand',
  /** Contour jaune signalisation : l'accès à la démo */
  signal: 'border border-brand text-brand hover:bg-brand hover:text-on-brand',
  ghost: 'text-ink-muted hover:text-brand',
  danger: 'text-danger hover:bg-danger-soft',
}

/** Classes d'un bouton, réutilisables sur un <button> comme sur un lien : angles droits, monospace, capitales. */
export function buttonClass(variant: ButtonVariant = 'primary', size: 'md' | 'lg' = 'md') {
  const sizes = size === 'lg' ? 'px-6 py-4 text-sm' : 'px-3.5 py-2.5 text-xs'
  return `inline-flex items-center justify-center gap-2 font-mono font-bold tracking-wider uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${sizes} ${VARIANTS[variant]}`
}
