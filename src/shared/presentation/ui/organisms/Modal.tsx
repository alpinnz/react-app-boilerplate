import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Dialog modal native yang mengelola fokus dan mengirim permintaan tutup.
 * Escape tidak menutup dialog ketika `canDismiss` bernilai false.
 */
export function Modal({ titleId, descriptionId, onDismiss, canDismiss = true, children }: {
  titleId: string
  descriptionId?: string
  onDismiss: () => void
  canDismiss?: boolean
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-surface border border-line bg-surface p-5 text-content shadow-popover backdrop:bg-overlay backdrop:backdrop-blur-[2px] sm:p-6"
      onCancel={(event) => {
        event.preventDefault()
        if (canDismiss) onDismiss()
      }}
    >
      {children}
    </dialog>
  )
}
