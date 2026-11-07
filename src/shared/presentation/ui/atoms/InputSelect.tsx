import type { ReactNode, SelectHTMLAttributes } from 'react'
import { useGroupFormSelect } from '../field-context'

type InputSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode
}

/** Native select control that inherits validation state from GroupForm. */
export function InputSelect({ id, className = '', children, ...selectProps }: InputSelectProps) {
  const field = useGroupFormSelect(selectProps.onChange, selectProps.onInvalid)

  return (
    <select
      {...selectProps}
      id={field.controlId ?? id}
      aria-describedby={field.getDescribedBy(selectProps['aria-describedby'])}
      aria-invalid={field.isInvalid ? true : selectProps['aria-invalid']}
      onInvalid={field.onInvalid}
      onChange={field.onChange}
      className={`block h-10 min-w-0 w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-app-body-regular-regular text-content focus:border-focus focus:ring-2 focus:ring-focus/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger ${className}`}
    >
      {children}
    </select>
  )
}
