import type { InputHTMLAttributes } from 'react'
import { fieldClass, labelClass } from '../lib/form'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, error, id, ...inputProps }: TextFieldProps) {
  const inputId = id ?? inputProps.name
  return (
    <label htmlFor={inputId} className={labelClass}>
      {label}
      <input id={inputId} className={fieldClass} aria-invalid={error ? true : undefined} {...inputProps} />
      {error && <span className="mt-1 block text-xs font-normal text-danger">{error}</span>}
    </label>
  )
}
