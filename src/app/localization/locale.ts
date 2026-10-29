import { localStorageStrategy } from '@valfuse-node/react'

export const localeStorage = localStorageStrategy({ key: 'app-locale' })

export function getRequestLanguage(): string {
  const locale = localeStorage.get()
  return locale === 'en' ? 'en' : 'id'
}
