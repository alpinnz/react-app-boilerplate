import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes } from 'react'
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useLocalization } from '@valfuse-node/react'
import type { CountryCode } from 'libphonenumber-js'
import 'country-flag-icons/3x2/flags.css'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { useGroupFormField, useGroupFormInput } from '../field-context'
import { GroupForm } from './GroupForm'
import { Modal } from '../organisms/Modal'
import type { PhoneCountryOption } from './phone-country-data'

type PhoneInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'type' | 'value' | 'onChange' | 'onInvalid'> & {
  id?: string
  name?: string
  countryCodeName?: string
  phoneNumber: string
  countryCode: string
  onPhoneNumberChange: (phoneNumber: string) => void
  onCountryCodeChange: (countryCode: string) => void
}

function normalizeCallingCode(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

function normalizeCountrySearch(value: string, locale: string) {
  return value.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function CountryFlag({ isoCode }: { isoCode: CountryCode }) {
  return <span aria-hidden="true" className={`flag:${isoCode} inline-block shrink-0 rounded-[2px] ring-1 ring-line`} style={{ '--CountryFlagIcon-height': '1rem' } as CSSProperties} />
}

/** Controlled phone input whose country picker updates the parent's calling-code value. */
export function InputPhoneNumber({
  id,
  name = 'phone_number',
  countryCodeName,
  phoneNumber,
  countryCode,
  onPhoneNumberChange,
  onCountryCodeChange,
  autoComplete = 'tel-national',
  className = '',
  disabled,
  ...inputProps
}: PhoneInputProps) {
  const { locale, translate, format } = useLocalization()
  const field = useGroupFormField()
  const inputValidation = useGroupFormInput(onPhoneNumberInput)
  const controlId = inputValidation.controlId ?? id
  const [selectedIsoCode, setSelectedIsoCode] = useState<CountryCode | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState<PhoneCountryOption[]>([])
  const [countryListStatus, setCountryListStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [countryListRetry, setCountryListRetry] = useState(0)
  const normalizedCallingCode = normalizeCallingCode(countryCode)
  useEffect(() => {
    let isActive = true
    void import('./phone-country-data')
      .then(({ getPhoneCountryOptions }) => {
        if (!isActive) return
        setCountries(getPhoneCountryOptions(locale))
        setCountryListStatus('ready')
      })
      .catch(() => {
        if (isActive) setCountryListStatus('error')
      })
    return () => { isActive = false }
  }, [countryListRetry, locale])
  const defaultCountry = countries.find((country) => country.isoCode === 'ID') ?? countries[0]
  const rememberedCountry = selectedIsoCode ? countries.find((country) => country.isoCode === selectedIsoCode) : undefined
  const selectedCountry = rememberedCountry && (!normalizedCallingCode || rememberedCountry.callingCode === normalizedCallingCode)
    ? rememberedCountry
    : normalizedCallingCode
      ? countries.find((country) => country.callingCode === normalizedCallingCode)
      : defaultCountry
  const visibleCallingCode = selectedCountry?.callingCode ?? (normalizedCallingCode || defaultCountry?.callingCode || '+62')
  const displayedIsoCode = selectedCountry?.isoCode ?? (!normalizedCallingCode || normalizedCallingCode === '+62' ? 'ID' : undefined)
  const searchTerm = normalizeCountrySearch(query.trim(), locale)
  const filteredCountries = useMemo(() => {
    const matches = countries.filter((country) => {
      if (!searchTerm) return true
      return normalizeCountrySearch(country.name, locale).includes(searchTerm) ||
        normalizeCountrySearch(country.isoCode, locale).includes(searchTerm) ||
        country.callingCode.includes(searchTerm)
    })
    if (searchTerm || !selectedCountry) return matches
    return [selectedCountry, ...matches.filter((country) => country.isoCode !== selectedCountry.isoCode)]
  }, [countries, locale, searchTerm, selectedCountry])
  const countryButtonLabel = format('common.changeCountryCode', {
    country: selectedCountry?.name ?? (displayedIsoCode === 'ID' ? 'Indonesia' : translate('common.unknown')),
    code: visibleCallingCode,
  })

  function onPhoneNumberInput(event: ChangeEvent<HTMLInputElement>) {
    const nextPhoneNumber = event.currentTarget.value
    const nextCallingCode = nextPhoneNumber.trim() ? visibleCallingCode : ''
    onPhoneNumberChange(nextPhoneNumber)
    if (countryCode !== nextCallingCode) onCountryCodeChange(nextCallingCode)
  }

  function openCountryPicker() {
    setQuery('')
    setIsPickerOpen(true)
  }

  function closeCountryPicker() {
    setIsPickerOpen(false)
    setQuery('')
  }

  function retryCountryList() {
    setCountryListStatus('loading')
    setCountryListRetry((attempt) => attempt + 1)
  }

  function selectCountry(isoCode: CountryCode | null) {
    if (!isoCode) return
    const country = countries.find((option) => option.isoCode === isoCode)
    if (!country) return
    const nextCallingCode = phoneNumber.trim() ? country.callingCode : ''
    setSelectedIsoCode(country.isoCode)
    if (countryCode !== nextCallingCode) onCountryCodeChange(nextCallingCode)
    closeCountryPicker()
  }

  return (
    <>
      <div className={`flex h-10 w-full overflow-hidden rounded-control border bg-surface transition-colors focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/20 ${field?.visibleError ? 'border-danger' : 'border-line-strong'} ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}>
        <Button
          type="button"
          aria-label={countryButtonLabel}
          aria-haspopup="dialog"
          aria-expanded={isPickerOpen}
          disabled={disabled}
          variant="neutral"
          className="!h-10 !min-h-10 !shrink-0 !justify-start !gap-2 !rounded-none !border-r !border-line !bg-canvas/70 !px-3 !py-2 !text-content hover:!bg-action-soft/60 focus-visible:!z-10 focus-visible:!outline-offset-[-2px]"
          onClick={openCountryPicker}
        >
          {displayedIsoCode ? <CountryFlag isoCode={displayedIsoCode as CountryCode} /> : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-4 text-content-muted"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></svg>}
          <span>{visibleCallingCode}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-content-muted"><path d="m5 7.5 5 5 5-5" /></svg>
        </Button>
        <Input
          {...inputProps}
          id={controlId}
          name={name}
          type="tel"
          autoComplete={autoComplete}
          inputMode="tel"
          value={phoneNumber}
          disabled={disabled}
          aria-describedby={inputValidation.getDescribedBy(inputProps['aria-describedby'])}
          aria-invalid={inputValidation.isInvalid ? true : inputProps['aria-invalid']}
          className="!h-10 min-w-0 flex-1 !rounded-none !border-0 !bg-transparent !px-3 !py-2 !outline-none focus:!border-0 focus:!ring-0 aria-invalid:!border-0"
          onInvalid={inputValidation.onInvalid}
          onChange={inputValidation.onChange}
        />
      </div>
      {countryCodeName && <input type="hidden" name={countryCodeName} value={phoneNumber.trim() ? countryCode : ''} />}
      {isPickerOpen && <Modal
        title={translate('common.phoneCountryPickerTitle')}
        description={translate('common.phoneCountryPickerDescription')}
        onDismiss={closeCountryPicker}
        mobilePresentation="sheet"
        footer={<Button type="button" variant="secondary" onClick={closeCountryPicker}>{translate('common.close')}</Button>}
      >
        <Combobox value={selectedCountry?.isoCode ?? null} onChange={selectCountry}>
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-content-muted">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <GroupForm controlId="country-search" labelText={translate('common.searchCountries')} labelVisibility="sr-only">
              <ComboboxInput
                id="country-search"
                autoFocus
                displayValue={() => ''}
                placeholder={translate('common.searchCountries')}
                className="block h-10 w-full rounded-control border border-line-strong bg-surface py-2 pl-10 pr-3 text-app-body-regular-regular text-content placeholder:text-content-muted focus:border-focus focus:ring-2 focus:ring-focus/20 focus:outline-none"
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
            </GroupForm>
          </div>
          <ComboboxOptions static className="mt-2 max-h-[min(38dvh,24rem)] overflow-y-auto rounded-control border border-line bg-surface py-1 shadow-popover focus:outline-none">
            {countryListStatus === 'loading' ? (
              <p role="status" className="px-3 py-4 text-center text-app-body-small-regular text-content-muted">{translate('common.loadingCountries')}</p>
            ) : countryListStatus === 'error' ? (
              <div className="grid justify-items-center gap-2 px-3 py-4 text-center">
                <p role="alert" className="text-app-body-small-regular text-content-muted">{translate('common.countryListUnavailable')}</p>
                <Button type="button" variant="tertiary" size="small" onClick={retryCountryList}>{translate('common.retry')}</Button>
              </div>
            ) : filteredCountries.length === 0 ? (
              <p className="px-3 py-4 text-center text-app-body-small-regular text-content-muted">{translate('common.noCountriesFound')}</p>
            ) : filteredCountries.map((country) => (
              <ComboboxOption
                key={country.isoCode}
                value={country.isoCode}
                className={({ focus, selected }) => `flex min-h-10 cursor-pointer items-center gap-3 px-3 py-2 text-left text-app-body-regular-medium transition-colors ${focus ? 'bg-action-soft text-action' : 'text-content'} ${selected ? 'text-app-body-regular-semi-bold' : ''}`}
              >
                {({ selected }) => <>
                  <CountryFlag isoCode={country.isoCode} />
                  <span className="min-w-0 flex-1 truncate">{country.name} <span className="text-content-muted">({country.callingCode})</span></span>
                  {selected && <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-action"><path d="m4 10 4 4 8-8" /></svg>}
                </>}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      </Modal>}
    </>
  )
}
