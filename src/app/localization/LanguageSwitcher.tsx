import { useEffect } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useLocalization } from '@valfuse-node/react'
import { Button } from '@/shared/presentation/ui/atoms/Button'

type LanguageSwitcherProps = {
  variant?: 'menu' | 'segmented'
}

/** Shared language control with a compact menu and a visible auth-page selector. */
export function LanguageSwitcher({ variant = 'menu' }: LanguageSwitcherProps) {
  const { locale, setLocale, translate } = useLocalization()
  const currentLanguage = locale === 'id' ? translate('common.indonesian') : translate('common.english')
  const buttonLabel = `${locale.toUpperCase()}, ${translate('common.changeLanguage')}`

  useEffect(() => { document.documentElement.lang = locale }, [locale])

  if (variant === 'segmented') {
    return (
      <div role="group" aria-label={translate('common.changeLanguage')} className="grid w-full max-w-sm grid-cols-2 gap-1 rounded-control border border-line bg-canvas p-1">
        <Button
          type="button"
          lang="id"
          aria-pressed={locale === 'id'}
          variant="tertiary"
          className={`!min-h-10 !min-w-0 !px-2 !py-0 focus-visible:!outline-offset-1 ${locale === 'id' ? '!bg-surface !text-action !text-app-button-text-semi-bold' : '!text-content-muted hover:!bg-surface/70 hover:!text-content'}`}
          onClick={() => setLocale('id')}
        >
          {translate('common.indonesian')}
        </Button>
        <Button
          type="button"
          lang="en"
          aria-pressed={locale === 'en'}
          variant="tertiary"
          className={`!min-h-10 !min-w-0 !px-2 !py-0 focus-visible:!outline-offset-1 ${locale === 'en' ? '!bg-surface !text-action !text-app-button-text-semi-bold' : '!text-content-muted hover:!bg-surface/70 hover:!text-content'}`}
          onClick={() => setLocale('en')}
        >
          {translate('common.english')}
        </Button>
      </div>
    )
  }

  return (
    <Menu as="div" className="relative shrink-0">
      <MenuButton
        as={Button}
        type="button"
        aria-label={buttonLabel}
        title={`${buttonLabel} (${currentLanguage})`}
        variant="neutral-bordered"
        className="!min-h-10 !gap-1.5 !px-2.5 !py-2"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-content-muted">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" />
        </svg>
        <span>{locale.toUpperCase()}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-content-muted">
          <path d="m6 8 4 4 4-4" />
        </svg>
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        modal={false}
        transition
        className="z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-surface border border-line bg-surface p-1.5 shadow-popover outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none"
      >
        <p className="px-3 pb-1 pt-2 text-app-label-semi-bold text-content-muted">{translate('common.changeLanguage')}</p>
        <MenuItem
          as={Button}
          type="button"
          aria-current={locale === 'id' ? 'true' : undefined}
          variant="neutral"
          className={`!min-h-10 !w-full !justify-between !gap-3 !px-3 !py-2 !text-left !text-app-body-regular-medium data-focus:!bg-canvas ${locale === 'id' ? '!text-app-body-regular-semi-bold !text-action' : '!text-content'}`}
          onClick={() => setLocale('id')}
        >
          {translate('common.indonesian')}
          {locale === 'id' && <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m4 10 4 4 8-8" /></svg>}
        </MenuItem>
        <MenuItem
          as={Button}
          type="button"
          aria-current={locale === 'en' ? 'true' : undefined}
          variant="neutral"
          className={`!min-h-10 !w-full !justify-between !gap-3 !px-3 !py-2 !text-left !text-app-body-regular-medium data-focus:!bg-canvas ${locale === 'en' ? '!text-app-body-regular-semi-bold !text-action' : '!text-content'}`}
          onClick={() => setLocale('en')}
        >
          {translate('common.english')}
          {locale === 'en' && <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m4 10 4 4 8-8" /></svg>}
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
