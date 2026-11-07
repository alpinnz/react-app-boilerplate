import { Button } from '../atoms/Button'
import { Modal } from './Modal'

type ConfirmationDialogProps = {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  isConfirming?: boolean
  onConfirm: () => void
  onDismiss: () => void
}

/** Confirmation copy stays in the shared modal body; decision buttons stay in its footer. */
export function ConfirmationDialog({ title, description, confirmLabel, cancelLabel, isConfirming = false, onConfirm, onDismiss }: ConfirmationDialogProps) {
  return <Modal
    role="alertdialog"
    title={title}
    description={description}
    onDismiss={onDismiss}
    canDismiss={!isConfirming}
    footer={<>
      <Button type="button" variant="secondary" disabled={isConfirming} onClick={onDismiss}>{cancelLabel}</Button>
      <Button type="button" variant="danger" disabled={isConfirming} onClick={onConfirm}>{confirmLabel}</Button>
    </>}
  />
}
