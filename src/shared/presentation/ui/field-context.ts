import { createContext, useContext, type ChangeEventHandler, type FormEvent, type FormEventHandler } from 'react'
import { useLocalization } from '@valfuse-node/react'

export type GroupFormFieldContext = {
  controlId: string
  hintText?: string
  visibleError?: string
  setNativeError: (message: string) => void
  clearNativeError: () => void
}

export const GroupFormFieldContext = createContext<GroupFormFieldContext | null>(null)

export function useGroupFormField() {
  return useContext(GroupFormFieldContext)
}

export function useGroupFormInput(onChange?: ChangeEventHandler<HTMLInputElement>, onInvalid?: FormEventHandler<HTMLInputElement>) {
  const field = useGroupFormField()
  const { translate, format } = useLocalization()

  function handleInvalid(event: FormEvent<HTMLInputElement>) {
    event.preventDefault()
    const input = event.currentTarget
    const { validity } = input
    if (validity.valueMissing) field?.setNativeError(translate('common.fieldRequired'))
    else if (validity.typeMismatch && input.type === 'email') field?.setNativeError(translate('common.fieldEmailInvalid'))
    else if (validity.tooShort) field?.setNativeError(format('common.fieldMinLength', { min: input.minLength }))
    else if (validity.tooLong) field?.setNativeError(format('common.fieldMaxLength', { max: input.maxLength }))
    else if (validity.patternMismatch || validity.badInput) field?.setNativeError(translate('common.fieldPatternInvalid'))
    else if (validity.rangeUnderflow || validity.rangeOverflow || validity.stepMismatch) field?.setNativeError(translate('common.fieldRangeInvalid'))
    else field?.setNativeError(input.validationMessage)
    onInvalid?.(event)
  }

  function handleChange(event: Parameters<ChangeEventHandler<HTMLInputElement>>[0]) {
    field?.clearNativeError()
    onChange?.(event)
  }

  function getDescribedBy(externalDescription?: string) {
    return [
      externalDescription,
      field?.hintText ? `${field.controlId}-hint` : undefined,
      field?.visibleError ? `${field.controlId}-error` : undefined,
    ].filter(Boolean).join(' ') || undefined
  }

  return {
    controlId: field?.controlId,
    isInvalid: Boolean(field?.visibleError),
    getDescribedBy,
    onChange: handleChange,
    onInvalid: handleInvalid,
  }
}

export function useGroupFormSelect(onChange?: ChangeEventHandler<HTMLSelectElement>, onInvalid?: FormEventHandler<HTMLSelectElement>) {
  const field = useGroupFormField()
  const { translate } = useLocalization()

  function handleInvalid(event: FormEvent<HTMLSelectElement>) {
    event.preventDefault()
    field?.setNativeError(event.currentTarget.validity.valueMissing ? translate('common.fieldRequired') : event.currentTarget.validationMessage)
    onInvalid?.(event)
  }

  function handleChange(event: Parameters<ChangeEventHandler<HTMLSelectElement>>[0]) {
    field?.clearNativeError()
    onChange?.(event)
  }

  function getDescribedBy(externalDescription?: string) {
    return [
      externalDescription,
      field?.hintText ? `${field.controlId}-hint` : undefined,
      field?.visibleError ? `${field.controlId}-error` : undefined,
    ].filter(Boolean).join(' ') || undefined
  }

  return {
    controlId: field?.controlId,
    isInvalid: Boolean(field?.visibleError),
    getDescribedBy,
    onChange: handleChange,
    onInvalid: handleInvalid,
  }
}
