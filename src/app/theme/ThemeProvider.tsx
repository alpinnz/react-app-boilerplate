import { useCallback, useLayoutEffect, useState, type ReactNode } from 'react'
import { ThemeContext, readStoredTheme, saveTheme, type ThemeMode } from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readStoredTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode
    saveTheme(mode)
  }, [mode])

  const toggleMode = useCallback(() => {
    setMode((currentMode) => currentMode === 'light' ? 'dark' : 'light')
  }, [])

  return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>
}
