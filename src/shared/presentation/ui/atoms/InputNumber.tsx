import type { InputHTMLAttributes } from 'react'
import { useGroupFormInput } from '../field-context'
import { Input } from './Input'

type InputNumberProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Numeric input that inherits validation state from GroupForm. */
export function InputNumber({ id, ...inputProps }: InputNumberProps) {
  const field = useGroupFormInput(inputProps.onChange, inputProps.onInvalid)

  return (
    <Input
      {...inputProps}
      id={field.controlId ?? id}
      type="number"
      aria-describedby={field.getDescribedBy(inputProps['aria-describedby'])}
      aria-invalid={field.isInvalid ? true : inputProps['aria-invalid']}
      onInvalid={field.onInvalid}
      onChange={field.onChange}
    />
  )
}
