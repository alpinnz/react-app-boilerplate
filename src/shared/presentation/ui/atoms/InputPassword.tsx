import { useState, type InputHTMLAttributes } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useGroupFormInput } from '../field-context'
import { IconButton } from './IconButton'
import { Input } from './Input'

type InputPasswordProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Password input with an accessible show and hide control. */
export function InputPassword({ id, className = '', disabled, ...inputProps }: InputPasswordProps) {
  const { translate } = useLocalization()
  const field = useGroupFormInput(inputProps.onChange, inputProps.onInvalid)
  const [isVisible, setIsVisible] = useState(false)
  const controlId = field.controlId ?? id

  return (
    <div className="relative">
      <Input
        {...inputProps}
        id={controlId}
        type={isVisible ? 'text' : 'password'}
        disabled={disabled}
        className={`pr-12 ${className}`}
        aria-describedby={field.getDescribedBy(inputProps['aria-describedby'])}
        aria-invalid={field.isInvalid ? true : inputProps['aria-invalid']}
        onInvalid={field.onInvalid}
        onChange={field.onChange}
      />
      <IconButton
        type="button"
        aria-label={translate(isVisible ? 'common.hidePassword' : 'common.showPassword')}
        aria-pressed={isVisible}
        aria-controls={controlId}
        disabled={disabled}
        variant="neutral"
        className="!absolute right-1 top-1/2 -translate-y-1/2 hover:!bg-canvas focus-visible:!outline-offset-1"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {!isVisible && <path d="m4 4 16 16" />}
        </svg>
      </IconButton>
    </div>
  )
}
