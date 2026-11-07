import { createContext } from 'react'

export type ToastTone = 'default' | 'success' | 'info' | 'warning' | 'error'

export type ToastInput = {
  tone: ToastTone
  title: string
  description: string
}

export type ToastContextValue = { showToast: (toast: ToastInput) => void }

export const ToastContext = createContext<ToastContextValue | null>(null)
