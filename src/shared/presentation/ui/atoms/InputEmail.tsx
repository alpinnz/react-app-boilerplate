import type { InputHTMLAttributes } from 'react'
import { useGroupFormInput } from '../field-context'
import { Input } from './Input'

type InputEmailProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Email input with native email validation and GroupForm accessibility. */
export function InputEmail({ id, ...inputProps }: InputEmailProps) {
  const field = useGroupFormInput(inputProps.onChange, inputProps.onInvalid)

  return (
    <Input
      {...inputProps}
      id={field.controlId ?? id}
      type="email"
      aria-describedby={field.getDescribedBy(inputProps['aria-describedby'])}
      aria-invalid={field.isInvalid ? true : inputProps['aria-invalid']}
      onInvalid={field.onInvalid}
      onChange={field.onChange}
    />
  )
}
