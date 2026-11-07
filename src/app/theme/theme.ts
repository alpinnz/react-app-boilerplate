import { createContext, useContext } from 'react'

export type ThemeMode = 'light' | 'dark'

type ThemePreference = {
  mode: ThemeMode
  toggleMode: () => void
}

export const ThemeContext = createContext<ThemePreference | null>(null)

export function useThemePreference() {
  const preference = useContext(ThemeContext)
  if (!preference) throw new Error('ThemeProvider belum dipasang.')
  return preference
}

export function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'

  try {
    return window.localStorage.getItem('app-theme') === 'dark' ? 'dark' : 'light'
  } catch (error) {
    console.warn('Unable to read the saved theme preference; using light mode.', error)
    return 'light'
  }
}

export function saveTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem('app-theme', mode)
  } catch (error) {
    console.warn('Unable to save the theme preference.', error)
  }
}
