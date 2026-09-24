import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, error, id, ...inputProps }: TextFieldProps) {
  const inputId = id ?? inputProps.name
  return (
    <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
      {label}
      <input
        id={inputId}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        aria-invalid={error ? true : undefined}
        {...inputProps}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  )
}
