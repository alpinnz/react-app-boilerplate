import type { InputHTMLAttributes } from 'react'
import { useGroupFormInput } from '../field-context'
import { Input } from './Input'

type InputTextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Plain text input that inherits validation state from GroupForm. */
export function InputText({ id, ...inputProps }: InputTextProps) {
  const field = useGroupFormInput(inputProps.onChange, inputProps.onInvalid)

  return (
    <Input
      {...inputProps}
      id={field.controlId ?? id}
      type="text"
      aria-describedby={field.getDescribedBy(inputProps['aria-describedby'])}
      aria-invalid={field.isInvalid ? true : inputProps['aria-invalid']}
      onInvalid={field.onInvalid}
      onChange={field.onChange}
    />
  )
}
