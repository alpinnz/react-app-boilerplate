import type { ReactNode, SelectHTMLAttributes } from 'react'
import { InputSelect } from '../atoms/InputSelect'
import { GroupForm } from './GroupForm'

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

/** Compatibility wrapper that composes GroupForm and InputSelect. */
export function SelectField({ id, label, hint, error, className = '', children, ...selectProps }: SelectFieldProps) {
  return (
    <GroupForm controlId={id} labelText={label} hintText={hint} errorText={error} className={className}>
      <InputSelect {...selectProps} id={id}>{children}</InputSelect>
    </GroupForm>
  )
}
