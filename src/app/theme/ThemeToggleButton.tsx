import { useLocalization } from '@valfuse-node/react'
import { IconButton } from '@/shared/presentation/ui/atoms/IconButton'
import { useThemePreference } from './theme'

/** Compact theme control used on public authentication pages. */
export function ThemeToggleButton() {
  const { translate } = useLocalization()
  const { mode, toggleMode } = useThemePreference()
  const isDarkMode = mode === 'dark'
  const label = translate(isDarkMode ? 'app.switchToLightMode' : 'app.switchToDarkMode')

  return (
    <IconButton type="button" aria-label={label} title={label} variant="neutral-bordered" onClick={toggleMode}>
      {isDarkMode ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.6 8.6 0 1 0 20.2 15.4Z" />
        </svg>
      )}
    </IconButton>
  )
}
