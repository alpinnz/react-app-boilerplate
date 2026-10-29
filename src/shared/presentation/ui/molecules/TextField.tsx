import type { InputHTMLAttributes } from 'react'
import { Input } from '../atoms/Input'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string
  label: string
  hint?: string
}

/** Menggabungkan label, input, dan hint yang terhubung secara aksesibel. */
export function TextField({ id, label, hint, className = '', ...inputProps }: Props) {
  const descriptionId = hint ? `${id}-hint` : undefined

  return (
    <div className={`grid gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-content">{label}</label>
      <Input id={id} aria-describedby={descriptionId} {...inputProps} />
      {hint && <p id={descriptionId} className="text-xs leading-relaxed text-content-muted">{hint}</p>}
    </div>
  )
}
