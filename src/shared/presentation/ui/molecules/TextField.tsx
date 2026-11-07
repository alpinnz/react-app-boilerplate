import type { InputHTMLAttributes, ReactNode } from 'react'
import { InputEmail } from '../atoms/InputEmail'
import { InputNumber } from '../atoms/InputNumber'
import { InputPassword } from '../atoms/InputPassword'
import { InputSearch } from '../atoms/InputSearch'
import { InputText } from '../atoms/InputText'
import { GroupForm } from './GroupForm'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  id: string
  label: string
  type?: 'email' | 'number' | 'password' | 'search' | 'text'
  hint?: string
  error?: string
}

/** Compatibility wrapper that selects a specialized input inside GroupForm. */
export function TextField({ id, label, type = 'text', hint, error, className = '', ...inputProps }: TextFieldProps) {
  let control: ReactNode

  if (type === 'password') control = <InputPassword {...inputProps} id={id} />
  else if (type === 'email') control = <InputEmail {...inputProps} id={id} />
  else if (type === 'search') control = <InputSearch {...inputProps} id={id} />
  else if (type === 'number') control = <InputNumber {...inputProps} id={id} />
  else control = <InputText {...inputProps} id={id} />

  return (
    <GroupForm controlId={id} labelText={label} hintText={hint} errorText={error} className={className}>
      {control}
    </GroupForm>
  )
}
