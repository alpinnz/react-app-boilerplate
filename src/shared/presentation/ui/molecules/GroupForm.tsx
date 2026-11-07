import { useState, type ReactNode } from 'react'
import { GroupFormFieldContext } from '../field-context'

type GroupFormProps = {
  controlId: string
  labelText: string
  hintText?: string
  errorText?: string
  labelVisibility?: 'visible' | 'sr-only'
  className?: string
  children: ReactNode
}

/** Owns a form control's label, hint, and validation message. */
export function GroupForm({
  controlId,
  labelText,
  hintText,
  errorText,
  labelVisibility = 'visible',
  className = '',
  children,
}: GroupFormProps) {
  const [nativeError, setNativeError] = useState('')
  const visibleError = errorText || nativeError
  const fieldContext = {
    controlId,
    hintText,
    visibleError: visibleError || undefined,
    setNativeError,
    clearNativeError: () => setNativeError(''),
  }

  return (
    <GroupFormFieldContext.Provider value={fieldContext}>
      <div className={`grid gap-field ${className}`}>
        <label htmlFor={controlId} className={labelVisibility === 'sr-only' ? 'sr-only' : 'text-app-label-medium text-content'}>{labelText}</label>
        {children}
        {hintText && <p id={`${controlId}-hint`} className="text-app-body-small-regular text-content-muted">{hintText}</p>}
        {visibleError && <p id={`${controlId}-error`} role="alert" className="text-app-body-small-medium text-danger">{visibleError}</p>}
      </div>
    </GroupFormFieldContext.Provider>
  )
}
