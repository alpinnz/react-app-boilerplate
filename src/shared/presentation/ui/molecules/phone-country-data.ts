import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js'

export type PhoneCountryOption = {
  isoCode: CountryCode
  name: string
  callingCode: string
}

export function getPhoneCountryOptions(locale: string): PhoneCountryOption[] {
  const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
  return getCountries()
    .map((isoCode) => ({
      isoCode,
      name: displayNames.of(isoCode) ?? isoCode,
      callingCode: `+${getCountryCallingCode(isoCode)}`,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, locale, { sensitivity: 'base' }))
}
