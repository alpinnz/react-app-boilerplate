import type { InputHTMLAttributes } from 'react'
import { useGroupFormInput } from '../field-context'
import { Input } from './Input'

type InputSearchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Search input with a leading search icon. */
export function InputSearch({ id, className = '', ...inputProps }: InputSearchProps) {
  const field = useGroupFormInput(inputProps.onChange, inputProps.onInvalid)

  return (
    <div className="relative">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <Input
        {...inputProps}
        id={field.controlId ?? id}
        type="search"
        className={`pl-10 ${className}`}
        aria-describedby={field.getDescribedBy(inputProps['aria-describedby'])}
        aria-invalid={field.isInvalid ? true : inputProps['aria-invalid']}
        onInvalid={field.onInvalid}
        onChange={field.onChange}
      />
    </div>
  )
}
