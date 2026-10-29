import { useEffect } from 'react'
import { useLocalization } from '@valfuse-node/react'

/** Compact, keyboard-accessible locale toggle shared by public and authenticated layouts. */
export function LanguageSwitcher() {
  const { locale, setLocale, translate } = useLocalization()
  const selectedClasses = 'bg-action text-on-action shadow-sm'
  const idleClasses = 'text-content-muted hover:bg-canvas hover:text-content'

  useEffect(() => { document.documentElement.lang = locale }, [locale])

  return <div role="group" aria-label={translate('common.language')} className="inline-flex min-h-11 shrink-0 items-center gap-0 rounded-control border border-line bg-surface p-0 shadow-sm sm:gap-1 sm:p-1">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="ml-0.5 size-4 shrink-0 text-action sm:ml-1"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18" /></svg>
    <button type="button" aria-label={translate('common.indonesian')} aria-pressed={locale === 'id'} title={translate('common.indonesian')} className={`grid min-h-9 min-w-8 place-items-center rounded-control px-1 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus sm:min-w-9 sm:px-2 ${locale === 'id' ? selectedClasses : idleClasses}`} onClick={() => setLocale('id')}>ID</button>
    <button type="button" aria-label={translate('common.english')} aria-pressed={locale === 'en'} title={translate('common.english')} className={`grid min-h-9 min-w-8 place-items-center rounded-control px-1 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus sm:min-w-9 sm:px-2 ${locale === 'en' ? selectedClasses : idleClasses}`} onClick={() => setLocale('en')}>EN</button>
  </div>
}
