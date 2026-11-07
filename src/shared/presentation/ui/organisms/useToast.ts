import { useContext } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { ToastContext } from './ToastContext'

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('ToastProvider belum dipasang.')
  return context
}

export function useFailureToast() {
  const { showToast } = useToast()
  const { translate } = useLocalization()
  const localizeMessage = useLocalizedMessage()

  return (message: string) => showToast({
    tone: 'error',
    title: translate('common.actionFailed'),
    description: localizeMessage(message),
  })
}
